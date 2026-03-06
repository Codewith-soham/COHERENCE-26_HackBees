import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { Clock, TrendingDown } from 'lucide-react';

const predictions = [
    { id: 1, state: 'Bihar', district: 'Patna', dept: 'Education', allocated: 200, spent: 40, utilization: 20, fy: '2023-24', riskLevel: 'High' },
    { id: 2, state: 'Odisha', district: 'Bhubaneswar', dept: 'Agriculture', allocated: 150, spent: 45, utilization: 30, fy: '2023-24', riskLevel: 'High' },
    { id: 3, state: 'Rajasthan', district: 'Jaipur', dept: 'Health', allocated: 300, spent: 150, utilization: 50, fy: '2023-24', riskLevel: 'Medium' },
    { id: 4, state: 'Punjab', district: 'Ludhiana', dept: 'Infrastructure', allocated: 400, spent: 320, utilization: 80, fy: '2023-24', riskLevel: 'Low' },
];

export default function LapsePrediction() {

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

    return (
        <div className="page-container animate-fade-in">
            <div className="page-header mb-6">
                <h2 className="text-primary">Fund Lapse Prediction</h2>
                <p className="text-muted">Identify departments at risk of returning unused budget allocations before the fiscal year ends.</p>
            </div>

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
                    </Card>
                ))}
            </div>

            <Card title="Lapse Risk Analytics">
                <div className="bg-secondary rounded-md flex items-center justify-center text-muted" style={{ height: '300px' }}>
                    <div className="text-center">
                        <TrendingDown size={48} className="mx-auto mb-4 opacity-50" />
                        <p>Predictive model visualization (Historical vs Expected Lapses) will render here.</p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
