import { Link } from 'react-router-dom';
import { ShieldAlert, TrendingDown, Activity, ArrowRightLeft, LineChart, CheckCircle2 } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import './Landing.css';

export default function Landing() {
    const features = [
        {
            title: 'AI Anomaly Detection',
            description: 'Detect abnormal spending patterns and potential financial irregularities automatically.',
            icon: ShieldAlert,
        },
        {
            title: 'Fund Lapse Prediction',
            description: 'Identify departments that may not use allocated funds before the financial year ends.',
            icon: TrendingDown,
        },
        {
            title: 'Budget Monitoring',
            description: 'Track budget allocation and real-time spending across districts and states.',
            icon: Activity,
        },
        {
            title: 'Fund Reallocation',
            description: 'Get AI-driven suggestions for redistributing unused funds to high-priority sectors.',
            icon: ArrowRightLeft,
        },
        {
            title: 'Budget Forecasting',
            description: 'Predict future budget requirements using historical data and growth trends.',
            icon: LineChart,
        },
    ];

    const benefits = [
        'Reduce financial inefficiencies',
        'Detect corruption risks early',
        'Improve public fund utilization',
        'Enable data-driven decisions',
    ];

    return (
        <div className="landing-page">
            {/* Navbar segment for Landing only */}
            <nav className="landing-nav container">
                <div className="nav-logo">
                    <h2 className="text-primary">BudgetSetu</h2>
                </div>
                <div className="nav-actions">
                    <Link to="/login" className="btn btn-outline btn-md">Login</Link>
                    <Link to="/signup" className="btn btn-primary btn-md">Get Started</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="container hero-content">
                    <div className="hero-text animate-fade-in">
                        <div className="badge-pill mb-4">Smart Public Budget Intelligence for India</div>
                        <h1 className="hero-title">Transforming Government Budget Monitoring with AI</h1>
                        <p className="hero-subtitle mb-8">
                            BudgetSetu helps government officers monitor spending, detect financial risks, and make smarter budget decisions using AI-powered analytics.
                        </p>
                        <div className="hero-buttons flex gap-4">
                            <Link to="/login"><Button size="lg" variant="primary">Login to Dashboard</Button></Link>
                            <Link to="/signup"><Button size="lg" variant="secondary">Request Access</Button></Link>
                        </div>
                    </div>
                    <div className="hero-visual animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        <div className="mockup-window">
                            <div className="mockup-header">
                                <span className="dot"></span><span className="dot"></span><span className="dot"></span>
                            </div>
                            <div className="mockup-body bg-secondary">
                                {/* Abstract Dashboard Mockup */}
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="mock-card h-24"></div>
                                    <div className="mock-card h-24"></div>
                                </div>
                                <div className="mock-card h-48 mb-4"></div>
                                <div className="mock-card h-32"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section bg-secondary py-16">
                <div className="container">
                    <div className="text-center mb-12">
                        <h2 className="text-primary">Powerful Capabilities</h2>
                        <p>Everything you need to monitor and optimize public spending.</p>
                    </div>
                    <div className="grid grid-cols-3 gap-6 features-grid">
                        {features.map((feature, idx) => {
                            const Icon = feature.icon;
                            return (
                                <Card key={idx} className="feature-card">
                                    <div className="feature-icon mb-4">
                                        <Icon size={28} className="text-accent" />
                                    </div>
                                    <h4>{feature.title}</h4>
                                    <p className="text-sm">{feature.description}</p>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="benefits-section py-16">
                <div className="container benefits-content">
                    <div className="benefits-text">
                        <h2 className="text-primary mb-6">Why Choose BudgetSetu?</h2>
                        <ul className="benefits-list">
                            {benefits.map((benefit, idx) => (
                                <li key={idx} className="flex items-center gap-4 mb-4">
                                    <CheckCircle2 className="text-success" size={24} />
                                    <span className="text-lg font-medium">{benefit}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="benefits-image">
                        <div className="shield-illustration">
                            <ShieldAlert size={120} className="text-primary" strokeWidth={1} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer bg-primary text-white py-8">
                <div className="container flex justify-between items-center footer-content">
                    <div className="footer-brand">
                        <h3 className="mb-2">BudgetSetu</h3>
                        <p className="text-sm opacity-70">Smart Public Budget Intelligence for India.</p>
                    </div>
                    <div className="footer-links flex gap-6">
                        <a href="#" className="hover-underline">About</a>
                        <a href="#" className="hover-underline">Documentation</a>
                        <a href="#" className="hover-underline">Contact</a>
                        <a href="#" className="hover-underline">Privacy Policy</a>
                    </div>
                </div>
                <div className="container text-center mt-8 pt-8 border-t border-white-10">
                    <p className="text-sm opacity-50">&copy; {new Date().getFullYear()} BudgetSetu. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
