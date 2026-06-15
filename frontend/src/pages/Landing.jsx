import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import Button from '../components/ui/Button';
import './Landing.css';

export default function Landing() {
    return (
        <div className="landing-page">
            {/* Saffron Top Line */}
            <div className="saffron-top-line"></div>

            {/* Moving Background Gradients */}
            <div className="landing-gradients">
                <div className="gradient-saffron"></div>
                <div className="gradient-green"></div>
            </div>

            {/* State Emblem Watermark */}
            <div className="landing-watermark"></div>

            {/* Top Navigation */}
            <header className="landing-header container">
                <div className="landing-brand">
                    <span className="brand-icon">🏛️</span>
                    <h1>BUDGETSETU</h1>
                </div>
                <div className="landing-nav">
                    <Link to="/login" className="landing-nav-link">Login</Link>
                    <Link to="/signup" className="landing-nav-link">Sign Up</Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="landing-main">
                {/* Hero Section */}
                <section className="hero-section container">
                    <h1 className="hero-title">BUDGETSETU</h1>
                    <h2 className="hero-tagline">Smart Public Budget Intelligence for India</h2>
                    <p className="hero-description">
                        AI-powered platform for monitoring government budget allocation, spending patterns, and financial insights across states, districts, and departments.
                    </p>
                    <div className="hero-actions">
                        <Link to="/login">
                            <Button size="lg" className="hero-btn-primary">Login</Button>
                        </Link>
                        <Link to="/signup">
                            <Button size="lg" className="hero-btn-secondary">Create Account</Button>
                        </Link>
                    </div>
                </section>

                {/* Network Visualization */}
                <section className="network-section container">
                    <div className="section-divider">
                        <span className="divider-line"></span>
                        <span className="divider-text">India Budget Intelligence Network</span>
                        <span className="divider-line"></span>
                    </div>

                    <div className="network-visual">
                        <svg className="network-lines" viewBox="0 0 1000 300" preserveAspectRatio="xMidYMid meet">
                            <line x1="250" y1="50" x2="500" y2="150" className="data-line" />
                            <line x1="750" y1="50" x2="500" y2="150" className="data-line" />
                            <line x1="250" y1="250" x2="500" y2="150" className="data-line" />
                            <line x1="750" y1="250" x2="500" y2="150" className="data-line" />
                        </svg>

                        <div className="network-nodes-container">
                            <div className="network-node state-node tl">
                                <span className="dot"></span> Maharashtra
                            </div>
                            <div className="network-node state-node tr">
                                Karnataka <span className="dot"></span>
                            </div>

                            <div className="network-node central-node">
                                <span className="dot center-dot"></span>
                                <div className="central-label">Central Budget</div>
                            </div>

                            <div className="network-node state-node bl">
                                <span className="dot"></span> Gujarat
                            </div>
                            <div className="network-node state-node br">
                                Tamil Nadu <span className="dot"></span>
                            </div>
                        </div>
                    </div>
                </section>

                <hr className="layout-hr" />

                {/* Features Checklist */}
                <section className="features-section container">
                    <h3 className="section-title">Trusted Financial Monitoring System for Government Officials</h3>
                    <div className="features-list">
                        <div className="feature-item">
                            <div className="check-wrapper"><Check size={16} strokeWidth={3} /></div>
                            <span>Track budget allocations</span>
                        </div>
                        <div className="feature-item">
                            <div className="check-wrapper"><Check size={16} strokeWidth={3} /></div>
                            <span>Monitor spending patterns</span>
                        </div>
                        <div className="feature-item">
                            <div className="check-wrapper"><Check size={16} strokeWidth={3} /></div>
                            <span>Detect anomalies using AI</span>
                        </div>
                        <div className="feature-item">
                            <div className="check-wrapper"><Check size={16} strokeWidth={3} /></div>
                            <span>Improve transparency across departments</span>
                        </div>
                    </div>
                </section>

                <hr className="layout-hr" />

                {/* Data Architecture */}
                <section className="data-flow-section container">
                    <h3 className="section-title">Government Data Platform</h3>

                    <div className="flow-primary">
                        <span>States</span>
                        <span className="flow-arrow">→</span>
                        <span>Districts</span>
                        <span className="flow-arrow">→</span>
                        <span>Departments</span>
                    </div>

                    <div className="flow-secondary">
                        <span>Budget Allocation</span>
                        <span className="flow-arrow">→</span>
                        <span>Spending</span>
                        <span className="flow-arrow">→</span>
                        <span>Insights</span>
                    </div>
                </section>

                <hr className="layout-hr" />
            </main>

            {/* Footer */}
            <footer className="landing-footer container">
                <div className="footer-copyright">
                    &copy; 2026 BudgetSetu
                </div>
                <div className="footer-links">
                    <Link to="#">About</Link>
                    <Link to="#">Contact</Link>
                    <Link to="#">Privacy Policy</Link>
                </div>
            </footer>
        </div>
    );
}
