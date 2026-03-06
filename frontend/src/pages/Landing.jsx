import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import './Landing.css';

export default function Landing() {
    return (
        <div className="landing-page">
            {/* Background with animated tricolor gradient and Ashoka Chakra watermark */}
            <div className="landing-background">
                <div className="chakra-watermark"></div>
            </div>

            {/* Top Header */}
            <header className="landing-header container">
                <div className="landing-brand">
                    <h1>BudgetSetu</h1>
                </div>
                <div className="landing-nav">
                    <Link to="/login">
                        <Button variant="outline" size="sm" className="nav-btn">Login</Button>
                    </Link>
                    <Link to="/signup">
                        <Button variant="primary" size="sm" className="nav-btn">Sign Up</Button>
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="landing-main">
                <div className="hero-content container">
                    <h1 className="hero-title animate-fade-in-up">BudgetSetu</h1>
                    <p className="hero-tagline animate-fade-in-up delay-1">
                        "Smart Public Budget Intelligence for India"
                    </p>
                    <p className="hero-subtitle animate-fade-in-up delay-2">
                        AI-powered platform for monitoring government budget allocation,<br />
                        spending patterns, and financial risks across India.
                    </p>

                    <div className="hero-actions animate-fade-in-up delay-3">
                        <Link to="/login">
                            <Button size="lg" variant="primary" className="hero-btn-primary">Login</Button>
                        </Link>
                        <Link to="/signup">
                            <Button size="lg" variant="outline" className="hero-btn-secondary">Create Account</Button>
                        </Link>
                    </div>

                    <div className="hero-visual animate-fade-in delay-4">
                        {/* Subtle abstract data grid/network to convey finance and data */}
                        <div className="abstract-grid">
                            <div className="grid-line horizontal"></div>
                            <div className="grid-line horizontal"></div>
                            <div className="grid-line horizontal"></div>
                            <div className="grid-line vertical"></div>
                            <div className="grid-line vertical"></div>
                            <div className="grid-line vertical"></div>
                            <div className="data-node"></div>
                            <div className="data-node"></div>
                            <div className="data-node"></div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer with tricolor divider */}
            <footer className="landing-footer">
                <div className="tricolor-divider">
                    <div className="color-saffron"></div>
                    <div className="color-white"></div>
                    <div className="color-green"></div>
                </div>
                <div className="container footer-content">
                    <div className="footer-copyright">
                        &copy; 2026 BudgetSetu
                    </div>
                    <div className="footer-links">
                        <Link to="#">About</Link>
                        <Link to="#">Privacy Policy</Link>
                        <Link to="#">Contact</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
