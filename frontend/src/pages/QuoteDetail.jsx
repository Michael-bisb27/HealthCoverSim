import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

function QuoteDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchQuote = async () => {
            try {
                setLoading(true);
                const res = await fetch(`http://localhost:5001/api/quotes/${id}`);
                if (!res.ok) throw new Error('Quote not found');
                const json = await res.json();
                setData(json);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchQuote();
    }, [id]);

    const handleDelete = async () => {
        if (!window.confirm('Delete this quote?')) return;
        try {
            const res = await fetch(`http://localhost:5001/api/quotes/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');
            navigate('/');
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) return <div className="card">Loading quote breakdown...</div>;
    if (error) return <div className="alert-danger">Error: {error}</div>;

    const { quote, breakdown } = data;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                    <h2>Quote Explanation Sheet #{quote.id}</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Prepared for {quote.customer_name} ({quote.cover_type} Cover)</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Link to={`/quotes/${quote.id}/edit`} className="btn btn-secondary">Edit</Link>
                    <button onClick={handleDelete} className="btn btn-danger">Delete</button>
                    <Link to="/" className="btn btn-secondary">Back to List</Link>
                </div>
            </div>

            {/* Mandatory LHC Statement */}
            <div className="legal-notice">
                "{breakdown.required_lhc_statement}"
            </div>

            {/* Warnings */}
            {breakdown.warnings && breakdown.warnings.length > 0 && (
                <div className="alert-warning">
                    <strong>Notice:</strong>
                    <ul style={{ marginLeft: '20px', marginTop: '6px' }}>
                        {breakdown.warnings.map((w, idx) => (
                            <li key={idx}>{w}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Top Estimates */}
            <div className="grid-2" style={{ marginBottom: '24px' }}>
                <div className="stat-box">
                    <div className="title">ESTIMATED MONTHLY PREMIUM</div>
                    <div className="value">${breakdown.monthly_premium.toFixed(2)}</div>
                    <div className="subtitle">Billed once every month</div>
                </div>

                <div className="stat-box">
                    <div className="title">ESTIMATED YEARLY TOTAL</div>
                    <div className="value">
                        ${quote.payment_frequency === 'Yearly'
                            ? breakdown.yearly_after_discount.toFixed(2)
                            : breakdown.yearly_before_discount.toFixed(2)}
                    </div>
                    <div className="subtitle">
                        {quote.payment_frequency === 'Yearly'
                            ? `Includes ${breakdown.annual_discount_pct}% annual payment discount (saved $${(breakdown.yearly_before_discount - breakdown.yearly_after_discount).toFixed(2)})`
                            : 'Before any discounts (Pay yearly to unlock up to 10% discount)'}
                    </div>
                </div>
            </div>

            {/* Detailed Premium Breakdown */}
            <div className="card">
                <h3>Itemized Cost Breakdown</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Line Item</th>
                            <th>Calculation Details</th>
                            <th style={{ textAlign: 'right' }}>Monthly Cost</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <strong>Hospital Cover ({breakdown.hospital_tier})</strong>
                            </td>
                            <td>
                                Base: ${breakdown.hospital_base_rate} / adult / mo.
                                <div>Applicant 1 (Age {quote.applicant1_age}): LHC Loading = {breakdown.app1_lhc_pct}% (${breakdown.app1_hospital_cost.toFixed(2)})</div>
                                {breakdown.adult_count === 2 && (
                                    <div>Applicant 2 (Age {quote.applicant2_age}): LHC Loading = {breakdown.app2_lhc_pct}% (${breakdown.app2_hospital_cost.toFixed(2)})</div>
                                )}
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                                ${breakdown.total_hospital_monthly.toFixed(2)}
                            </td>
                        </tr>

                        <tr>
                            <td>
                                <strong>Extras Cover ({breakdown.extras_tier})</strong>
                            </td>
                            <td>
                                Base: ${breakdown.extras_base_rate} / adult / mo × {breakdown.adult_count} adult(s)
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>LHC does not apply to extras.</div>
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                                ${breakdown.total_extras_monthly.toFixed(2)}
                            </td>
                        </tr>

                        {quote.cover_type === 'Family' && (
                            <tr>
                                <td>
                                    <strong>Family Upgrade Fee</strong>
                                </td>
                                <td>Flat add-on covering dependent children under policy</td>
                                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                                    ${breakdown.family_upgrade_fee.toFixed(2)}
                                </td>
                            </tr>
                        )}

                        <tr style={{ background: '#f8fafc', fontWeight: 'bold' }}>
                            <td>Total Monthly Premium</td>
                            <td>Hospital (${breakdown.total_hospital_monthly.toFixed(2)}) + Extras (${breakdown.total_extras_monthly.toFixed(2)}) + Family Fee (${breakdown.family_upgrade_fee.toFixed(2)})</td>
                            <td style={{ textAlign: 'right', fontSize: '1.1rem', color: 'var(--primary)' }}>
                                ${breakdown.monthly_premium.toFixed(2)}
                            </td>
                        </tr>

                        <tr>
                            <td>Yearly Total (Before Discount)</td>
                            <td>${breakdown.monthly_premium.toFixed(2)} × 12 months</td>
                            <td style={{ textAlign: 'right' }}>
                                ${breakdown.yearly_before_discount.toFixed(2)}
                            </td>
                        </tr>

                        {quote.payment_frequency === 'Yearly' && (
                            <tr style={{ background: '#f0fdf4' }}>
                                <td>
                                    <strong>Annual Payment Discount</strong>
                                </td>
                                <td>{breakdown.annual_discount_pct}% discount applied to yearly total</td>
                                <td style={{ textAlign: 'right', color: 'var(--success)', fontWeight: 'bold' }}>
                                    -${(breakdown.yearly_before_discount - breakdown.yearly_after_discount).toFixed(2)}
                                </td>
                            </tr>
                        )}

                        <tr style={{ background: '#eff6ff', fontWeight: 'bold' }}>
                            <td>Final Payable for Frequency: {quote.payment_frequency}</td>
                            <td>
                                {quote.payment_frequency === 'Yearly'
                                    ? 'Yearly total after annual payment discount'
                                    : 'Billed monthly'}
                            </td>
                            <td style={{ textAlign: 'right', fontSize: '1.2rem', color: 'var(--primary)' }}>
                                ${quote.payment_frequency === 'Yearly'
                                    ? breakdown.yearly_after_discount.toFixed(2) + ' / year'
                                    : breakdown.monthly_premium.toFixed(2) + ' / month'}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Plain English Summary */}
            <div className="card">
                <h3>How This Quote Was Calculated</h3>
                <p style={{ marginTop: '8px', color: '#334155', lineHeight: 1.6 }}>
                    This policy is structured for <strong>{breakdown.adult_count} adult(s)</strong> under <strong>{quote.cover_type} cover</strong>.
                    Hospital cover is set at <strong>{breakdown.hospital_tier}</strong> tier (${breakdown.hospital_base_rate}/mo base per adult).
                    Applicant 1 ({quote.applicant1_age} y/o) has an LHC loading of <strong>{breakdown.app1_lhc_pct}%</strong>.
                    {breakdown.adult_count === 2 && ` Applicant 2 (${quote.applicant2_age} y/o) has an LHC loading of ${breakdown.app2_lhc_pct}%.`}
                    Extras cover is set at <strong>{breakdown.extras_tier}</strong> (${breakdown.extras_base_rate}/mo per adult).
                    {quote.cover_type === 'Family' && ' The flat $30/month family upgrade fee was added automatically.'}
                    {quote.payment_frequency === 'Yearly'
                        ? ` Because the customer selected Yearly payment, a ${breakdown.annual_discount_pct}% annual discount was deducted from the 12-month total.`
                        : ' Since Monthly billing was chosen, no annual upfront discount applies.'}
                </p>
                {quote.notes && (
                    <div style={{ marginTop: '16px', padding: '12px', background: '#f1f5f9', borderRadius: '6px' }}>
                        <strong>Internal Notes:</strong> {quote.notes}
                    </div>
                )}
            </div>
        </div>
    );
}

export default QuoteDetail;