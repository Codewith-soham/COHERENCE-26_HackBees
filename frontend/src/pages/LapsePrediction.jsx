import { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { TrendingDown } from 'lucide-react';

export default function LapsePrediction() {
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPredictions();
    }, []);

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
                allocated: Math.round(p.allocated_amount / 10000000),
                spent: Math.round(p.projected_spending / 10000000),
                utilization: p.allocated_amount > 0
                    ? Math.round((p.projected_spending / p.allocated_amount) * 100)
                    : 0,
                fy: p.financial_year,
                riskLevel: p.risk_level.charAt(0) + p.risk_level.slice(1).toLowerCase(), // HIGH → High
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
        switch (risk) {
            case 'High': return 'var(--alert)';
            case 'Medium': return 'var(--warning)';
            case 'Low': return 'var(--success)';
            default: return 'var(--text-muted)';
        }
    };

    const getRiskBadge = (risk) => {
        switch (risk) {
            case 'High': return 'alert';
            case 'Medium': return 'warning';
            case 'Low': return 'success';
            default: return 'default';
        }
    };

    if (loading) return <div className="page-container"><p className="text-muted">Loading predictions...</p></div>;

    return (
        <div className="page-container animate-fade-in">
            <div className="page-header mb-6">
                <h2 className="text-primary">Fund Lapse Prediction</h2>
                <p className="text-muted">Identify departments at risk of returning unused budget allocations before the fiscal year ends.</p>
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
                                    width: `${pred.utilization}%`,
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
                                <p className="font-semibold text-alert">₹{pred.allocated - pred.spent} Cr</p>
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

            <Card title="Lapse Risk Analytics">
                <div className="bg-secondary rounded-md flex items-center justify-center text-muted" style={{ height: '300px' }}>
                    <div className="text-center">
                        <TrendingDown size={48} className="mx-auto mb-4 opacity-50" />
                        <p>Predictive model visualization will render here once ML model is connected.</p>
                    </div>
                </div>
            </Card>
        </div>
    );
}