import { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function BudgetPrediction() {
    const [forecastData, setForecastData] = useState([]);
    const [topPredictions, setTopPredictions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchForecast();
    }, []);

    const fetchForecast = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/prediction/all');
            const json = await res.json();
            const data = json.data || [];

            // Build forecast chart from predictions grouped by financial year
            const yearMap = {};
            data.forEach(p => {
                if (!yearMap[p.financial_year]) yearMap[p.financial_year] = { actual: 0, forecast: 0 };
                yearMap[p.financial_year].actual += p.projected_spending || 0;
                yearMap[p.financial_year].forecast += p.allocated_amount || 0;
            });

            const chart = Object.entries(yearMap).map(([year, vals]) => ({
                year,
                actual: Math.round(vals.actual / 10000000),
                forecast: Math.round(vals.forecast / 10000000),
            }));
            setForecastData(chart);

            // Top 3 predictions by allocated amount
            const top = [...data]
                .sort((a, b) => b.allocated_amount - a.allocated_amount)
                .slice(0, 3)
                .map(p => ({
                    dept: p.department,
                    predicted: Math.round(p.allocated_amount / 10000000),
                    risk: p.risk_level,
                }));
            setTopPredictions(top);

        } catch (err) {
            console.error('Forecast fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="page-container"><p className="text-muted">Loading forecast...</p></div>;

    return (
        <div className="page-container animate-fade-in">
            <div className="page-header mb-6">
                <h2 className="text-primary">Budget Prediction</h2>
                <p className="text-muted">Long-term forecasting of budget requirements based on historical growth and socio-economic factors.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 mb-6">
                <Card title="National Budget Forecast">
                    {forecastData.length === 0 ? (
                        <div className="flex items-center justify-center text-muted" style={{ height: 400 }}>
                            <p>No forecast data yet. Submit budget data and run predictions first.</p>
                        </div>
                    ) : (
                        <div className="chart-container" style={{ height: 400 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={forecastData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="year" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}Cr`} />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <Tooltip formatter={(value) => [`₹${value} Cr`, '']} />
                                    <Area type="monotone" dataKey="actual" name="Projected Spending" stroke="var(--primary)" fillOpacity={1} fill="url(#colorActual)" />
                                    <Area type="monotone" dataKey="forecast" name="Allocated Budget" stroke="var(--accent)" strokeDasharray="5 5" fillOpacity={1} fill="url(#colorForecast)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </Card>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {topPredictions.map((p, i) => (
                    <Card key={i}>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="icon-wrapper bg-primary-transparent text-primary">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-muted">Predicted {p.dept} Budget</p>
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

