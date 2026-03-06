import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import './AuthPages.css';

export default function Login() {
    const [formData, setFormData] = useState({
        identifier: '',
        password: ''
    });
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        // In a real application, perform authentication here
        console.log('Login attempt with:', formData);
        // Simulate successful login
        navigate('/dashboard');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="auth-container animate-fade-in">
            <div className="auth-header text-center mb-6">
                <div className="auth-logo mb-4 mx-auto flex justify-center text-primary">
                    <ShieldCheck size={48} />
                </div>
                <h2 className="text-primary mb-2">BudgetSetu</h2>
                <h4 className="text-muted">Officer Login</h4>
            </div>

            <form onSubmit={handleSubmit} className="auth-form flex flex-col gap-4">
                <Input
                    label="Email / Officer ID"
                    name="identifier"
                    placeholder="Enter your email or ID"
                    value={formData.identifier}
                    onChange={handleChange}
                    required
                />
                <Input
                    label="Password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />

                <div className="flex justify-between items-center mt-2 mb-4">
                    <label className="flex items-center gap-2 text-sm text-muted">
                        <input type="checkbox" /> Remember me
                    </label>
                    <a href="#" className="text-sm text-primary hover-underline">Forgot password?</a>
                </div>

                <Button type="submit" size="lg" className="w-full">
                    Login
                </Button>
            </form>

            <div className="auth-footer text-center mt-6 text-sm text-muted">
                Don't have an account? <Link to="/signup" className="text-primary font-medium hover-underline">Create Account</Link>
            </div>
        </div>
    );
}
