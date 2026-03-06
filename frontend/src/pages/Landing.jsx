import { Link } from 'react-router-dom';
import { Landmark } from 'lucide-react';
import Button from '../components/ui/Button';
import './Landing.css';

export default function Landing() {
    return (
        <div className="landing-page">
            {/* Moving Background Gradients */}
            <div className="landing-gradients">
                <div className="gradient-saffron"></div>
                <div className="gradient-green"></div>
            </div>

            {/* State Emblem Watermark */}
            <div className="landing-watermark"></div>

            {/* Financial Grid Visual Pattern */}
            <div className="landing-visual-grid">
                <div className="line-h line-1"></div>
                <div className="line-h line-2"></div>
                <div className="line-v line-3"></div>
                <div className="line-v line-4"></div>
            </div>

            {/* Top Navigation */}
            <header className="landing-header container animation-fade-in-down">
                <div className="landing-brand">
                    <Landmark size={28} className="brand-emblem" strokeWidth={1.5} />
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

            {/* Main Hero Content */}
            <main className="landing-main">
                <div className="hero-content container">
                    <h1 className="hero-title animation-fade-in-up">BudgetSetu</h1>

                    <h2 className="hero-tagline animation-fade-in-up delay-1">
                        "Smart Public Budget Intelligence for India"
                    </h2>

                    <p className="hero-description animation-fade-in-up delay-2">
                        AI-powered platform for monitoring government budget allocation,
                        spending patterns, and financial insights across states,
                        districts, and departments.
                    </p>

                    <div className="hero-actions animation-fade-in-up delay-3">
                        <Link to="/login">
                            <Button size="lg" className="hero-btn-primary">Login</Button>
                        </Link>
                        <Link to="/signup">
                            <Button size="lg" className="hero-btn-secondary">Create Account</Button>
                        </Link>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="landing-footer animation-fade-in delay-4">
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
                        <Link to="#">Contact</Link>
                        <Link to="#">Privacy Policy</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
