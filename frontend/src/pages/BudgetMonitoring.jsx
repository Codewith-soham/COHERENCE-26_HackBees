import { useState } from 'react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import { Filter, Download } from 'lucide-react';

const mockBudgets = [
    { id: 1, state: 'Maharashtra', district: 'Pune', dept: 'Health', allocated: 500, spent: 350, get remaining() { return this.allocated - this.spent }, fy: '2023-24' },
    { id: 2, state: 'Karnataka', district: 'Bengaluru', dept: 'Education', allocated: 300, spent: 280, get remaining() { return this.allocated - this.spent }, fy: '2023-24' },
    { id: 3, state: 'Gujarat', district: 'Ahmedabad', dept: 'Infrastructure', allocated: 1200, spent: 1100, get remaining() { return this.allocated - this.spent }, fy: '2023-24' },
    { id: 4, state: 'Kerala', district: 'Kochi', dept: 'Tourism', allocated: 150, spent: 140, get remaining() { return this.allocated - this.spent }, fy: '2023-24' },
    { id: 5, state: 'Uttar Pradesh', district: 'Lucknow', dept: 'Health', allocated: 800, spent: 400, get remaining() { return this.allocated - this.spent }, fy: '2023-24' },
    { id: 6, state: 'Madhya Pradesh', district: 'Bhopal', dept: 'Agriculture', allocated: 600, spent: 100, get remaining() { return this.allocated - this.spent }, fy: '2023-24' },
];

export default function BudgetMonitoring() {
    const [filters, setFilters] = useState({ state: '', dept: '' });

    const getStatus = (spent, allocated) => {
        const ratio = spent / allocated;
        if (ratio > 0.9) return { label: 'Overspending Risk', variant: 'alert' };
        if (ratio < 0.3) return { label: 'Low Utilization', variant: 'warning' };
        return { label: 'Normal', variant: 'success' };
    };

    return (
        <div className="page-container animate-fade-in">
            <div className="flex justify-between items-end mb-6">
                <div className="page-header">
                    <h2 className="text-primary">Budget Monitoring</h2>
                    <p className="text-muted">Detailed view of budget allocations and expenditure.</p>
                </div>
                <Button variant="outline" className="gap-2">
                    <Download size={16} /> Export CSV
                </Button>
            </div>

            {/* Filter Panel */}
            <Card className="mb-6">
                <div className="flex items-end gap-4">
                    <div className="flex-1">
                        <Select
                            label="State"
                            options={[
                                { value: '', label: 'All States' },
                                { value: 'mh', label: 'Maharashtra' },
                                { value: 'ka', label: 'Karnataka' },
                            ]}
                        />
                    </div>
                    <div className="flex-1">
                        <Select
                            label="Department"
                            options={[
                                { value: '', label: 'All Departments' },
                                { value: 'health', label: 'Health' },
                                { value: 'edu', label: 'Education' },
                            ]}
                        />
                    </div>
                    <div className="flex-1">
                        <Input label="Search District" placeholder="Enter district name..." />
                    </div>
                    <Button variant="primary" className="gap-2">
                        <Filter size={16} /> Apply Filters
                    </Button>
                </div>
            </Card>

            {/* Metrics Row */}
            <div className="grid grid-cols-4 gap-6 mb-6">
                <Card className="p-4"><p className="text-sm text-muted">Total Allocated</p><h3 className="text-xl">₹3,550 Cr</h3></Card>
                <Card className="p-4"><p className="text-sm text-muted">Total Spent</p><h3 className="text-xl">₹2,370 Cr</h3></Card>
                <Card className="p-4"><p className="text-sm text-muted">Remaining Pool</p><h3 className="text-xl">₹1,180 Cr</h3></Card>
                <Card className="p-4"><p className="text-sm text-muted">Avg Utilization</p><h3 className="text-xl text-success">66.7%</h3></Card>
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
                            {mockBudgets.map((row) => {
                                const utilInt = Math.round((row.spent / row.allocated) * 100);
                                const status = getStatus(row.spent, row.allocated);
                                return (
                                    <tr key={row.id}>
                                        <td>{row.state}</td>
                                        <td>{row.district}</td>
                                        <td>{row.dept}</td>
                                        <td>₹{row.allocated} Cr</td>
                                        <td>₹{row.spent} Cr</td>
                                        <td className="font-medium">₹{row.remaining} Cr</td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <div style={{ flex: 1, backgroundColor: 'var(--bg-secondary)', height: '6px', borderRadius: '3px' }}>
                                                    <div style={{ width: `${utilInt}%`, backgroundColor: 'var(--primary)', height: '100%', borderRadius: '3px' }}></div>
                                                </div>
                                                <span className="text-xs">{utilInt}%</span>
                                            </div>
                                        </td>
                                        <td><Badge variant={status.variant}>{status.label}</Badge></td>
                                        <td>{row.fy}</td>
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
