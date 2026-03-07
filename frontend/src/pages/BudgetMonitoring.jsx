import { useState, useEffect, useRef } from 'react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import { Filter } from 'lucide-react';

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

export default function BudgetMonitoring() {
    const [budgets, setBudgets] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [filters, setFilters] = useState({ dept: '' });
    const [loading, setLoading] = useState(true);

    // Searchable state dropdown states
    const [stateSearch, setStateSearch] = useState("");
    const [showStateDropdown, setShowStateDropdown] = useState(false);
    const [selectedState, setSelectedState] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const stateDropdownRef = useRef(null);

    useEffect(() => { fetchBudgets(); }, []);

    // Close state dropdown when clicking outside
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
        setSelectedDistrict("");
    }, [selectedState]);

    const fetchBudgets = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/budget/all');
            const json = await res.json();
            const data = json.data || [];
            setBudgets(data);
            setFiltered(data);
        } catch (err) {
            console.error('Budget fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    // Filter states based on search
    const filteredStates = Object.keys(INDIA_STATES_DISTRICTS).filter(state =>
        state.toLowerCase().includes(stateSearch.toLowerCase())
    );

    const handleStateSelect = (state) => {
        setSelectedState(state);
        setStateSearch("");
        setShowStateDropdown(false);
    };

    const clearStateSelection = () => {
        setSelectedState("");
        setSelectedDistrict("");
        setStateSearch("");
    };

    const applyFilters = () => {
        let result = [...budgets];
        if (selectedState) result = result.filter(b => b.state === selectedState);
        if (selectedDistrict) result = result.filter(b => b.district === selectedDistrict);
        if (filters.dept) result = result.filter(b => b.department?.toLowerCase().includes(filters.dept.toLowerCase()));
        setFiltered(result);
    };

    const totalAllocated = filtered.reduce((sum, b) => sum + (Number(b.allocated_amount) || 0), 0);
    const totalSpent = filtered.reduce((sum, b) => sum + (Number(b.spent_amount) || 0), 0);
    const remaining = totalAllocated - totalSpent;
    const avgUtil = totalAllocated > 0 ? ((totalSpent / totalAllocated) * 100).toFixed(1) : 0;

    const getStatus = (spent, allocated) => {
        if (!allocated || allocated === 0) return { label: 'No Data', variant: 'default' };
        const ratio = spent / allocated;
        if (ratio > 0.9) return { label: 'Overspending Risk', variant: 'alert' };
        if (ratio < 0.3) return { label: 'Low Utilization', variant: 'warning' };
        return { label: 'Normal', variant: 'success' };
    };

    const fmt = (val) => `₹${Number(val || 0).toFixed(1)} Cr`;

    if (loading) return <div className="page-container"><p className="text-muted">Loading budgets...</p></div>;

    return (
        <div className="page-container animate-fade-in">
            <div className="page-header mb-6">
                <h2 className="text-primary">Budget Monitoring</h2>
                <p className="text-muted">Detailed view of budget allocations and expenditure.</p>
            </div>

            <Card className="mb-6">
                <div className="flex items-end gap-4">
                    {/* Searchable State Dropdown */}
                    <div className="flex-1" ref={stateDropdownRef} style={{ position: 'relative' }}>
                        <label className="input-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>State</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Search or select state..."
                                value={selectedState || stateSearch}
                                onChange={(e) => {
                                    setStateSearch(e.target.value);
                                    setSelectedState("");
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
                            {selectedState && (
                                <button
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

                    {/* District Dropdown - only shows when state is selected */}
                    {selectedState && (
                        <div className="flex-1">
                            <label className="input-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>District</label>
                            <select
                                value={selectedDistrict}
                                onChange={(e) => setSelectedDistrict(e.target.value)}
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
                                <option value="">All Districts</option>
                                {INDIA_STATES_DISTRICTS[selectedState]?.map(district => (
                                    <option key={district} value={district}>{district}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="flex-1">
                        <Select label="Department" name="dept" onChange={handleFilterChange} options={[
                            { value: '', label: 'All Departments' },
                            { value: 'Health', label: 'Health' },
                            { value: 'Education', label: 'Education' },
                            { value: 'Infrastructure', label: 'Infrastructure' },
                            { value: 'Agriculture', label: 'Agriculture' },
                            { value: 'Water Resources', label: 'Water Resources' },
                            { value: 'Finance', label: 'Finance' },
                            { value: 'Transport', label: 'Transport' },
                            { value: 'Housing', label: 'Housing' },
                            { value: 'Energy', label: 'Energy' },
                            { value: 'Defence', label: 'Defence' },
                        ]} />
                    </div>
                    <Button variant="primary" className="gap-2" onClick={applyFilters}>
                        <Filter size={16} /> Apply Filters
                    </Button>
                </div>
            </Card>

            <div className="grid grid-cols-4 gap-6 mb-6">
                <Card className="p-4"><p className="text-sm text-muted">Total Allocated</p><h3 className="text-xl">{fmt(totalAllocated)}</h3></Card>
                <Card className="p-4"><p className="text-sm text-muted">Total Spent</p><h3 className="text-xl">{fmt(totalSpent)}</h3></Card>
                <Card className="p-4"><p className="text-sm text-muted">Remaining Pool</p><h3 className="text-xl">{fmt(remaining)}</h3></Card>
                <Card className="p-4"><p className="text-sm text-muted">Avg Utilization</p><h3 className="text-xl text-success">{avgUtil}%</h3></Card>
            </div>

            <Card>
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>State</th>
                                <th>District</th>
                                <th>Department</th>
                                <th>Allocated</th>
                                <th>Spent</th>
                                <th>Remaining</th>
                                <th>Utilization %</th>
                                <th>Status</th>
                                <th>FY</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 && (
                                <tr><td colSpan="9" className="text-center text-muted py-6">No budget records found.</td></tr>
                            )}
                            {filtered.map((row, i) => {
                                const alloc = Number(row.allocated_amount) || 0;
                                const spent = Number(row.spent_amount) || 0;
                                const utilInt = alloc > 0 ? Math.round((spent / alloc) * 100) : 0;
                                const status = getStatus(spent, alloc);
                                const barColor = utilInt > 90 ? 'var(--alert)' : utilInt < 30 ? 'var(--warning)' : 'var(--primary)';
                                return (
                                    <tr key={i}>
                                        <td>{row.state || 'N/A'}</td>
                                        <td>{row.district}</td>
                                        <td>{row.department}</td>
                                        <td>{fmt(alloc)}</td>
                                        <td>{fmt(spent)}</td>
                                        <td className="font-medium">{fmt(alloc - spent)}</td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <div style={{ flex: 1, backgroundColor: 'var(--bg-secondary)', height: '6px', borderRadius: '3px' }}>
                                                    <div style={{ width: `${Math.min(utilInt, 100)}%`, backgroundColor: barColor, height: '100%', borderRadius: '3px' }}></div>
                                                </div>
                                                <span className="text-xs">{utilInt}%</span>
                                            </div>
                                        </td>
                                        <td><Badge variant={status.variant}>{status.label}</Badge></td>
                                        <td>{row.financial_year}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
