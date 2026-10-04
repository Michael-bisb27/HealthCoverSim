const express = require('express');
const cors = require('cors');
const db = require('./db');
const { calculateQuoteBreakdown } = require('./calculation');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Validation Helper
function validateQuotePayload(body) {
    const errors = [];
    const {
        customer_name,
        cover_type,
        applicant1_age,
        applicant1_cover_history,
        applicant2_age,
        applicant2_cover_history,
        hospital_cover,
        extras_cover,
        payment_frequency,
        annual_discount
    } = body;

    if (!customer_name || !customer_name.trim()) {
        errors.push('Customer name is required.');
    }

    const validCovers = ['Single', 'Couple', 'Family'];
    if (!validCovers.includes(cover_type)) {
        errors.push('Cover type must be Single, Couple, or Family.');
    }

    const age1 = Number(applicant1_age);
    if (isNaN(age1) || age1 < 18 || age1 > 100) {
        errors.push('Applicant 1 age must be between 18 and 100.');
    }

    const validHistories = ['Yes', 'No', 'Not sure'];
    if (!validHistories.includes(applicant1_cover_history)) {
        errors.push('Applicant 1 cover history must be Yes, No, or Not sure.');
    }

    if (cover_type === 'Couple' || cover_type === 'Family') {
        const age2 = Number(applicant2_age);
        if (isNaN(age2) || age2 < 18 || age2 > 100) {
            errors.push('Applicant 2 age is required and must be between 18 and 100 for Couple and Family covers.');
        }
        if (!validHistories.includes(applicant2_cover_history)) {
            errors.push('Applicant 2 cover history is required for Couple and Family covers.');
        }
    }

    const validHospital = ['None', 'Basic', 'Bronze', 'Silver', 'Gold'];
    if (!validHospital.includes(hospital_cover)) {
        errors.push('Invalid hospital cover tier selected.');
    }

    const validExtras = ['None', 'Basic', 'Standard', 'Premium'];
    if (!validExtras.includes(extras_cover)) {
        errors.push('Invalid extras cover tier selected.');
    }

    const validFreq = ['Monthly', 'Yearly'];
    if (!validFreq.includes(payment_frequency)) {
        errors.push('Payment frequency must be Monthly or Yearly.');
    }

    const discount = Number(annual_discount || 0);
    if (isNaN(discount) || discount < 0 || discount > 10) {
        errors.push('Annual discount must be between 0% and 10%.');
    }

    return errors;
}

// 1. GET ALL QUOTES
app.get('/api/quotes', (req, res) => {
    const sql = 'SELECT * FROM quotes ORDER BY created_at DESC';
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        const results = rows.map((row) => ({
            ...row,
            breakdown: calculateQuoteBreakdown(row)
        }));
        res.json(results);
    });
});

// 2. GET SINGLE QUOTE BY ID
app.get('/api/quotes/:id', (req, res) => {
    const sql = 'SELECT * FROM quotes WHERE id = ?';
    db.get(sql, [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Quote not found' });
        }
        const breakdown = calculateQuoteBreakdown(row);
        res.json({ quote: row, breakdown });
    });
});

// 3. CREATE QUOTE
app.post('/api/quotes', (req, res) => {
    const errors = validateQuotePayload(req.body);
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    const {
        customer_name,
        cover_type,
        applicant1_age,
        applicant1_cover_history,
        applicant2_age,
        applicant2_cover_history,
        hospital_cover,
        extras_cover,
        payment_frequency,
        annual_discount,
        notes
    } = req.body;

    const isSingle = cover_type === 'Single';

    const sql = `
    INSERT INTO quotes (
      customer_name, cover_type,
      applicant1_age, applicant1_cover_history,
      applicant2_age, applicant2_cover_history,
      hospital_cover, extras_cover,
      payment_frequency, annual_discount, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

    const params = [
        customer_name.trim(),
        cover_type,
        Number(applicant1_age),
        applicant1_cover_history,
        isSingle ? null : Number(applicant2_age),
        isSingle ? null : applicant2_cover_history,
        hospital_cover,
        extras_cover,
        payment_frequency,
        Number(annual_discount || 0),
        notes ? notes.trim() : ''
    ];

    db.run(sql, params, function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, message: 'Quote created successfully' });
    });
});

// 4. UPDATE QUOTE
app.put('/api/quotes/:id', (req, res) => {
    const errors = validateQuotePayload(req.body);
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    const {
        customer_name,
        cover_type,
        applicant1_age,
        applicant1_cover_history,
        applicant2_age,
        applicant2_cover_history,
        hospital_cover,
        extras_cover,
        payment_frequency,
        annual_discount,
        notes
    } = req.body;

    const isSingle = cover_type === 'Single';

    const sql = `
    UPDATE quotes SET
      customer_name = ?,
      cover_type = ?,
      applicant1_age = ?,
      applicant1_cover_history = ?,
      applicant2_age = ?,
      applicant2_cover_history = ?,
      hospital_cover = ?,
      extras_cover = ?,
      payment_frequency = ?,
      annual_discount = ?,
      notes = ?
    WHERE id = ?
  `;

    const params = [
        customer_name.trim(),
        cover_type,
        Number(applicant1_age),
        applicant1_cover_history,
        isSingle ? null : Number(applicant2_age),
        isSingle ? null : applicant2_cover_history,
        hospital_cover,
        extras_cover,
        payment_frequency,
        Number(annual_discount || 0),
        notes ? notes.trim() : '',
        req.params.id
    ];

    db.run(sql, params, function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Quote not found' });
        }
        res.json({ message: 'Quote updated successfully' });
    });
});

// 5. DELETE QUOTE
app.delete('/api/quotes/:id', (req, res) => {
    const sql = 'DELETE FROM quotes WHERE id = ?';
    db.run(sql, [req.params.id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Quote not found' });
        }
        res.json({ message: 'Quote deleted successfully' });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});