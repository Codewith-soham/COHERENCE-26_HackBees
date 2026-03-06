import { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function LapsePrediction() {
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchPredictions(); }, []);

    const fetchPredictions = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/prediction/all');
            const json = await res.json();
            const data = json.data || [];

            const mapped = data.map((p, i) => ({
                id: i + 1,
                state: p.state || 'N/A',
                district: p.district,
                dept: p.department,
                allocated: Number(p.allocated_amount),
                spent: Number(p.projected_spending),
                unused: Number(p.predicted_unused),
                utilization: p.allocated_amount > 0
                    ? Math.round((p.projected_spending / p.allocated_amount) * 100)
                    : 0,
                fy: p.financial_year,
                riskLevel: p.risk_level.charAt(0) + p.risk_level.slice(1).toLowerCase(),
                reallocation_suggestion: p.reallocation_suggestion,
            }));

            setPredictions(mapped);
        } catch (err) {
            console.error('Prediction fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (risk) => {
        if (risk === 'High') return 'var(--alert)';
        if (risk === 'Medium') return 'var(--warning)';
        return 'var(--success)';
    };

    const getRiskBadge = (risk) => {
        if (risk === 'High') return 'alert';
        if (risk === 'Medium') return 'warning';
        return 'success';
    };

    const highRisk = predictions.filter(p => p.riskLevel === 'High').length;
    const totalUnused = predictions.reduce((s, p) => s + p.unused, 0);

    const chartData = predictions.map(p => ({
        name: p.dept,
        unused: p.unused,
        risk: p.riskLevel,
    }));

    if (loading) return <div className="page-container"><p className="text-muted">Loading predictions...</p></div>;

    return (
        <div className="page-container animate-fade-in">
            <div className="page-header mb-6">
                <h2 className="text-primary">Fund Lapse Prediction</h2>
                <p className="text-muted">Identify departments at risk of returning unused budget allocations before the fiscal year ends.</p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-6 mb-6">
                <Card className="p-4">
                    <p className="text-sm text-muted">Total Predictions</p>
                    <h3 className="text-2xl font-bold">{predictions.length}</h3>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-muted">HIGH Risk Departments</p>
                    <h3 className="text-2xl font-bold text-alert">{highRisk}</h3>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-muted">Total Predicted Unused</p>
                    <h3 className="text-2xl font-bold text-warning">₹{totalUnused.toFixed(1)} Cr</h3>
                </Card>
            </div>

            {predictions.length === 0 && (
                <Card><p className="text-muted text-center py-6">No predictions yet. Run a prediction from the backend to see results here.</p></Card>
            )}

            <div className="grid grid-cols-3 gap-6 mb-6">
                {predictions.map(pred => (
                    <Card key={pred.id}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="mb-1">{pred.dept}</h4>
                                <p className="text-xs text-muted">{pred.district}, {pred.state}</p>
                            </div>
                            <Badge variant={getRiskBadge(pred.riskLevel)}>{pred.riskLevel} Risk</Badge>
                        </div>

                        <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                                <span>Utilization</span>
                                <span className="font-medium">{pred.utilization}%</span>
                            </div>
                            <div style={{ backgroundColor: 'var(--bg-secondary)', height: '8px', borderRadius: '4px' }}>
                                <div style={{
                                    width: `${Math.min(pred.utilization, 100)}%`,
                                    backgroundColor: getRiskColor(pred.riskLevel),
                                    height: '100%',
                                    borderRadius: '4px'
                                }}></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                            <div>
                                <p className="text-xs text-muted mb-1">Allocated</p>
                                <p className="font-semibold">₹{pred.allocated} Cr</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted mb-1">Unspent Expected</p>
                                <p className="font-semibold text-alert">₹{pred.unused} Cr</p>
                            </div>
                        </div>

                        {pred.reallocation_suggestion && (
                            <div className="mt-4 p-3 rounded-md text-xs text-muted" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                                💡 {pred.reallocation_suggestion}
                            </div>
                        )}
                    </Card>
                ))}
            </div>

            {/* Chart */}
            {chartData.length > 0 && (
                <Card title="Predicted Unused Funds by Department">
                    <div style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}Cr`} />
                                <Tooltip formatter={(value) => [`₹${value} Cr`, 'Unused']} />
                                <Bar dataKey="unused" name="Predicted Unused" fill="var(--alert)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            )}
        </div>
    );
}