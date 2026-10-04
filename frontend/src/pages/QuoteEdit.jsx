import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function QuoteEdit() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchQuote = async () => {
            try {
                const res = await fetch(`http://localhost:5001/api/quotes/${id}`);
                if (!res.ok) throw new Error('Quote not found');
                const data = await res.json();
                setFormData({
                    ...data.quote,
                    applicant2_age: data.quote.applicant2_age ?? '30',
                    applicant2_cover_history: data.quote.applicant2_cover_history ?? 'Yes'
                });
            } catch (err) {
                setErrors([err.message]);
            } finally {
                setLoading(false);
            }
        };
        fetchQuote();
    }, [id]);

    if (loading) return <div className="card">Loading quote for editing...</div>;
    if (!formData) return <div className="alert-danger">Quote not found.</div>;

    const isCoupleOrFamily = formData.cover_type === 'Couple' || formData.cover_type === 'Family';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrors([]);

        try {
            const res = await fetch(`http://localhost:5001/api/quotes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.errors ? data.errors.join(', ') : data.error || 'Update failed');
            }
            navigate(`/quotes/${id}`);
        } catch (err) {
            setErrors([err.message]);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="card">
            <h2>Edit Quote #{id}</h2>

            {errors.length > 0 && (
                <div className="alert-danger">
                    <ul style={{ marginLeft: '20px' }}>
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
                </div>

                <div className="card" style={{ background: '#f8fafc', padding: '16px' }}>
                    <h3>Applicant 1 Details</h3>
                    <div className="grid-2">
                        <div className="form-group">
                            <label>Applicant 1 Age *</label>
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
                            <label>Cover History *</label>
                            <select name="applicant1_cover_history" value={formData.applicant1_cover_history} onChange={handleChange}>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                                <option value="Not sure">Not sure</option>
                            </select>
                        </div>
                    </div>
                </div>

                {isCoupleOrFamily && (
                    <div className="card" style={{ background: '#f8fafc', padding: '16px' }}>
                        <h3>Applicant 2 Details</h3>
                        <div className="grid-2">
                            <div className="form-group">
                                <label>Applicant 2 Age *</label>
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
                                <label>Cover History *</label>
                                <select name="applicant2_cover_history" value={formData.applicant2_cover_history} onChange={handleChange}>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                    <option value="Not sure">Not sure</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid-2">
                    <div className="form-group">
                        <label>Hospital Cover Tier</label>
                        <select name="hospital_cover" value={formData.hospital_cover} onChange={handleChange}>
                            <option value="None">None</option>
                            <option value="Basic">Basic</option>
                            <option value="Bronze">Bronze</option>
                            <option value="Silver">Silver</option>
                            <option value="Gold">Gold</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Extras Cover Tier</label>
                        <select name="extras_cover" value={formData.extras_cover} onChange={handleChange}>
                            <option value="None">None</option>
                            <option value="Basic">Basic</option>
                            <option value="Standard">Standard</option>
                            <option value="Premium">Premium</option>
                        </select>
                    </div>
                </div>

                <div className="grid-2">
                    <div className="form-group">
                        <label>Payment Frequency</label>
                        <select name="payment_frequency" value={formData.payment_frequency} onChange={handleChange}>
                            <option value="Monthly">Monthly</option>
                            <option value="Yearly">Yearly</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Annual Discount % (0–10)</label>
                        <input
                            type="number"
                            name="annual_discount"
                            value={formData.annual_discount}
                            onChange={handleChange}
                            min="0"
                            max="10"
                            step="0.5"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Notes</label>
                    <textarea
                        name="notes"
                        rows="3"
                        value={formData.notes || ''}
                        onChange={handleChange}
                    ></textarea>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? 'Updating...' : 'Save Changes'}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => navigate(`/quotes/${id}`)}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default QuoteEdit;