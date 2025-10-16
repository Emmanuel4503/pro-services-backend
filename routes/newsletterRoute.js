const express = require('express');
const {
  getEmailThemes,
  sendNewsletterToAll,
  sendNewsletterToSpecific,
  sendNewsletterByService,
  previewEmailTemplate
} = require('../controllers/newsletterController');

const newsletterRouter = express.Router();

// Get all available email themes
newsletterRouter.get('/themes', getEmailThemes);

// Preview email template before sending
newsletterRouter.post('/preview', previewEmailTemplate);

// Send newsletter to all customers
newsletterRouter.post('/send-all', sendNewsletterToAll);

// Send newsletter to specific customers by email addresses
newsletterRouter.post('/send-specific', sendNewsletterToSpecific);

// Send newsletter to customers interested in a specific service
newsletterRouter.post('/send-by-service', sendNewsletterByService);

module.exports = { newsletterRouter };