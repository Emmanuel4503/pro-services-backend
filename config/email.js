const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Email themes configuration
const emailThemes = {
  modern: {
    name: 'Modern Gradient',
    getTemplate: (topic, subject, body, recipientName) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
            .email-wrapper { background: #f5f5f5; padding: 40px 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
            .header { 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
              color: white; 
              padding: 40px 30px; 
              text-align: center; 
            }
            .topic { 
              font-size: 12px; 
              text-transform: uppercase; 
              letter-spacing: 2px; 
              opacity: 0.9; 
              margin-bottom: 10px;
              font-weight: 600;
            }
            .subject { 
              font-size: 28px; 
              font-weight: 700; 
              margin: 0;
              line-height: 1.2;
            }
            .content { 
              padding: 40px 30px; 
              background: white;
            }
            .greeting { 
              font-size: 18px; 
              color: #667eea; 
              margin-bottom: 20px;
              font-weight: 600;
            }
            .body-content { 
              color: #555; 
              font-size: 15px; 
              line-height: 1.8;
              margin-bottom: 30px;
            }
            .body-content p { margin-bottom: 15px; }
            .body-content h1, .body-content h2, .body-content h3 { 
              color: #333; 
              margin-top: 25px; 
              margin-bottom: 15px;
            }
            .body-content ul, .body-content ol { 
              margin-left: 20px; 
              margin-bottom: 15px;
            }
            .body-content li { margin-bottom: 8px; }
            .cta-button { 
              display: inline-block; 
              padding: 14px 35px; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white; 
              text-decoration: none; 
              border-radius: 8px; 
              font-weight: 600;
              margin: 20px 0;
              transition: transform 0.2s;
            }
            .footer { 
              background: #f9f9f9; 
              padding: 30px; 
              text-align: center; 
              color: #888; 
              font-size: 13px;
              border-top: 1px solid #eee;
            }
            .footer a { color: #667eea; text-decoration: none; }
            .social-links { margin: 20px 0; }
            .social-links a { 
              display: inline-block; 
              margin: 0 10px; 
              color: #667eea;
              text-decoration: none;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="container">
              <div class="header">
                <div class="topic">${topic}</div>
                <h1 class="subject">${subject}</h1>
              </div>
              <div class="content">
                <div class="greeting">Hi ${recipientName}! 👋</div>
                <div class="body-content">
                  ${body}
                </div>
              </div>
              <div class="footer">
                <div class="social-links">
                  <a href="#">Facebook</a> • 
                  <a href="#">Twitter</a> • 
                  <a href="#">LinkedIn</a> • 
                  <a href="#">Instagram</a>
                </div>
                <p>© ${new Date().getFullYear()} ${process.env.EMAIL_FROM_NAME || 'Digital Marketing Agency'}. All rights reserved.</p>
                <p>You're receiving this email because you submitted an inquiry on our website.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `
  },
  classic: {
    name: 'Classic Professional',
    getTemplate: (topic, subject, body, recipientName) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Georgia, 'Times New Roman', serif; line-height: 1.7; color: #2c3e50; background: #ecf0f1; }
            .email-wrapper { background: #ecf0f1; padding: 40px 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border: 2px solid #34495e; }
            .header { 
              background: #34495e; 
              color: white; 
              padding: 35px 30px; 
              border-bottom: 4px solid #e67e22;
            }
            .topic { 
              font-size: 11px; 
              text-transform: uppercase; 
              letter-spacing: 3px; 
              color: #e67e22; 
              margin-bottom: 12px;
              font-weight: bold;
            }
            .subject { 
              font-size: 26px; 
              font-weight: 700; 
              margin: 0;
              line-height: 1.3;
              font-family: 'Georgia', serif;
            }
            .content { 
              padding: 40px 35px; 
              background: white;
            }
            .greeting { 
              font-size: 17px; 
              color: #34495e; 
              margin-bottom: 25px;
              font-weight: 600;
              font-style: italic;
            }
            .body-content { 
              color: #4a4a4a; 
              font-size: 15px; 
              line-height: 1.8;
              margin-bottom: 30px;
            }
            .body-content p { margin-bottom: 18px; }
            .body-content h1, .body-content h2, .body-content h3 { 
              color: #34495e; 
              margin-top: 30px; 
              margin-bottom: 15px;
              border-bottom: 2px solid #e67e22;
              padding-bottom: 8px;
            }
            .body-content ul, .body-content ol { 
              margin-left: 25px; 
              margin-bottom: 18px;
            }
            .body-content li { margin-bottom: 10px; }
            .cta-button { 
              display: inline-block; 
              padding: 12px 32px; 
              background: #e67e22;
              color: white; 
              text-decoration: none; 
              border: 2px solid #d35400;
              font-weight: 600;
              margin: 20px 0;
              text-transform: uppercase;
              letter-spacing: 1px;
              font-size: 13px;
            }
            .divider {
              height: 2px;
              background: #ecf0f1;
              margin: 30px 0;
            }
            .footer { 
              background: #f8f9fa; 
              padding: 30px 35px; 
              text-align: center; 
              color: #7f8c8d; 
              font-size: 13px;
              border-top: 2px solid #34495e;
            }
            .footer a { color: #e67e22; text-decoration: none; font-weight: 600; }
            .signature {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              font-style: italic;
              color: #7f8c8d;
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="container">
              <div class="header">
                <div class="topic">${topic}</div>
                <h1 class="subject">${subject}</h1>
              </div>
              <div class="content">
                <div class="greeting">Dear ${recipientName},</div>
                <div class="body-content">
                  ${body}
                </div>
                <div class="divider"></div>
                <div class="signature">
                  <strong>Best regards,</strong><br>
                  ${process.env.EMAIL_FROM_NAME || 'Digital Marketing Agency'} Team
                </div>
              </div>
              <div class="footer">
                <p><strong>${process.env.EMAIL_FROM_NAME || 'Digital Marketing Agency'}</strong></p>
                <p style="margin: 15px 0;">
                  <a href="#">Website</a> | 
                  <a href="#">LinkedIn</a> | 
                  <a href="#">Contact Us</a>
                </p>
                <p style="margin-top: 20px;">© ${new Date().getFullYear()} All rights reserved.</p>
                <p style="margin-top: 10px; font-size: 12px;">You received this email because you submitted an inquiry on our website.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `
  }
};

// Inquiry confirmation template
const emailTemplates = {
  inquiry: (customerName, customerEmail) => ({
    subject: 'Thank You for Your Inquiry!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f9f9f9; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { padding: 30px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            h2 { color: #333; margin-bottom: 20px; }
            p { margin-bottom: 15px; }
            ol { margin-left: 20px; margin-bottom: 20px; }
            li { margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>We've Received Your Inquiry! ✅</h1>
            </div>
            <div class="content">
              <h2>Hi ${customerName}!</h2>
              <p>Thank you for reaching out to us! We've received your inquiry and our team will review it shortly.</p>
              <p>We typically respond within 24-48 hours. In the meantime, feel free to explore our services and resources.</p>
              <p><strong>What happens next?</strong></p>
              <ol>
                <li>Our team will review your requirements</li>
                <li>We'll prepare a customized proposal</li>
                <li>One of our specialists will contact you directly</li>
              </ol>
              <p>Looking forward to working with you!</p>
            </div>
            <div class="footer">
              <p>If you have any urgent questions, please don't hesitate to contact us.</p>
              <p>© ${new Date().getFullYear()} ${process.env.EMAIL_FROM_NAME || 'Digital Marketing Agency'}. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  })
};

// Send email function
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME || 'Digital Marketing Agency'} <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '')
    };

    const info = await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      messageId: info.messageId,
      response: info.response
    };
  } catch (error) {
    console.error('Email sending error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  createTransporter,
  emailThemes,
  emailTemplates,
  sendEmail
};