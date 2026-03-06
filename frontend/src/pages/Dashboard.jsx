import {
    Building2,
    IndianRupee,
    Wallet,
    TrendingUp
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend
} from 'recharts';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import './Dashboard.css';

// Mock Data
const summaryCards = [
    { title: 'Total Budget Allocated', value: '₹50,000 Cr', icon: IndianRupee, color: 'primary' },
    { title: 'Total Budget Spent', value: '₹32,450 Cr', icon: TrendingUp, color: 'alert' },
    { title: 'Remaining Funds', value: '₹17,550 Cr', icon: Wallet, color: 'success' },
    { title: 'Departments Monitored', value: '42', icon: Building2, color: 'warning' },
];

const utilizationData = [
    { month: 'Apr', spent: 4000 },
    { month: 'May', spent: 3000 },
    { month: 'Jun', spent: 5000 },
    { month: 'Jul', spent: 4500 },
    { month: 'Aug', spent: 6000 },
    { month: 'Sep', spent: 5500 },
];

const deptData = [
    { name: 'Health', allocated: 12000, spent: 8000 },
    { name: 'Education', allocated: 15000, spent: 10000 },
    { name: 'Infra', allocated: 20000, spent: 12000 },
    { name: 'Agri', allocated: 8000, spent: 6000 },
];

const recentActivity = [
    { id: 1, state: 'Maharashtra', district: 'Pune', dept: 'Health', allocated: '₹500 Cr', spent: '₹350 Cr', remaining: '₹150 Cr', fy: '2023-24' },
    { id: 2, state: 'Karnataka', district: 'Bengaluru', dept: 'IT', allocated: '₹300 Cr', spent: '₹280 Cr', remaining: '₹20 Cr', fy: '2023-24' },
    { id: 3, state: 'Gujarat', district: 'Ahmedabad', dept: 'Education', allocated: '₹450 Cr', spent: '₹200 Cr', remaining: '₹250 Cr', fy: '2023-24' },
    { id: 4, state: 'Kerala', district: 'Kochi', dept: 'Tourism', allocated: '₹150 Cr', spent: '₹140 Cr', remaining: '₹10 Cr', fy: '2023-24' },
];

export default function Dashboard() {
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
            <div className="grid grid-cols-2 gap-6 mb-6 charts-row">
                <Card title="Budget Utilization Trend (FY 23-24)" className="chart-card utilization-card">
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={utilizationData} margin={{ top: 8, right: 12, bottom: 8, left: 24 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    width={92}
                                    tickMargin={8}
                                    tick={{ fill: 'var(--text-dark)', fontSize: 12, fontWeight: 400 }}
                                    tickFormatter={(val) => `₹${val} Cr`}
                                />
                                <Tooltip formatter={(value) => [`₹${value} Cr`, 'Spent']} />
                                <Line type="monotone" dataKey="spent" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Department Spending Comparison" className="chart-card comparison-card">
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={deptData} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip formatter={(value) => `₹${value} Cr`} />
                                <Legend iconType="circle" />
                                <Bar dataKey="allocated" name="Allocated" fill="#4CAF50" radius={[4, 4, 0, 0]} />
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
                                const isLow = row.remaining === '₹10 Cr' || row.remaining === '₹20 Cr';
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
