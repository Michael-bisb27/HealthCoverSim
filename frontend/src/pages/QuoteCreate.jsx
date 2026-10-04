import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function QuoteCreate() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        customer_name: '',
        cover_type: 'Single',
        applicant1_age: '30',
        applicant1_cover_history: 'Yes',
        applicant2_age: '30',
        applicant2_cover_history: 'Yes',
        hospital_cover: 'Basic',
        extras_cover: 'Basic',
        payment_frequency: 'Monthly',
        annual_discount: '0',
        notes: ''
    });

    const [errors, setErrors] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const isCoupleOrFamily = formData.cover_type === 'Couple' || formData.cover_type === 'Family';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const validateFrontend = () => {
        const errs = [];
        if (!formData.customer_name.trim()) errs.push('Customer Name is required.');

        const age1 = Number(formData.applicant1_age);
        if (!age1 || age1 < 18 || age1 > 100) errs.push('Applicant 1 age must be between 18 and 100.');

        if (isCoupleOrFamily) {
            const age2 = Number(formData.applicant2_age);
            if (!age2 || age2 < 18 || age2 > 100) {
                errs.push('Applicant 2 age is required for Couple/Family and must be between 18 and 100.');
            }
            if (!formData.applicant2_cover_history) {
                errs.push('Applicant 2 cover history is required.');
            }
        }

        const discount = Number(formData.annual_discount);
        if (isNaN(discount) || discount < 0 || discount > 10) {
            errs.push('Annual discount must be between 0% and 10%.');
        }

        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const clientErrors = validateFrontend();
        if (clientErrors.length > 0) {
            setErrors(clientErrors);
            window.scrollTo(0, 0);
            return;
        }

        setSubmitting(true);
        setErrors([]);

        try {
            const res = await fetch('http://localhost:5001/api/quotes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.errors ? data.errors.join(', ') : data.error || 'Failed to save quote');
            }
            navigate(`/quotes/${data.id}`);
        } catch (err) {
            setErrors([err.message]);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="card">
            <h2>Generate New Health Insurance Quote</h2>

            {errors.length > 0 && (
                <div className="alert-danger">
                    <strong>Please correct the following:</strong>
                    <ul style={{ marginLeft: '20px', marginTop: '6px' }}>
                        {errors.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Customer Name *</label>
                    <input
                        type="text"
                        name="customer_name"
                        value={formData.customer_name}
                        onChange={handleChange}
                        placeholder="e.g. Michael Janto"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Cover Type *</label>
                    <select name="cover_type" value={formData.cover_type} onChange={handleChange}>
                        <option value="Single">Single (1 Adult)</option>
                        <option value="Couple">Couple (2 Adults)</option>
                        <option value="Family">Family (2 Adults + $30/mo upgrade fee)</option>
                    </select>
                    {formData.cover_type === 'Family' && (
                        <p className="helper-text">Family cover includes dependent children under a flat $30/mo fee.</p>
                    )}
                </div>

                {/* Applicant 1 */}
                <div className="card" style={{ background: '#f8fafc', padding: '16px' }}>
                    <h3>Applicant 1 Details</h3>
                    <div className="grid-2">
                        <div className="form-group">
                            <label>Applicant 1 Age (18–100) *</label>
                            <input
                                type="number"
                                name="applicant1_age"
                                value={formData.applicant1_age}
                                onChange={handleChange}
                                min="18"
                                max="100"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Previous Hospital Cover History? *</label>
                            <select name="applicant1_cover_history" value={formData.applicant1_cover_history} onChange={handleChange}>
                                <option value="Yes">Yes (Had cover before - 0% LHC)</option>
                                <option value="No">No (Subject to LHC if age &gt; 30)</option>
                                <option value="Not sure">Not sure (LHC not applied - Warning given)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Applicant 2 - Conditional Rendering */}
                {isCoupleOrFamily && (
                    <div className="card" style={{ background: '#f8fafc', padding: '16px' }}>
                        <h3>Applicant 2 Details</h3>
                        <div className="grid-2">
                            <div className="form-group">
                                <label>Applicant 2 Age (18–100) *</label>
                                <input
                                    type="number"
                                    name="applicant2_age"
                                    value={formData.applicant2_age}
                                    onChange={handleChange}
                                    min="18"
                                    max="100"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Applicant 2 Cover History? *</label>
                                <select name="applicant2_cover_history" value={formData.applicant2_cover_history} onChange={handleChange}>
                                    <option value="Yes">Yes (Had cover before - 0% LHC)</option>
                                    <option value="No">No (Subject to LHC if age &gt; 30)</option>
                                    <option value="Not sure">Not sure (LHC not applied - Warning given)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Cover Tiers */}
                <div className="grid-2">
                    <div className="form-group">
                        <label>Hospital Cover Tier *</label>
                        <select name="hospital_cover" value={formData.hospital_cover} onChange={handleChange}>
                            <option value="None">None ($0/mo)</option>
                            <option value="Basic">Basic ($90/mo per adult)</option>
                            <option value="Bronze">Bronze ($120/mo per adult)</option>
                            <option value="Silver">Silver ($160/mo per adult)</option>
                            <option value="Gold">Gold ($220/mo per adult)</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Extras Cover Tier *</label>
                        <select name="extras_cover" value={formData.extras_cover} onChange={handleChange}>
                            <option value="None">None ($0/mo)</option>
                            <option value="Basic">Basic ($25/mo per adult)</option>
                            <option value="Standard">Standard ($45/mo per adult)</option>
                            <option value="Premium">Premium ($70/mo per adult)</option>
                        </select>
                    </div>
                </div>

                {/* Payment & Discount */}
                <div className="grid-2">
                    <div className="form-group">
                        <label>Payment Frequency *</label>
                        <select name="payment_frequency" value={formData.payment_frequency} onChange={handleChange}>
                            <option value="Monthly">Monthly</option>
                            <option value="Yearly">Yearly (eligible for annual discount)</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Annual Discount % (0–10%)</label>
                        <input
                            type="number"
                            name="annual_discount"
                            value={formData.annual_discount}
                            onChange={handleChange}
                            min="0"
                            max="10"
                            step="0.5"
                            disabled={formData.payment_frequency === 'Monthly'}
                        />
                        {formData.payment_frequency === 'Monthly' && (
                            <p className="helper-text">Discounts only apply when paying Yearly.</p>
                        )}
                    </div>
                </div>

                <div className="form-group">
                    <label>Notes (optional)</label>
                    <textarea
                        name="notes"
                        rows="3"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Add any specific context or remarks..."
                    ></textarea>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                        {submitting ? 'Calculating...' : 'Calculate and Save Quote'}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default QuoteCreate;