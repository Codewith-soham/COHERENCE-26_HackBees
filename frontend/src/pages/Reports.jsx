import { useState, useEffect, useRef } from 'react';
import { FileText, FileSpreadsheet, Download, RotateCcw } from 'lucide-react';
import Card from '../components/ui/Card';
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

export default function Reports() {
    const [filterState, setFilterState] = useState("");
    const [filterDistrict, setFilterDistrict] = useState("");
    const [filterDepartment, setFilterDepartment] = useState("");
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
        setFilterDistrict("");
    }, [filterState]);

    const filteredStates = Object.keys(INDIA_STATES_DISTRICTS).filter(state =>
        state.toLowerCase().includes(stateSearch.toLowerCase())
    );

    const handleStateSelect = (state) => {
        setFilterState(state);
        setStateSearch("");
        setShowStateDropdown(false);
    };

    const clearStateSelection = () => {
        setFilterState("");
        setFilterDistrict("");
        setStateSearch("");
    };

    const resetFilters = () => {
        setFilterState("");
        setFilterDistrict("");
        setFilterDepartment("");
        setStateSearch("");
    };

    const reportsList = [
        { title: 'National Budget Summary', desc: 'High-level overview of allocated vs spent budgets across all states.', type: 'pdf' },
        { title: 'Department Utilization Report', desc: 'Detailed breakdown of utilization rates grouped by department.', type: 'excel' },
        { title: 'AI Anomaly Intelligence', desc: 'Log of all flagged anomalies, risk factors, and investigation statuses.', type: 'csv' },
        { title: 'Lapse Prediction Forecast', desc: 'Predictive models for Q4 expected lapses by district.', type: 'pdf' },
    ];

    return (
        <div className="page-container animate-fade-in">
            <div className="page-header mb-6">
                <h2 className="text-primary">Financial Reports</h2>
                <p className="text-muted">Generate and export official documentation and data extracts.</p>
            </div>

            {/* Filter Bar */}
            <Card className="mb-6">
                <div className="flex items-end gap-4">
                    {/* Searchable State Dropdown */}
                    <div className="flex-1" ref={stateDropdownRef} style={{ position: 'relative' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>State</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Search or select state..."
                                value={filterState || stateSearch}
                                onChange={(e) => {
                                    setStateSearch(e.target.value);
                                    setFilterState("");
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
                            {filterState && (
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

                    {/* District Dropdown - only when state selected */}
                    {filterState && (
                        <div className="flex-1">
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>District</label>
                            <select
                                value={filterDistrict}
                                onChange={(e) => setFilterDistrict(e.target.value)}
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
                                {INDIA_STATES_DISTRICTS[filterState]?.map(district => (
                                    <option key={district} value={district}>{district}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Department Dropdown */}
                    <div className="flex-1">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>Department</label>
                        <select
                            value={filterDepartment}
                            onChange={(e) => setFilterDepartment(e.target.value)}
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
                            <option value="">All Departments</option>
                            {DEPARTMENTS.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </div>

                    {/* Reset Filters Button */}
                    <Button variant="outline" className="gap-2" onClick={resetFilters}>
                        <RotateCcw size={16} /> Reset Filters
                    </Button>
                </div>
            </Card>

            {/* Generator Form */}
            <Card title="Custom Report Generator" className="mb-8">
                <div className="flex items-end gap-4">
                    <div className="flex-1">
                        <p className="text-sm text-muted mb-2">
                            {filterState ? `State: ${filterState}` : 'All States'}
                            {filterDistrict ? `, District: ${filterDistrict}` : ''}
                            {filterDepartment ? `, Dept: ${filterDepartment}` : ', All Departments'}
                        </p>
                    </div>
                    <Button variant="primary" className="gap-2"><Download size={16} /> Generate Report</Button>
                </div>
            </Card>

            {/* Standard Reports */}
            <h3 className="text-lg mb-4">Standard Reports</h3>
            <div className="grid grid-cols-2 gap-6">
                {reportsList.map((rep, idx) => (
                    <Card key={idx} className="flex hover:border-primary transition-colors cursor-pointer">
                        <div className="flex items-start justify-between w-full">
                            <div className="flex gap-4">
                                <div className={`icon-wrapper ${rep.type === 'pdf' ? 'bg-alert-transparent text-alert' : 'bg-success-transparent text-success'}`}>
                                    {rep.type === 'pdf' ? <FileText size={24} /> : <FileSpreadsheet size={24} />}
                                </div>
                                <div>
                                    <h4 className="text-md mb-1">{rep.title}</h4>
                                    <p className="text-sm text-muted">{rep.desc}</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm">Export</Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
