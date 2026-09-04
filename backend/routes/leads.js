const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const db = require('../db/db');
const { verifyAdmin } = require('../middleware/auth');
const nodemailer = require('nodemailer');

// Lead Scoring Engine
function calculateLeadScore(lead) {
  let score = 0;

  // 1. Budget scoring
  const budget = lead.budget || '';
  if (budget.includes('> 5 Cr') || budget.toLowerCase().includes('above 5 cr') || budget.toLowerCase().includes('above_5cr')) {
    score += 50;
  } else if (budget.includes('2 Cr - 5 Cr') || budget.toLowerCase().includes('2cr_5cr')) {
    score += 40;
  } else if (budget.includes('1 Cr - 2 Cr') || budget.toLowerCase().includes('1cr_2cr')) {
    score += 30;
  } else {
    score += 15; // Under 1 Cr or other
  }

  // 2. Timeline scoring
  const timeline = lead.timeline || '';
  if (timeline === 'Immediate') {
    score += 30;
  } else if (timeline.includes('3 Months')) {
    score += 20;
  } else if (timeline.includes('6 Months')) {
    score += 10;
  } else {
    score += 5; // Just Exploring
  }

  // 3. Property Type scoring
  const propType = lead.propertyType || '';
  if (propType.toLowerCase().includes('commercial')) {
    score += 20;
  } else if (propType.toLowerCase().includes('villa')) {
    score += 15;
  } else if (propType.toLowerCase().includes('apartment') || propType.toLowerCase().includes('flat')) {
    score += 10;
  } else {
    score += 5; // Plot or other
  }

  return score;
}

// Nodemailer setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: process.env.SMTP_PORT || 2525,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
});

// Mock/Simulate WhatsApp integration
function sendAdminWhatsAppAlert(lead) {
  console.log(`\n--- 📱 WHATSAPP LEAD ALERT (ADMIN) ---`);
  console.log(`To: Admin (+91 99999 99999)`);
  console.log(`Message: 🔥 NEW HIGH VALUE LEAD ALERT!`);
  console.log(`Name: ${lead.name}`);
  console.log(`Phone: ${lead.phone}`);
  console.log(`Budget: ${lead.budget}`);
  console.log(`Location: ${lead.location}`);
  console.log(`Timeline: ${lead.timeline}`);
  console.log(`Lead Score: ${lead.score}/100`);
  console.log(`-------------------------------------\n`);
}

