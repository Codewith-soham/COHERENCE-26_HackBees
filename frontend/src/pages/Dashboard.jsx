import { useState, useEffect } from 'react';
import {
    Building2, IndianRupee, Wallet, TrendingUp
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend
} from 'recharts';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import './Dashboard.css';

export default function Dashboard() {
    const [summary, setSummary] = useState({ totalAllocated: 0, totalSpent: 0, remaining: 0, departments: 0 });
    const [trends, setTrends] = useState([]);
    const [deptData, setDeptData] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/budget/all');
            const json = await res.json();
            const budgets = json.data || [];

            // Summary calculations
            const totalAllocated = budgets.reduce((sum, b) => sum + b.allocated_amount, 0);
            const totalSpent = budgets.reduce((sum, b) => sum + b.spent_amount, 0);
            const remaining = totalAllocated - totalSpent;
            const departments = [...new Set(budgets.map(b => b.department))].length;
            setSummary({ totalAllocated, totalSpent, remaining, departments });

            // Trends — group by month
            const monthOrder = ['January','February','March','April','May','June','July','August','September','October','November','December'];
            const monthMap = {};
            budgets.forEach(b => {
                if (!monthMap[b.month]) monthMap[b.month] = 0;
                monthMap[b.month] += b.spent_amount;
            });
            const trendsData = monthOrder
                .filter(m => monthMap[m])
                .map(m => ({ month: m.slice(0, 3), spent: Math.round(monthMap[m] / 10000000) }));
            setTrends(trendsData);

            // Department comparison
            const deptMap = {};
            budgets.forEach(b => {
                if (!deptMap[b.department]) deptMap[b.department] = { allocated: 0, spent: 0 };
                deptMap[b.department].allocated += b.allocated_amount;
                deptMap[b.department].spent += b.spent_amount;
            });
            const deptArr = Object.entries(deptMap).map(([name, vals]) => ({
                name,
                allocated: Math.round(vals.allocated / 10000000),
                spent: Math.round(vals.spent / 10000000),
            }));
            setDeptData(deptArr);

            // Recent activity — latest 5
            const recent = budgets.slice(0, 5).map((b, i) => ({
                id: i + 1,
                state: b.state || 'N/A',
                district: b.district,
                dept: b.department,
                allocated: `₹${(b.allocated_amount / 10000000).toFixed(0)} Cr`,
                spent: `₹${(b.spent_amount / 10000000).toFixed(0)} Cr`,
                remaining: `₹${((b.allocated_amount - b.spent_amount) / 10000000).toFixed(0)} Cr`,
                remainingRaw: b.allocated_amount - b.spent_amount,
                allocated_amount: b.allocated_amount,
                fy: b.financial_year,
            }));
            setRecentActivity(recent);

        } catch (err) {
            console.error('Dashboard fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const summaryCards = [
        { title: 'Total Budget Allocated', value: `₹${(summary.totalAllocated / 10000000).toFixed(0)} Cr`, icon: IndianRupee, color: 'primary' },
        { title: 'Total Budget Spent', value: `₹${(summary.totalSpent / 10000000).toFixed(0)} Cr`, icon: TrendingUp, color: 'alert' },
        { title: 'Remaining Funds', value: `₹${(summary.remaining / 10000000).toFixed(0)} Cr`, icon: Wallet, color: 'success' },
        { title: 'Departments Monitored', value: summary.departments, icon: Building2, color: 'warning' },
    ];

    if (loading) return <div className="page-container"><p className="text-muted">Loading dashboard...</p></div>;

    return (
        <div className="page-container animate-fade-in">
            <div className="page-header mb-6">
                <h2 className="text-primary">Executive Dashboard</h2>
                <p className="text-muted">Overview of national budget allocation and spending patterns.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-6 mb-6 dashboard-summary">
                {summaryCards.map((card, idx) => {
                    const Icon = card.icon;
                    return (
                        <Card key={idx} className="summary-card">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm text-muted mb-1">{card.title}</p>
                                    <h3 className="text-2xl font-bold">{card.value}</h3>
                                </div>
                                <div className={`icon-wrapper bg-${card.color}-transparent text-${card.color}`}>
                                    <Icon size={24} />
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-2 gap-6 mb-6">
                <Card title="Budget Utilization Trend">
                    <div className="chart-container" style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trends} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}Cr`} />
                                <Tooltip formatter={(value) => [`₹${value} Cr`, 'Spent']} />
                                <Line type="monotone" dataKey="spent" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Department Spending Comparison">
                    <div className="chart-container" style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={deptData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip formatter={(value) => `₹${value} Cr`} />
                                <Legend iconType="circle" />
                                <Bar dataKey="allocated" name="Allocated" fill="var(--bg-secondary)" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="spent" name="Spent" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Activity Table */}
            <Card title="Recent Budget Activity">
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>State</th>
                                <th>District</th>
                                <th>Department</th>
                                <th>Allocated Budget</th>
                                <th>Amount Spent</th>
                                <th>Remaining</th>
                                <th>FY</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentActivity.map((row) => {
                                const isLow = row.remainingRaw / row.allocated_amount < 0.10;
                                return (
                                    <tr key={row.id}>
                                        <td>{row.state}</td>
                                        <td>{row.district}</td>
                                        <td>{row.dept}</td>
                                        <td>{row.allocated}</td>
                                        <td>{row.spent}</td>
                                        <td className="font-medium">{row.remaining}</td>
                                        <td>{row.fy}</td>
                                        <td>
                                            <Badge variant={isLow ? 'warning' : 'success'}>
                                                {isLow ? 'Low Funds' : 'On Track'}
                                            </Badge>
                                        </td>
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