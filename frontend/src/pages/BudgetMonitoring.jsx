import { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import { Filter, Download } from 'lucide-react';

export default function BudgetMonitoring() {
    const [budgets, setBudgets] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [filters, setFilters] = useState({ state: '', dept: '', district: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBudgets();
    }, []);

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

    const applyFilters = () => {
        let result = [...budgets];
        if (filters.state) result = result.filter(b => b.state?.toLowerCase().includes(filters.state.toLowerCase()));
        if (filters.dept) result = result.filter(b => b.department?.toLowerCase().includes(filters.dept.toLowerCase()));
        if (filters.district) result = result.filter(b => b.district?.toLowerCase().includes(filters.district.toLowerCase()));
        setFiltered(result);
    };

    const totalAllocated = filtered.reduce((s, b) => s + b.allocated_amount, 0);
    const totalSpent = filtered.reduce((s, b) => s + b.spent_amount, 0);
    const remaining = totalAllocated - totalSpent;
    const avgUtil = totalAllocated > 0 ? ((totalSpent / totalAllocated) * 100).toFixed(1) : 0;

    const getStatus = (spent, allocated) => {
        const ratio = spent / allocated;
        if (ratio > 0.9) return { label: 'Overspending Risk', variant: 'alert' };
        if (ratio < 0.3) return { label: 'Low Utilization', variant: 'warning' };
        return { label: 'Normal', variant: 'success' };
    };

    const fmt = (val) => `₹${(val / 10000000).toFixed(1)} Cr`;

    if (loading) return <div className="page-container"><p className="text-muted">Loading budgets...</p></div>;

    return (
        <div className="page-container animate-fade-in">
            <div className="flex justify-between items-end mb-6">
                <div className="page-header">
                    <h2 className="text-primary">Budget Monitoring</h2>
                    <p className="text-muted">Detailed view of budget allocations and expenditure.</p>
                </div>
                <Button variant="outline" className="gap-2"><Download size={16} /> Export CSV</Button>
            </div>

            {/* Filter Panel */}
            <Card className="mb-6">
                <div className="flex items-end gap-4">
                    <div className="flex-1">
                        <Select label="State" name="state" onChange={handleFilterChange} options={[
                            { value: '', label: 'All States' },
                            { value: 'Maharashtra', label: 'Maharashtra' },
                            { value: 'Delhi', label: 'Delhi' },
                            { value: 'Karnataka', label: 'Karnataka' },
                            { value: 'Tamil Nadu', label: 'Tamil Nadu' },
                            { value: 'Uttar Pradesh', label: 'Uttar Pradesh' },
                            { value: 'Gujarat', label: 'Gujarat' },
                            { value: 'Rajasthan', label: 'Rajasthan' },
                            { value: 'West Bengal', label: 'West Bengal' },
                        ]} />
                    </div>
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
                    <div className="flex-1">
                        <Input label="Search District" name="district" placeholder="Enter district name..." onChange={handleFilterChange} />
                    </div>
                    <Button variant="primary" className="gap-2" onClick={applyFilters}>
                        <Filter size={16} /> Apply Filters
                    </Button>
                </div>
            </Card>

            {/* Metrics Row */}
            <div className="grid grid-cols-4 gap-6 mb-6">
                <Card className="p-4"><p className="text-sm text-muted">Total Allocated</p><h3 className="text-xl">{fmt(totalAllocated)}</h3></Card>
                <Card className="p-4"><p className="text-sm text-muted">Total Spent</p><h3 className="text-xl">{fmt(totalSpent)}</h3></Card>
                <Card className="p-4"><p className="text-sm text-muted">Remaining Pool</p><h3 className="text-xl">{fmt(remaining)}</h3></Card>
                <Card className="p-4"><p className="text-sm text-muted">Avg Utilization</p><h3 className="text-xl text-success">{avgUtil}%</h3></Card>
            </div>

            {/* Main Data Table */}
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
                                const utilInt = Math.round((row.spent_amount / row.allocated_amount) * 100);
                                const status = getStatus(row.spent_amount, row.allocated_amount);
                                return (
                                    <tr key={i}>
                                        <td>{row.state || 'N/A'}</td>
                                        <td>{row.district}</td>
                                        <td>{row.department}</td>
                                        <td>{fmt(row.allocated_amount)}</td>
                                        <td>{fmt(row.spent_amount)}</td>
                                        <td className="font-medium">{fmt(row.allocated_amount - row.spent_amount)}</td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <div style={{ flex: 1, backgroundColor: 'var(--bg-secondary)', height: '6px', borderRadius: '3px' }}>
                                                    <div style={{ width: `${utilInt}%`, backgroundColor: 'var(--primary)', height: '100%', borderRadius: '3px' }}></div>
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

