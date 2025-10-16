const { Customer } = require('../models/customerModel');
const { sendEmail, emailThemes } = require('../config/email');
const sanitizeHtml = require('sanitize-html');

// Validate environment variables
const requiredEnvVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASSWORD'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

// Get all available email themes
const getEmailThemes = async (req, res) => {
  try {
    const themes = Object.keys(emailThemes).map(key => ({
      id: key,
      name: emailThemes[key].name
    }));

    res.status(200).json({
      success: true,
      data: themes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch email themes',
      error: error.message
    });
  }
};

// Preview email template
const previewEmailTemplate = async (req, res) => {
  try {
    const { topic, subject, body, theme = 'modern', recipientName = 'John Doe' } = req.body;

    if (!topic || !subject || !body) {
      return res.status(400).json({
        success: false,
        message: 'Topic, subject, and body are required'
      });
    }

    if (!emailThemes[theme]) {
      return res.status(400).json({
        success: false,
        message: `Invalid theme. Available themes: ${Object.keys(emailThemes).join(', ')}`
      });
    }

    const sanitizedBody = sanitizeHtml(body, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2', 'h3', 'ul', 'ol', 'li']),
      allowedAttributes: { '*': ['style'] }
    });

    const htmlContent = emailThemes[theme].getTemplate(
      topic,
      subject,
      sanitizedBody,
      recipientName
    );

    res.status(200).json({
      success: true,
      message: 'Email template preview generated',
      data: {
        theme,
        html: htmlContent
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate preview',
      error: error.message
    });
  }
};

// Send newsletter to all customers with batch processing
const sendNewsletterToAll = async (req, res) => {
  try {
    const { topic, subject, body, theme = 'modern' } = req.body;

    if (!topic || !subject || !body) {
      return res.status(400).json({
        success: false,
        message: 'Topic, subject, and body are required'
      });
    }

    if (!emailThemes[theme]) {
      return res.status(400).json({
        success: false,
        message: `Invalid theme. Available themes: ${Object.keys(emailThemes).join(', ')}`
      });
    }

    const customers = await Customer.find({});
    if (customers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No customers found to send emails to'
      });
    }

    const sanitizedBody = sanitizeHtml(body, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2', 'h3', 'ul', 'ol', 'li']),
      allowedAttributes: { '*': ['style'] }
    });

    const batchSize = 50; // Process 50 emails at a time to avoid rate limits
    const results = [];
    for (let i = 0; i < customers.length; i += batchSize) {
      const batch = customers.slice(i, i + batchSize);
      const emailPromises = batch.map(async (customer) => {
        if (!customer.email) {
          return { email: 'unknown', name: customer.fullName || 'Unknown', success: false, error: 'Invalid customer email' };
        }

        const htmlContent = emailThemes[theme].getTemplate(
          topic,
          subject,
          sanitizedBody,
          customer.fullName || customer.firstName || customer.email.split('@')[0]
        );

        const result = await sendEmail({
          to: customer.email,
          subject: `${topic}: ${subject}`,
          html: htmlContent
        });

        return {
          email: customer.email,
          name: customer.fullName || customer.firstName || customer.email.split('@')[0],
          success: result.success,
          error: result.error
        };
      });

      const batchResults = await Promise.all(emailPromises);
      results.push(...batchResults);
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    res.status(200).json({
      success: true,
      message: 'Newsletter sent to all customers',
      stats: {
        total: customers.length,
        successful,
        failed
      },
      results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send newsletter',
      error: error.message
    });
  }
};

// Send email to specific customers by email addresses
const sendNewsletterToSpecific = async (req, res) => {
  try {
    const { emails, topic, subject, body, theme = 'modern' } = req.body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of email addresses'
      });
    }

    if (!topic || !subject || !body) {
      return res.status(400).json({
        success: false,
        message: 'Topic, subject, and body are required'
      });
    }

    if (!emailThemes[theme]) {
      return res.status(400).json({
        success: false,
        message: `Invalid theme. Available themes: ${Object.keys(emailThemes).join(', ')}`
      });
    }

    const customers = await Customer.find({ email: { $in: emails } });
    if (customers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No customers found with the provided email addresses'
      });
    }

    const sanitizedBody = sanitizeHtml(body, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2', 'h3', 'ul', 'ol', 'li']),
      allowedAttributes: { '*': ['style'] }
    });

    const emailPromises = customers.map(async (customer) => {
      if (!customer.email) {
        return { email: 'unknown', name: customer.fullName || 'Unknown', success: false, error: 'Invalid customer email' };
      }

      const htmlContent = emailThemes[theme].getTemplate(
        topic,
        subject,
        sanitizedBody,
        customer.fullName || customer.firstName || customer.email.split('@')[0]
      );

      const result = await sendEmail({
        to: customer.email,
        subject: `${topic}: ${subject}`,
        html: htmlContent
      });

      return {
        email: customer.email,
        name: customer.fullName || customer.firstName || customer.email.split('@')[0],
        success: result.success,
        error: result.error
      };
    });

    const results = await Promise.all(emailPromises);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const foundEmails = customers.map(c => c.email);
    const notFoundEmails = emails.filter(email => !foundEmails.includes(email));

    res.status(200).json({
      success: true,
      message: 'Newsletter sent to specified customers',
      stats: {
        total: customers.length,
        successful,
        failed,
        notFound: notFoundEmails.length
      },
      notFoundEmails,
      results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send newsletter',
      error: error.message
    });
  }
};

