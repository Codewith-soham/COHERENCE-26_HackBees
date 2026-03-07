import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';

const INDIA_STATES_DISTRICTS = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Kadapa", "Tirupati", "Anantapur"],
  "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Tawang", "Ziro"],
  "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Arrah"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg", "Rajnandgaon", "Jagdalpur"],
  "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar"],
  "Haryana": ["Faridabad", "Gurugram", "Panipat", "Ambala", "Hisar", "Rohtak", "Karnal"],
  "Himachal Pradesh": ["Shimla", "Dharamshala", "Solan", "Mandi", "Kullu", "Hamirpur"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Hazaribagh"],
  "Karnataka": ["Bengaluru", "Mysuru", "Hubballi", "Mangaluru", "Belagavi", "Kalaburagi", "Tumakuru"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Kannur", "Palakkad"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Rewa"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Solapur", "Thane", "Kolhapur"],
  "Manipur": ["Imphal", "Thoubal", "Bishnupur", "Churachandpur", "Senapati"],
  "Meghalaya": ["Shillong", "Tura", "Jowai", "Nongpoh"],
  "Mizoram": ["Aizawl", "Lunglei", "Champhai", "Serchhip"],
  "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Wokha", "Tuensang"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner", "Ajmer", "Alwar"],
  "Sikkim": ["Gangtok", "Namchi", "Gyalshing", "Mangan"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Vellore"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Mahbubnagar"],
  "Tripura": ["Agartala", "Udaipur", "Dharmanagar", "Kailashahar"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Meerut", "Allahabad", "Ghaziabad", "Noida"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rishikesh", "Nainital"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Darjeeling"],
};

const DEPARTMENTS = [
  "Health", "Education", "Infrastructure", "Agriculture",
  "Water Resources", "Finance", "Transport", "Housing", "Energy", "Defence"
];

export default function RealTimeEntry() {
    const [formData, setFormData] = useState({
        state: '',
        district: '',
        department: '',
        fy: '2023-24',
        allocated: '',
        spent: '',
        remarks: ''
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [stateSearch, setStateSearch] = useState("");
    const [showStateDropdown, setShowStateDropdown] = useState(false);
    const stateDropdownRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (stateDropdownRef.current && !stateDropdownRef.current.contains(event.target)) {
                setShowStateDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Reset district when state changes
    useEffect(() => {
        setFormData(prev => ({ ...prev, district: '' }));
    }, [formData.state]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleStateSelect = (state) => {
        setFormData(prev => ({ ...prev, state, district: '' }));
        setStateSearch("");
        setShowStateDropdown(false);
    };

    const clearStateSelection = () => {
        setFormData(prev => ({ ...prev, state: '', district: '' }));
        setStateSearch("");
    };

    const filteredStates = Object.keys(INDIA_STATES_DISTRICTS).filter(state =>
        state.toLowerCase().includes(stateSearch.toLowerCase())
    );

    const handleReset = () => {
        setFormData({
            state: '',
            district: '',
            department: '',
            fy: '2023-24',
            allocated: '',
            spent: '',
            remarks: ''
        });
        setStateSearch("");
        setMessage(null);
    };

    const handleSubmit = async () => {
        // Basic validation
        if (!formData.state || !formData.district || !formData.department || !formData.allocated) {
            setMessage({ type: 'error', text: 'Please fill in all required fields.' });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch('http://localhost:5000/api/budget/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    state: formData.state,
                    department: formData.department,
                    district: formData.district,
                    month: new Date().toLocaleString('default', { month: 'long' }),
                    financial_year: formData.fy,
                    allocated_amount: Number(formData.allocated),
                    spent_amount: Number(formData.spent) || 0,
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Submission failed');
            }

            setMessage({ type: 'success', text: 'Budget submitted successfully! Anomaly check complete.' });
            handleReset();

        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Submission failed. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    // Preview calculations
    const allocNum = Number(formData.allocated) || 0;
    const spentNum = Number(formData.spent) || 0;
    const utilPerc = allocNum > 0 ? Math.min(100, (spentNum / allocNum) * 100).toFixed(1) : 0;

    return (
        <div className="page-container animate-fade-in">
            <div className="page-header mb-6">
                <h2 className="text-primary">Real-Time Budget Entry</h2>
                <p className="text-muted">Manually input or update budget allocations and expenditure records.</p>
            </div>

            {/* Success / Error Message */}
            {message && (
                <div style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    backgroundColor: message.type === 'success' ? '#e6f4ea' : '#fdecea',
                    color: message.type === 'success' ? '#2e7d32' : '#c62828',
                    border: `1px solid ${message.type === 'success' ? '#a5d6a7' : '#ef9a9a'}`
                }}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-3 gap-6">
                {/* Form Column */}
                <div className="col-span-2">
                    <Card title="Transaction Details">
                        <form className="flex flex-col gap-6">

                            <div className="grid grid-cols-2 gap-4">
                                {/* Searchable State Dropdown */}
                                <div ref={stateDropdownRef} style={{ position: 'relative' }}>
                                    <label className="input-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>State</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="text"
                                            placeholder="Search or select state..."
                                            value={formData.state || stateSearch}
                                            onChange={(e) => {
                                                setStateSearch(e.target.value);
                                                setFormData(prev => ({ ...prev, state: '', district: '' }));
                                                setShowStateDropdown(true);
                                            }}
                                            onFocus={() => setShowStateDropdown(true)}
                                            style={{
                                                width: '100%',
                                                padding: '0.625rem 2rem 0.625rem 0.875rem',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: 'var(--radius-md)',
                                                fontSize: '0.875rem',
                                                backgroundColor: 'var(--bg-main)',
                                                outline: 'none'
                                            }}
                                        />
                                        {formData.state && (
                                            <button
                                                type="button"
                                                onClick={clearStateSelection}
                                                style={{
                                                    position: 'absolute',
                                                    right: '8px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    fontSize: '1rem',
                                                    color: 'var(--text-muted)',
                                                    padding: '0 4px'
                                                }}
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                    {showStateDropdown && (
                                        <ul style={{
                                            position: 'absolute',
                                            top: '100%',
                                            left: 0,
                                            right: 0,
                                            maxHeight: '200px',
                                            overflowY: 'auto',
                                            backgroundColor: 'var(--bg-main)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: 'var(--radius-md)',
                                            boxShadow: 'var(--shadow-md)',
                                            zIndex: 100,
                                            margin: 0,
                                            padding: 0,
                                            listStyle: 'none'
                                        }}>
                                            {filteredStates.length === 0 ? (
                                                <li style={{ padding: '0.625rem 0.875rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No states found</li>
                                            ) : (
                                                filteredStates.map(state => (
                                                    <li
                                                        key={state}
                                                        onClick={() => handleStateSelect(state)}
                                                        style={{
                                                            padding: '0.625rem 0.875rem',
                                                            cursor: 'pointer',
                                                            fontSize: '0.875rem',
                                                            borderBottom: '1px solid var(--border-color)'
                                                        }}
                                                        onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-secondary)'}
                                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                                    >
                                                        {state}
                                                    </li>
                                                ))
                                            )}
                                        </ul>
                                    )}
                                </div>

                                {/* District Dropdown */}
                                <div>
                                    <label className="input-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>District</label>
                                    <select
                                        name="district"
                                        value={formData.district}
                                        onChange={handleChange}
                                        disabled={!formData.state}
                                        style={{
                                            width: '100%',
                                            padding: '0.625rem 0.875rem',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: 'var(--radius-md)',
                                            fontSize: '0.875rem',
                                            backgroundColor: formData.state ? 'var(--bg-main)' : 'var(--bg-secondary)',
                                            outline: 'none',
                                            cursor: formData.state ? 'pointer' : 'not-allowed'
                                        }}
                                    >
                                        <option value="">Select District</option>
                                        {formData.state && INDIA_STATES_DISTRICTS[formData.state]?.map(district => (
                                            <option key={district} value={district}>{district}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Department Dropdown */}
                                <div>
                                    <label className="input-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>Department</label>
                                    <select
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        style={{
                                            width: '100%',
                                            padding: '0.625rem 0.875rem',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: 'var(--radius-md)',
                                            fontSize: '0.875rem',
                                            backgroundColor: 'var(--bg-main)',
                                            outline: 'none'
                                        }}
                                    >
                                        <option value="">Select Department</option>
                                        {DEPARTMENTS.map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                </div>
                                <Select label="Financial Year" name="fy" value={formData.fy} onChange={handleChange} options={[
                                    { value: '2022-23', label: '2022-23' },
                                    { value: '2023-24', label: '2023-24' },
                                    { value: '2024-25', label: '2024-25' },
                                    { value: '2025-26', label: '2025-26' },
                                ]} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Allocated Budget (₹ Cr)" type="number" name="allocated" value={formData.allocated} onChange={handleChange} placeholder="e.g. 500" />
                                <Input label="Amount Spent (₹ Cr)" type="number" name="spent" value={formData.spent} onChange={handleChange} placeholder="e.g. 200" />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium">Remarks (Optional)</label>
                                <textarea
                                    className="input-field"
                                    rows="3"
                                    name="remarks"
                                    value={formData.remarks}
                                    onChange={handleChange}
                                    placeholder="Add any notes relevant to this transaction..."
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-4 mt-2">
                                <Button type="button" variant="outline" onClick={handleReset}>
                                    Reset Form
                                </Button>
                                <Button type="button" variant="primary" className="gap-2" onClick={handleSubmit} disabled={loading}>
                                    <Send size={16} /> {loading ? 'Submitting...' : 'Submit Transaction'}
                                </Button>
                            </div>

                        </form>
                    </Card>
                </div>

                {/* Live Preview Column */}
                <div className="col-span-1">
                    <Card title="Live Utilization Preview">
                        <div className="flex flex-col gap-4">
                            <div className="bg-secondary p-4 rounded text-center">
                                <p className="text-sm text-muted mb-1">Current Utilization</p>
                                <h3 className={`text-3xl ${utilPerc > 90 ? 'text-alert' : 'text-primary'}`}>{utilPerc}%</h3>
                            </div>

                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Progress</span>
                                    <span>{utilPerc}%</span>
                                </div>
                                <div style={{ backgroundColor: 'var(--bg-secondary)', height: '10px', borderRadius: '5px' }}>
                                    <div style={{
                                        width: `${utilPerc}%`,
                                        backgroundColor: utilPerc > 90 ? 'var(--alert)' : 'var(--primary)',
                                        height: '100%',
                                        borderRadius: '5px',
                                        transition: 'width 0.3s ease'
                                    }}></div>
                                </div>
                            </div>

                            <div className="text-sm text-muted mt-2">
                                <p><strong>Available:</strong> ₹{Math.max(0, allocNum - spentNum)} Cr</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

