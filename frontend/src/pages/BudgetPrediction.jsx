import { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

export default function BudgetPrediction() {
    const [forecastData, setForecastData] = useState([]);
    const [deptRiskData, setDeptRiskData] = useState([]);
    const [topPredictions, setTopPredictions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchForecast(); }, []);

    const fetchForecast = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/prediction/all');
            const json = await res.json();
            const data = json.data || [];

            // Area chart — group by financial year
            const yearMap = {};
            data.forEach(p => {
                if (!yearMap[p.financial_year]) yearMap[p.financial_year] = { allocated: 0, projected: 0 };
                yearMap[p.financial_year].allocated += Number(p.allocated_amount) || 0;
                yearMap[p.financial_year].projected += Number(p.projected_spending) || 0;
            });
            const chart = Object.entries(yearMap).map(([year, vals]) => ({
                year,
                allocated: Math.round(vals.allocated),
                projected: Math.round(vals.projected),
            }));
            setForecastData(chart);

            // Bar chart — dept risk
            const deptRisk = data.map(p => ({
                name: p.department,
                unused: Number(p.predicted_unused) || 0,
                risk: p.risk_level,
            }));
            setDeptRiskData(deptRisk);

            // Top 3 by allocated
            const top = [...data]
                .sort((a, b) => b.allocated_amount - a.allocated_amount)
                .slice(0, 3)
                .map(p => ({
                    dept: p.department,
                    predicted: Number(p.allocated_amount),
                    risk: p.risk_level,
                }));
            setTopPredictions(top);

        } catch (err) {
            console.error('Forecast fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const getBarColor = (risk) => {
        if (risk === 'HIGH') return '#c62828';
        if (risk === 'MEDIUM') return '#FF9933';
        return '#2e7d32';
    };

    if (loading) return <div className="page-container"><p className="text-muted">Loading forecast...</p></div>;

    return (
        <div className="page-container animate-fade-in">
            <div className="page-header mb-6">
                <h2 className="text-primary">Budget Prediction</h2>
                <p className="text-muted">AI-powered forecasting of budget utilization and year-end lapse risk.</p>
            </div>

            {/* Area Chart */}
            <Card title="Budget Forecast by Financial Year" className="mb-6">
                {forecastData.length === 0 ? (
                    <div className="flex items-center justify-center text-muted" style={{ height: 400 }}>
                        <p>No forecast data yet. Submit budget data and run predictions first.</p>
                    </div>
                ) : (
                    <div style={{ height: 400 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={forecastData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorAllocated" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1A3D7C" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#1A3D7C" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FF9933" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#FF9933" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="year" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}Cr`} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <Tooltip formatter={(value) => [`₹${value} Cr`, '']} />
                                <Legend />
                                <Area type="monotone" dataKey="allocated" name="Allocated Budget" stroke="#1A3D7C" fillOpacity={1} fill="url(#colorAllocated)" />
                                <Area type="monotone" dataKey="projected" name="Projected Spending" stroke="#FF9933" strokeDasharray="5 5" fillOpacity={1} fill="url(#colorProjected)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </Card>

            {/* Bar Chart — dept risk */}
            {deptRiskData.length > 0 && (
                <Card title="Predicted Unused Funds by Department" className="mb-6">
                    <div style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={deptRiskData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}Cr`} />
                                <Tooltip formatter={(value) => [`₹${value} Cr`, 'Unused']} />
                                <Bar dataKey="unused" name="Predicted Unused" radius={[4, 4, 0, 0]}
                                    fill="#1A3D7C"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            )}

            {/* Top 3 Cards */}
            <div className="grid grid-cols-3 gap-6">
                {topPredictions.map((p, i) => (
                    <Card key={i}>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="icon-wrapper bg-primary-transparent text-primary">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-muted">{p.dept} Department</p>
                                <h3 className="text-2xl font-bold">₹{p.predicted} Cr</h3>
                            </div>
                        </div>
                        <Badge
                            variant={p.risk === 'HIGH' ? 'alert' : p.risk === 'MEDIUM' ? 'warning' : 'success'}
                            className="w-full justify-center">
                            Risk Level: {p.risk}
                        </Badge>
                    </Card>
                ))}
            </div>
        </div>
    );
}