// Send email to customers filtered by service interest
const sendNewsletterByService = async (req, res) => {
  try {
    const { service, topic, subject, body, theme = 'modern' } = req.body;

    if (!service) {
      return res.status(400).json({
        success: false,
        message: 'Service is required'
      });
    }

    if (!topic || !subject || !body) {
      return res.status(400).json({
        success: false,
        message: 'Topic, subject, and body are required'
      });
    }

    if (!emailThemes[theme]) {
      return res.status(400).json({
        success: false,
        message: `Invalid theme. Available themes: ${Object.keys(emailThemes).join(', ')}`
      });
    }

    const customers = await Customer.find({ servicesInterested: { $in: [service] } });
    if (customers.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No customers found interested in ${service}`
      });
    }

    const sanitizedBody = sanitizeHtml(body, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2', 'h3', 'ul', 'ol', 'li']),
      allowedAttributes: { '*': ['style'] }
    });

    const emailPromises = customers.map(async (customer) => {
      if (!customer.email) {
        return { email: 'unknown', name: customer.fullName || 'Unknown', success: false, error: 'Invalid customer email' };
      }

      const htmlContent = emailThemes[theme].getTemplate(
        topic,
        subject,
        sanitizedBody,
        customer.fullName || customer.firstName || customer.email.split('@')[0]
      );

      const result = await sendEmail({
        to: customer.email,
        subject: `${topic}: ${subject}`,
        html: htmlContent
      });

      return {
        email: customer.email,
        name: customer.fullName || customer.firstName || customer.email.split('@')[0],
        success: result.success,
        error: result.error
      };
    });

    const results = await Promise.all(emailPromises);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    res.status(200).json({
      success: true,
      message: `Newsletter sent to customers interested in ${service}`,
      stats: {
        total: customers.length,
        successful,
        failed
      },
      results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send newsletter',
      error: error.message
    });
  }
};

// Send email to customers by IDs (added from previous code for completeness)
const sendNewsletterByIds = async (req, res) => {
  try {
    const { customerIds, topic, subject, body, theme = 'modern' } = req.body;

    if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of customer IDs'
      });
    }

    if (!topic || !subject || !body) {
      return res.status(400).json({
        success: false,
        message: 'Topic, subject, and body are required'
      });
    }

    if (!emailThemes[theme]) {
      return res.status(400).json({
        success: false,
        message: `Invalid theme. Available themes: ${Object.keys(emailThemes).join(', ')}`
      });
    }

    const customers = await Customer.find({ _id: { $in: customerIds } });
    if (customers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No customers found with the provided IDs'
      });
    }

    const sanitizedBody = sanitizeHtml(body, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2', 'h3', 'ul', 'ol', 'li']),
      allowedAttributes: { '*': ['style'] }
    });

    const emailPromises = customers.map(async (customer) => {
      if (!customer.email) {
        return { customerId: customer._id, email: 'unknown', name: customer.fullName || 'Unknown', success: false, error: 'Invalid customer email' };
      }

      const htmlContent = emailThemes[theme].getTemplate(
        topic,
        subject,
        sanitizedBody,
        customer.fullName || customer.firstName || customer.email.split('@')[0]
      );

      const result = await sendEmail({
        to: customer.email,
        subject: `${topic}: ${subject}`,
        html: htmlContent
      });

      return {
        customerId: customer._id,
        email: customer.email,
        name: customer.fullName || customer.firstName || customer.email.split('@')[0],
        success: result.success,
        error: result.error
      };
    });

    const results = await Promise.all(emailPromises);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    res.status(200).json({
      success: true,
      message: 'Newsletter sent to specified customers',
      stats: {
        total: customers.length,
        successful,
        failed
      },
      results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send newsletter',
      error: error.message
    });
  }
};

module.exports = {
  getEmailThemes,
  previewEmailTemplate,
  sendNewsletterToAll,
  sendNewsletterToSpecific,
  sendNewsletterByService,
  sendNewsletterByIds
};