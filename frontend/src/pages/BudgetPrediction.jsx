import { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, Cell, Legend,
} from 'recharts';

export default function BudgetPrediction() {
    const [forecastData,   setForecastData]   = useState([]);
    const [deptRiskData,   setDeptRiskData]   = useState([]);
    const [topPredictions, setTopPredictions] = useState([]);
    const [summary,        setSummary]        = useState({});
    const [loading,        setLoading]        = useState(true);
    const [error,          setError]          = useState(null);

    useEffect(() => { fetchForecast(); }, []);

    const fetchForecast = async () => {
        setLoading(true);
        setError(null);
        try {
            const res  = await fetch('http://localhost:5000/api/prediction/all');
            const json = await res.json();
            const raw  = json.data || [];

            const data = raw.map(p => ({
                ...p,
                risk_level:         (p.risk_level || 'LOW').toUpperCase(),
                allocated_amount:   Number(p.allocated_amount)   || 0,
                projected_spending: Number(p.projected_spending) || 0,
                predicted_unused:   Number(p.predicted_unused)   || 0,
                financial_year:     p.financial_year || 'Unknown FY',
            }));

            // Summary KPIs
            setSummary({
                totalAllocated: data.reduce((s, p) => s + p.allocated_amount,   0),
                totalProjected: data.reduce((s, p) => s + p.projected_spending, 0),
                totalUnused:    data.reduce((s, p) => s + p.predicted_unused,   0),
                highRiskCount:  data.filter(p => p.risk_level === 'HIGH' || p.risk_level === 'CRITICAL').length,
                total:          data.length,
            });

            // Area chart grouped by financial year
            const yearMap = {};
            data.forEach(p => {
                if (!yearMap[p.financial_year])
                    yearMap[p.financial_year] = { allocated: 0, projected: 0, unused: 0 };
                yearMap[p.financial_year].allocated += p.allocated_amount;
                yearMap[p.financial_year].projected += p.projected_spending;
                yearMap[p.financial_year].unused    += p.predicted_unused;
            });

            setForecastData(
                Object.entries(yearMap)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([year, v]) => ({
                        year,
                        allocated: Math.round(v.allocated),
                        projected: Math.round(v.projected),
                        unused:    Math.round(v.unused),
                    }))
            );

            // Bar chart — only entries with unused > 0
            setDeptRiskData(
                data
                    .filter(p => p.predicted_unused > 0)
                    .map(p => ({
                        name:   `${p.department} (${p.district || p.state || ''})`,
                        unused: p.predicted_unused,
                        risk:   p.risk_level,
                    }))
            );

            // Top 3 by predicted_unused
            setTopPredictions(
                [...data]
                    .sort((a, b) => b.predicted_unused - a.predicted_unused)
                    .slice(0, 3)
                    .map(p => ({
                        dept:       p.department || 'Unknown',
                        state:      p.state      || 'N/A',
                        district:   p.district   || 'N/A',
                        allocated:  p.allocated_amount,
                        projected:  p.projected_spending,
                        unused:     p.predicted_unused,
                        risk:       p.risk_level,
                        suggestion: p.reallocation_suggestion || '',
                    }))
            );

        } catch (err) {
            console.error('Forecast fetch error:', err);
            setError('Failed to load forecast data. Is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    const riskColor = (risk) => ({
        CRITICAL: '#dc2626',
        HIGH:     '#ea580c',
        MEDIUM:   '#d97706',
        LOW:      '#16a34a',
    }[(risk || '').toUpperCase()] || '#6366f1');

    const riskVariant = (risk) => ({
        CRITICAL: 'alert',
        HIGH:     'alert',
        MEDIUM:   'warning',
        LOW:      'success',
    }[(risk || '').toUpperCase()] || 'default');

    if (loading) return (
        <div className="page-container">
            <p className="text-muted">Loading forecast...</p>
        </div>
    );

    if (error) return (
        <div className="page-container">
            <Card><p className="text-alert text-center py-6">⚠ {error}</p></Card>
        </div>
    );

    return (
        <div className="page-container animate-fade-in">
            <div className="page-header mb-6">
                <h2 className="text-primary">Budget Prediction</h2>
                <p className="text-muted">
                    AI-powered forecasting of budget utilization and year-end lapse risk.
                </p>
            </div>

            {/* Summary KPI Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6"
                style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <Card>
                    <p className="text-sm text-muted mb-1">Total Allocated</p>
                    <h3 className="text-xl font-bold text-primary">
                        ₹{summary.totalAllocated?.toFixed(1)} Cr
                    </h3>
                    <p className="text-xs text-muted mt-1">{summary.total} predictions</p>
                </Card>
                <Card>
                    <p className="text-sm text-muted mb-1">Projected Spending</p>
                    <h3 className="text-xl font-bold" style={{ color: '#FF9933' }}>
                        ₹{summary.totalProjected?.toFixed(1)} Cr
                    </h3>
                    <p className="text-xs text-muted mt-1">
                        {summary.totalAllocated
                            ? ((summary.totalProjected / summary.totalAllocated) * 100).toFixed(1)
                            : 0}% of allocated
                    </p>
                </Card>
                <Card>
                    <p className="text-sm text-muted mb-1">Predicted Unused</p>
                    <h3 className="text-xl font-bold" style={{ color: '#dc2626' }}>
                        ₹{summary.totalUnused?.toFixed(1)} Cr
                    </h3>
                    <p className="text-xs text-muted mt-1">at risk of lapse</p>
                </Card>
                <Card>
                    <p className="text-sm text-muted mb-1">High Risk Entries</p>
                    <h3 className="text-xl font-bold" style={{ color: '#ea580c' }}>
                        {summary.highRiskCount}
                    </h3>
                    <p className="text-xs text-muted mt-1">HIGH + CRITICAL</p>
                </Card>
            </div>

            {summary.total === 0 && (
                <Card className="mb-6">
                    <p className="text-muted text-center py-6">
                        No predictions yet. Submit budget entries and run a prediction from the backend first.
                    </p>
                </Card>
            )}

            {/* Area Chart */}
            {forecastData.length > 0 && (
                <Card title="Budget Forecast by Financial Year" className="mb-6">
                    <div style={{ width: '100%', height: 400 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={forecastData}
                                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorAllocated" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor="#1A3D7C" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#1A3D7C" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor="#FF9933" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#FF9933" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorUnused" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor="#dc2626" stopOpacity={0.6} />
                                        <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="year" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false}
                                    tickFormatter={v => `₹${v}Cr`} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <Tooltip formatter={(value, name) => [`₹${value} Cr`, name]} />
                                <Legend />
                                <Area type="monotone" dataKey="allocated" name="Allocated"
                                    stroke="#1A3D7C" fillOpacity={1} fill="url(#colorAllocated)" />
                                <Area type="monotone" dataKey="projected" name="Projected Spending"
                                    stroke="#FF9933" strokeDasharray="5 5"
                                    fillOpacity={1} fill="url(#colorProjected)" />
                                <Area type="monotone" dataKey="unused" name="Predicted Unused"
                                    stroke="#dc2626" strokeDasharray="3 3"
                                    fillOpacity={1} fill="url(#colorUnused)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            )}

            {/* Bar Chart — only non-zero unused */}
            {deptRiskData.length > 0 && (
                <Card title="Predicted Unused Funds by Department" className="mb-6">
                    <div style={{ width: '100%', height: 360 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={deptRiskData}
                                margin={{ top: 5, right: 20, bottom: 80, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false}
                                    stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    angle={-40}
                                    textAnchor="end"
                                    interval={0}
                                    height={80}
                                    tick={{ fontSize: 11 }}
                                    tickFormatter={(val) =>
                                        val.length > 18 ? val.slice(0, 18) + '…' : val
                                    }
                                />
                                <YAxis axisLine={false} tickLine={false}
                                    tickFormatter={v => `₹${v}Cr`} />
                                <Tooltip
                                    formatter={value => [`₹${value} Cr`, 'Unused']}
                                    labelFormatter={label => label}
                                />
                                <Bar dataKey="unused" name="Predicted Unused" radius={[4, 4, 0, 0]}>
                                    {deptRiskData.map((entry, i) => (
                                        <Cell key={i} fill={riskColor(entry.risk || 'LOW')} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted justify-end">
                        {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(r => (
                            <span key={r} className="flex items-center gap-1">
                                <span style={{
                                    width: 10, height: 10, borderRadius: 2,
                                    backgroundColor: riskColor(r), display: 'inline-block',
                                }} />
                                {r}
                            </span>
                        ))}
                    </div>
                </Card>
            )}

            {/* Top 3 highest unused */}
            {topPredictions.length > 0 && (
                <>
                    <h3 className="text-primary font-semibold mb-3">
                        Top {topPredictions.length} Highest Lapse Risk
                    </h3>
                    <div className="grid grid-cols-3 gap-6 mb-6">
                        {topPredictions.map((p, i) => (
                            <Card key={i}>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="icon-wrapper bg-primary-transparent text-primary">
                                        <TrendingUp size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-primary">{p.dept}</p>
                                        <p className="text-xs text-muted">{p.district}, {p.state}</p>
                                    </div>
                                </div>

                                <div className="space-y-1 mb-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted">Allocated</span>
                                        <span className="font-medium">₹{p.allocated} Cr</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted">Projected</span>
                                        <span className="font-medium" style={{ color: '#FF9933' }}>
                                            ₹{p.projected} Cr
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted">Unused</span>
                                        <span className="font-medium" style={{ color: '#dc2626' }}>
                                            ₹{p.unused} Cr
                                        </span>
                                    </div>
                                </div>

                                <Badge variant={riskVariant(p.risk)} className="w-full justify-center mb-2">
                                    Risk: {p.risk}
                                </Badge>

                                {p.suggestion && (
                                    <p className="text-xs text-muted mt-2 border-t pt-2 border-gray-100">
                                        💡 {p.suggestion}
                                    </p>
                                )}
                            </Card>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}