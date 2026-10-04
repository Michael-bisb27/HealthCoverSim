import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function QuoteList() {
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchQuotes = async () => {
        try {
            setLoading(true);
            const res = await fetch('http://localhost:5001/api/quotes');
            if (!res.ok) throw new Error('Failed to load quotes');
            const data = await res.json();
            setQuotes(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuotes();
    }, []);

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete quote for ${name}?`)) return;
        try {
            const res = await fetch(`http://localhost:5001/api/quotes/${id}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error('Failed to delete quote');
            setQuotes(quotes.filter((q) => q.id !== id));
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) return <div className="card">Loading quotes...</div>;
    if (error) return <div className="alert-danger">Error: {error}</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2>Saved Health Insurance Quotes</h2>
                <Link to="/create" className="btn btn-primary">
                    + New Quote
                </Link>
            </div>

            {quotes.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>No quotes generated yet.</p>
                    <Link to="/create" className="btn btn-primary">Create Your First Quote</Link>
                </div>
            ) : (
                <div className="card table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Cover Type</th>
                                <th>Hospital / Extras</th>
                                <th>Payment</th>
                                <th>Est. Monthly</th>
                                <th>Est. Yearly</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quotes.map((q) => (
                                <tr key={q.id}>
                                    <td>
                                        <strong>{q.customer_name}</strong>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {new Date(q.created_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td>
                                        <span className="badge badge-info">{q.cover_type}</span>
                                    </td>
                                    <td>
                                        {q.hospital_cover} / {q.extras_cover}
                                    </td>
                                    <td>
                                        {q.payment_frequency}
                                        {q.payment_frequency === 'Yearly' && q.annual_discount > 0 && ` (${q.annual_discount}% off)`}
                                    </td>
                                    <td>${q.breakdown?.monthly_premium.toFixed(2)}</td>
                                    <td>
                                        <strong>
                                            ${q.payment_frequency === 'Yearly'
                                                ? q.breakdown?.yearly_after_discount.toFixed(2)
                                                : q.breakdown?.yearly_before_discount.toFixed(2)}
                                        </strong>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <Link to={`/quotes/${q.id}`} className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '0.8rem' }}>
                                                View
                                            </Link>
                                            <Link to={`/quotes/${q.id}/edit`} className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '0.8rem' }}>
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(q.id, q.customer_name)}
                                                className="btn btn-danger"
                                                style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default QuoteList;