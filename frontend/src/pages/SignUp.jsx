import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import './AuthPages.css';

export default function SignUp() {
    const [formData, setFormData] = useState({
        fullName: '',
        officerId: '',
        department: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const navigate = useNavigate();

    const handleRegister = (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords don't match!");
            return;
        }
        // Simulation
        console.log('Registration attempt:', formData);
        navigate('/dashboard');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const departmentOptions = [
        { value: '', label: 'Select Department' },
        { value: 'health', label: 'Health' },
        { value: 'education', label: 'Education' },
        { value: 'infrastructure', label: 'Infrastructure' },
        { value: 'agriculture', label: 'Agriculture' }
    ];

    return (
        <div className="auth-container animate-fade-in">
            <div className="auth-header text-center mb-6">
                <div className="auth-logo mb-4 mx-auto flex justify-center text-primary">
                    <ShieldCheck size={48} />
                </div>
                <h2 className="text-primary mb-2">BudgetSetu</h2>
                <h4 className="text-muted">Officer Registration</h4>
            </div>

            <form onSubmit={handleRegister} className="auth-form flex flex-col gap-4">
                <Input
                    label="Full Name"
                    name="fullName"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                />
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Officer ID"
                        name="officerId"
                        placeholder="Gov ID"
                        value={formData.officerId}
                        onChange={handleChange}
                        required
                    />
                    <Select
                        label="Department"
                        name="department"
                        options={departmentOptions}
                        value={formData.department}
                        onChange={handleChange}
                        required
                    />
                </div>
                <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    placeholder="officer@gov.in"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                <Input
                    label="Password"
                    name="password"
                    type="password"
                    placeholder="Create password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                <Input
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                />

                <Button type="submit" size="lg" className="w-full mt-2">
                    Create Account
                </Button>
            </form>

            <div className="auth-footer text-center mt-6 text-sm text-muted">
                Already have an account? <Link to="/login" className="text-primary font-medium hover-underline">Login</Link>
            </div>
        </div>
    );
}
