import { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function LapsePrediction() {
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => { fetchPredictions(); }, []);

    const fetchPredictions = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('http://localhost:5000/api/prediction/all');
            const json = await res.json();
            const data = json.data || [];

            const mapped = data.map((p, i) => {
                const allocated = Number(p.allocated_amount) || 0;
                const projected = Number(p.projected_spending) || 0;
                const unused    = Number(p.predicted_unused) || 0;
                // FIX: DB stores UPPERCASE — normalise here, never rely on charAt casing
                const risk = (p.risk_level || 'LOW').toUpperCase();

                return {
                    id:         i + 1,
                    state:      p.state || 'N/A',
                    district:   p.district || 'N/A',
                    dept:       p.department || 'Unknown',
                    allocated,
                    projected,
                    unused,
                    utilization: allocated > 0
                        ? Math.round((projected / allocated) * 100)
                        : 0,
                    fy:         p.financial_year || 'N/A',
                    risk,                           // always UPPERCASE string
                    reallocation_suggestion: p.reallocation_suggestion || '',
                };
            });

            setPredictions(mapped);
        } catch (err) {
            console.error('Prediction fetch error:', err);
            setError('Failed to load predictions. Is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    // FIX: compare against UPPERCASE strings that match DB values
    const getRiskColor = (risk) => ({
        CRITICAL: '#dc2626',
        HIGH:     '#ea580c',
        MEDIUM:   '#d97706',
        LOW:      '#16a34a',
    }[risk] || '#6366f1');

    const getRiskBadge = (risk) => ({
        CRITICAL: 'alert',
        HIGH:     'alert',
        MEDIUM:   'warning',
        LOW:      'success',
    }[risk] || 'default');

    // FIX: compare UPPERCASE
    const highRisk    = predictions.filter(p => p.risk === 'HIGH' || p.risk === 'CRITICAL').length;
    const totalUnused = predictions.reduce((s, p) => s + p.unused, 0);

    const chartData = predictions.map(p => ({
        name:   p.dept,
        unused: p.unused,
        risk:   p.risk,
    }));

    if (loading) return (
        <div className="page-container">
            <p className="text-muted">Loading predictions...</p>
        </div>
    );

    if (error) return (
        <div className="page-container">
            <Card>
                <p className="text-alert text-center py-6">⚠ {error}</p>
            </Card>
        </div>
    );

    return (
        <div className="page-container animate-fade-in">
            <div className="page-header mb-6">
                <h2 className="text-primary">Fund Lapse Prediction</h2>
                <p className="text-muted">
                    Identify departments at risk of returning unused budget allocations before the fiscal year ends.
                </p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-6 mb-6">
                <Card className="p-4">
                    <p className="text-sm text-muted">Total Predictions</p>
                    <h3 className="text-2xl font-bold">{predictions.length}</h3>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-muted">HIGH + CRITICAL Risk</p>
                    <h3 className="text-2xl font-bold text-alert">{highRisk}</h3>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-muted">Total Predicted Unused</p>
                    <h3 className="text-2xl font-bold text-warning">₹{totalUnused.toFixed(1)} Cr</h3>
                </Card>
            </div>

            {predictions.length === 0 && (
                <Card>
                    <p className="text-muted text-center py-6">
                        No predictions yet. Submit budget entries via RealTimeEntry, then run a prediction.
                    </p>
                </Card>
            )}

            {/* Prediction Cards */}
            {predictions.length > 0 && (
                <div className="grid grid-cols-3 gap-6 mb-6">
                    {predictions.map(pred => (
                        <Card key={pred.id}>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="mb-1">{pred.dept}</h4>
                                    <p className="text-xs text-muted">{pred.district}, {pred.state}</p>
                                    <p className="text-xs text-muted">FY: {pred.fy}</p>
                                </div>
                                {/* FIX: pass UPPERCASE risk to badge */}
                                <Badge variant={getRiskBadge(pred.risk)}>{pred.risk} Risk</Badge>
                            </div>

                            <div className="mb-4">
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Projected Utilization</span>
                                    <span className="font-medium">{pred.utilization}%</span>
                                </div>
                                <div style={{ backgroundColor: 'var(--bg-secondary)', height: '8px', borderRadius: '4px' }}>
                                    <div style={{
                                        width:           `${Math.min(pred.utilization, 100)}%`,
                                        backgroundColor: getRiskColor(pred.risk),
                                        height:          '100%',
                                        borderRadius:    '4px',
                                        transition:      'width 0.4s ease',
                                    }} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t"
                                style={{ borderColor: 'var(--border-color)' }}>
                                <div>
                                    <p className="text-xs text-muted mb-1">Allocated</p>
                                    <p className="font-semibold">₹{pred.allocated} Cr</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted mb-1">Unused (Predicted)</p>
                                    <p className="font-semibold text-alert">₹{pred.unused} Cr</p>
                                </div>
                            </div>

                            {pred.reallocation_suggestion && (
                                <div className="mt-4 p-3 rounded-md text-xs text-muted"
                                    style={{ backgroundColor: 'var(--bg-secondary)' }}>
                                    💡 {pred.reallocation_suggestion}
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}

            {/* Chart */}
            {chartData.length > 0 && (
                <Card title="Predicted Unused Funds by Department">
                    <div style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false}
                                    tickFormatter={v => `₹${v}Cr`} />
                                <Tooltip formatter={value => [`₹${value} Cr`, 'Unused']} />
                                {/* FIX: Cell colour now works because risk is UPPERCASE */}
                                <Bar dataKey="unused" name="Predicted Unused" radius={[4, 4, 0, 0]}>
                                    {chartData.map((entry, i) => (
                                        <Cell key={i} fill={getRiskColor(entry.risk)} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Risk legend */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted justify-end">
                        {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(r => (
                            <span key={r} className="flex items-center gap-1">
                                <span style={{
                                    width: 10, height: 10, borderRadius: 2,
                                    backgroundColor: getRiskColor(r), display: 'inline-block',
                                }} />
                                {r}
                            </span>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
}