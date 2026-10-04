import React from 'react';
import { Routes, Route, Link, NavLink } from 'react-router-dom';
import QuoteList from './pages/QuoteList';
import QuoteCreate from './pages/QuoteCreate';
import QuoteDetail from './pages/QuoteDetail';
import QuoteEdit from './pages/QuoteEdit';

function App() {
    return (
        <div>
            <header className="navbar">
                <h1>
                    <span>🛡️</span> HealthCoverSim
                </h1>
                <nav className="nav-links">
                    <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
                        All Quotes
                    </NavLink>
                    <NavLink to="/create" className={({ isActive }) => (isActive ? 'active' : '')}>
                        + Create New Quote
                    </NavLink>
                </nav>
            </header>

            <main className="container">
                <Routes>
                    <Route path="/" element={<QuoteList />} />
                    <Route path="/create" element={<QuoteCreate />} />
                    <Route path="/quotes/:id" element={<QuoteDetail />} />
                    <Route path="/quotes/:id/edit" element={<QuoteEdit />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;