// Mock/Simulate Email confirmation logs
async function sendClientEmailConfirmation(lead) {
  const mailOptions = {
    from: '"KPC Ventures" <consulting@kpcventures.in>',
    to: lead.email,
    subject: 'Consultation Request Confirmed | KPC Ventures',
    html: `
      <div style="font-family: 'Montserrat', 'Helvetica', Arial, sans-serif; background-color: #0A192F; color: #FFFFFF; padding: 40px; border-radius: 8px; max-width: 600px; margin: 0 auto; border: 1px solid #D4AF37;">
        <div style="text-align: center; border-bottom: 2px solid #D4AF37; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="color: #D4AF37; margin: 0; font-size: 28px; letter-spacing: 2px;">KPC VENTURES</h1>
          <p style="color: #F5F5F5; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin: 5px 0 0 0;">Luxury Real Estate Advisory</p>
        </div>
        <p style="font-size: 16px; line-height: 1.6; color: #F5F5F5;">Dear ${lead.name},</p>
        <p style="font-size: 16px; line-height: 1.6; color: #F5F5F5;">Thank you for scheduling a private advisory session with KPC Ventures. We have received your investment preferences and are matching you with an expert consultant.</p>
        
        <div style="background-color: rgba(212, 175, 55, 0.08); border-left: 4px solid #D4AF37; padding: 20px; margin: 25px 0; border-radius: 4px;">
          <h3 style="color: #D4AF37; margin-top: 0; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">Your Preferences Summary</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #FFFFFF;">
            <tr>
              <td style="padding: 6px 0; color: #D4AF37; font-weight: bold; width: 40%;">Property Type:</td>
              <td style="padding: 6px 0;">${lead.propertyType}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #D4AF37; font-weight: bold;">Preferred Location:</td>
              <td style="padding: 6px 0;">${lead.location} (${lead.city})</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #D4AF37; font-weight: bold;">Target Budget:</td>
              <td style="padding: 6px 0;">${lead.budget}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #D4AF37; font-weight: bold;">Investment Timeline:</td>
              <td style="padding: 6px 0;">${lead.timeline}</td>
            </tr>
          </table>
        </div>
        
        <p style="font-size: 15px; line-height: 1.6; color: #CCCCCC;">A senior advisor will contact you within the next 3 business hours to present initial curated recommendations and finalize our meeting itinerary.</p>
        
        <div style="text-align: center; margin-top: 40px; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 20px;">
          <p style="font-size: 12px; color: #888888; margin: 0;">&copy; 2026 KPC Ventures. All rights reserved.</p>
          <p style="font-size: 11px; color: #666666; margin: 5px 0 0 0;">New Delhi | Mumbai | Dubai</p>
        </div>
      </div>
    `
  };

  try {
    if (process.env.SMTP_USER) {
      await transporter.sendMail(mailOptions);
      console.log(`✉️ Email confirmation sent to: ${lead.email}`);
    } else {
      console.log(`\n--- ✉️ SIMULATED NODEMAILER LOG ---`);
      console.log(`To: ${lead.email}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log(`Body (Pre-rendered html text simulated)`);
      console.log(`------------------------------------\n`);
    }
  } catch (error) {
    console.error('Nodemailer error during confirmation send:', error.message);
  }
}

// 1. Submit Lead
router.post('/', async (req, res) => {
  const { name, email, phone, city, budget, propertyType, purpose, location, timeline, requirements } = req.body;

  if (!name || !email || !phone || !city || !budget || !propertyType || !purpose || !location || !timeline) {
    return res.status(400).json({ message: 'All required consultation fields must be provided.' });
  }

  const score = calculateLeadScore({ budget, timeline, propertyType });

  try {
    let savedLead = null;

    if (db.useLocalDb) {
      const leads = db.getLocalData('leads');
      savedLead = {
        _id: 'lead_' + Date.now().toString(),
        name,
        email,
        phone,
        city,
        budget,
        propertyType,
        purpose,
        location,
        timeline,
        requirements,
        status: 'New',
        score,
        createdAt: new Date().toISOString()
      };
      leads.push(savedLead);
      db.saveLocalData('leads', leads);
    } else {
      savedLead = await Lead.create({
        name,
        email,
        phone,
        city,
        budget,
        propertyType,
        purpose,
        location,
        timeline,
        requirements,
        score
      });
    }

    // Trigger Integrations
    sendAdminWhatsAppAlert(savedLead);
    sendClientEmailConfirmation(savedLead);

    res.status(201).json({
      message: 'Consultation preferences submitted successfully. An advisor will contact you shortly.',
      lead: savedLead
    });
  } catch (error) {
    console.error('Lead creation error:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// 2. Fetch Leads (Admin Only) - Shows highest scores first
router.get('/', verifyAdmin, async (req, res) => {
  try {
    let leads = [];

    if (db.useLocalDb) {
      leads = db.getLocalData('leads');
    } else {
      leads = await Lead.find();
    }

    // Server-side filtering
    const { search, budget, propertyType, city } = req.query;
    let filteredLeads = [...leads];

    if (search) {
      const q = search.toLowerCase();
      filteredLeads = filteredLeads.filter(l => 
        l.name.toLowerCase().includes(q) || 
        l.email.toLowerCase().includes(q) || 
        l.phone.includes(q) || 
        l.location.toLowerCase().includes(q)
      );
    }

    if (budget) {
      filteredLeads = filteredLeads.filter(l => l.budget === budget);
    }

    if (propertyType) {
      filteredLeads = filteredLeads.filter(l => l.propertyType === propertyType);
    }

    if (city) {
      filteredLeads = filteredLeads.filter(l => l.city.toLowerCase() === city.toLowerCase());
    }

    // Default sorting: score (descending), then createdAt (descending)
    filteredLeads.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json(filteredLeads);
  } catch (error) {
    console.error('Fetch leads error:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// 3. CSV Export (Admin Only)
router.get('/export', verifyAdmin, async (req, res) => {
  try {
    let leads = [];

    if (db.useLocalDb) {
      leads = db.getLocalData('leads');
    } else {
      leads = await Lead.find();
    }

    leads.sort((a, b) => b.score - a.score || new Date(b.createdAt) - new Date(a.createdAt));

    let csvContent = 'Name,Email,Phone,City,Budget,Property Type,Purpose,Preferred Location,Timeline,Requirements,Score,Status,Created At\n';
    leads.forEach(l => {
      const sanitizedRequirements = (l.requirements || '').replace(/"/g, '""').replace(/\n/g, ' ');
      csvContent += `"${l.name}","${l.email}","${l.phone}","${l.city}","${l.budget}","${l.propertyType}","${l.purpose}","${l.location}","${l.timeline}","${sanitizedRequirements}",${l.score},"${l.status}","${new Date(l.createdAt).toLocaleDateString()}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=kpc_consultation_leads.csv');
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('CSV export error:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// 4. Update Lead Status (Admin Only)
router.patch('/:id/status', verifyAdmin, async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  if (!status || !['New', 'Contacted', 'Interested', 'Closed'].includes(status)) {
    return res.status(400).json({ message: 'A valid status is required (New, Contacted, Interested, Closed).' });
  }

  try {
    if (db.useLocalDb) {
      const leads = db.getLocalData('leads');
      const leadIndex = leads.findIndex(l => l._id === id);
      if (leadIndex === -1) {
        return res.status(404).json({ message: 'Lead not found.' });
      }
      leads[leadIndex].status = status;
      db.saveLocalData('leads', leads);
      return res.json(leads[leadIndex]);
    } else {
      const lead = await Lead.findByIdAndUpdate(id, { status }, { new: true });
      if (!lead) {
        return res.status(404).json({ message: 'Lead not found.' });
      }
      return res.json(lead);
    }
  } catch (error) {
    console.error('Update lead status error:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// 5. Delete Lead (Admin Only)
router.delete('/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    if (db.useLocalDb) {
      const leads = db.getLocalData('leads');
      const filteredLeads = leads.filter(l => l._id !== id);
      if (leads.length === filteredLeads.length) {
        return res.status(404).json({ message: 'Lead not found.' });
      }
      db.saveLocalData('leads', filteredLeads);
      return res.json({ message: 'Lead deleted successfully.' });
    } else {
      const lead = await Lead.findByIdAndDelete(id);
      if (!lead) {
        return res.status(404).json({ message: 'Lead not found.' });
      }
      return res.json({ message: 'Lead deleted successfully.' });
    }
  } catch (error) {
    console.error('Delete lead error:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
