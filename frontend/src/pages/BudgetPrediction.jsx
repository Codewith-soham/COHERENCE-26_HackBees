import { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import {
    XAxis, YAxis, CartesianGrid, Tooltip,
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

            // Bar chart — only entries with unused > 0, store dept name separately from district
            setDeptRiskData(
                data
                    .filter(p => p.predicted_unused > 0)
                    .map(p => ({
                        name:     p.department || 'Unknown',
                        district: p.district   || p.state || '',
                        unused:   p.predicted_unused,
                        risk:     p.risk_level,
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

    // Custom tooltip for bar chart — shows dept + district + risk
    const BarTooltip = ({ active, payload, label }) => {
        if (!active || !payload?.length) return null;
        const entry = deptRiskData.find(d => d.name === label);
        return (
            <div style={{
                background: '#fff', border: '1px solid #e5e7eb',
                borderRadius: 8, padding: '10px 14px', fontSize: 13,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}>
                <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
                {entry?.district && (
                    <p style={{ color: '#6b7280', marginBottom: 4, fontSize: 12 }}>
                        {entry.district}
                    </p>
                )}
                <p style={{ color: riskColor(entry?.risk), fontWeight: 600 }}>
                    Rs.{payload[0].value} Cr unused
                </p>
                <p style={{ color: '#6b7280', fontSize: 11, marginTop: 2 }}>
                    Risk Level: {entry?.risk || 'N/A'}
                </p>
            </div>
        );
    };

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

            {/* ── Grouped Bar Chart — Budget Forecast ── */}
            {forecastData.length > 0 && (
                <Card title="Budget Forecast by Financial Year" className="mb-6">
                    <div style={{ width: '100%', height: 400 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={forecastData}
                                margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
                                barCategoryGap="30%"
                                barGap={4}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="#e5e7eb"
                                />
                                <XAxis
                                    dataKey="year"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 13, fill: '#111827', fontWeight: 600 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    width={90}
                                    tick={{ fontSize: 11, fill: '#111827' }}
                                    tickFormatter={v => `Rs.${v}Cr`}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                                    content={({ active, payload, label }) => {
                                        if (!active || !payload?.length) return null;
                                        const colors = {
                                            allocated: '#1A3D7C',
                                            projected: '#FF9933',
                                            unused:    '#dc2626',
                                        };
                                        const labels = {
                                            allocated: 'Allocated',
                                            projected: 'Projected Spending',
                                            unused:    'Predicted Unused',
                                        };
                                        return (
                                            <div style={{
                                                background: '#fff',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: 10,
                                                padding: '12px 16px',
                                                boxShadow: '0 6px 20px rgba(0,0,0,0.10)',
                                                fontSize: 13,
                                                minWidth: 200,
                                            }}>
                                                <p style={{
                                                    fontWeight: 700, fontSize: 14,
                                                    marginBottom: 10, color: '#111827',
                                                    borderBottom: '1px solid #f3f4f6',
                                                    paddingBottom: 6,
                                                }}>
                                                    FY {label}
                                                </p>
                                                {payload.map((p, i) => (
                                                    <div key={i} style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        marginBottom: 6, gap: 24,
                                                    }}>
                                                        <span style={{
                                                            display: 'flex', alignItems: 'center',
                                                            gap: 6, color: '#6b7280',
                                                        }}>
                                                            <span style={{
                                                                width: 10, height: 10,
                                                                borderRadius: 2,
                                                                backgroundColor: colors[p.dataKey],
                                                                display: 'inline-block',
                                                            }} />
                                                            {labels[p.dataKey]}
                                                        </span>
                                                        <span style={{
                                                            fontWeight: 700,
                                                            color: colors[p.dataKey],
                                                        }}>
                                                            Rs.{p.value} Cr
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    }}
                                />
                                <Legend
                                    wrapperStyle={{ fontSize: 13, paddingTop: 14 }}
                                    iconType="circle"
                                    formatter={(value) => ({
                                        allocated: 'Allocated',
                                        projected: 'Projected Spending',
                                        unused:    'Predicted Unused',
                                    }[value] || value)}
                                />
                                <Bar
                                    dataKey="allocated"
                                    name="allocated"
                                    fill="#1A3D7C"
                                    radius={[6, 6, 0, 0]}
                                    maxBarSize={60}
                                />
                                <Bar
                                    dataKey="projected"
                                    name="projected"
                                    fill="#FF9933"
                                    radius={[6, 6, 0, 0]}
                                    maxBarSize={60}
                                />
                                <Bar
                                    dataKey="unused"
                                    name="unused"
                                    fill="#dc2626"
                                    radius={[6, 6, 0, 0]}
                                    maxBarSize={60}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            )}

            {/* ── Bar Chart — only non-zero unused ── */}
            {deptRiskData.length > 0 && (
                <Card title="Predicted Unused Funds by Department" className="mb-6">
                    <div style={{ width: '100%', height: 420 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={deptRiskData}
                                margin={{ top: 10, right: 30, bottom: 20, left: 20 }}
                                barCategoryGap="35%"
                                maxBarSize={80}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="#e5e7eb"
                                />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    interval={0}
                                    height={40}
                                    tick={{ fontSize: 13, fill: '#374151', fontWeight: 600 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    width={85}
                                    tick={{ fontSize: 11, fill: '#6b7280' }}
                                    tickFormatter={v => `Rs.${v}Cr`}
                                />
                                <Tooltip content={<BarTooltip />} />
                                <Bar
                                    dataKey="unused"
                                    name="Predicted Unused"
                                    radius={[6, 6, 0, 0]}
                                >
                                    {deptRiskData.map((entry, i) => (
                                        <Cell key={i} fill={riskColor(entry.risk || 'LOW')} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Risk legend */}
                    <div style={{
                        display: 'flex', gap: 16, justifyContent: 'flex-end',
                        marginTop: 8, flexWrap: 'wrap',
                    }}>
                        {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(r => (
                            <span key={r} style={{
                                display: 'flex', alignItems: 'center',
                                gap: 6, fontSize: 12, color: '#6b7280',
                            }}>
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