import { AlertTriangle, TrendingUp, Info } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

const anomalies = [
    {
        id: 1, state: 'Maharashtra', district: 'Pune', dept: 'Health', riskScore: 89,
        reason: 'Spending is 3× higher than the district average for this quarter.', amount: '₹45 Cr'
    },
    {
        id: 2, state: 'Uttar Pradesh', district: 'Lucknow', dept: 'Infrastructure', riskScore: 94,
        reason: 'Sudden spike in fund withdrawal within a 48-hour period.', amount: '₹120 Cr'
    },
    {
        id: 3, state: 'Karnataka', district: 'Bengaluru', dept: 'IT', riskScore: 72,
        reason: 'Unusual vendor payment patterns detected compared to historical data.', amount: '₹15 Cr'
    },
];

export default function AnomalyDetection() {
    return (
        <div className="page-container animate-fade-in">
            <div className="page-header mb-6">
                <h2 className="text-primary">AI Anomaly Detection</h2>
                <p className="text-muted">Review suspicious spending patterns identified by the AI engine.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 mb-6">
                {anomalies.map((anom) => (
                    <Card key={anom.id} className="border-l-4" style={{ borderLeftColor: anom.riskScore > 90 ? 'var(--alert)' : 'var(--accent)' }}>
                        <div className="flex gap-6 items-start">

                            {/* Left Column: Context */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <Badge variant={anom.riskScore > 90 ? 'alert' : 'warning'}>High Risk</Badge>
                                    <h3 className="text-lg">{anom.dept} Department</h3>
                                </div>
                                <p className="text-sm text-muted mb-4">{anom.district}, {anom.state}</p>
                                <div className="bg-secondary p-4 rounded-md flex gap-3">
                                    <Info className="text-primary flex-shrink-0" size={20} />
                                    <div>
                                        <span className="font-medium text-sm block mb-1">AI Explanation:</span>
                                        <span className="text-sm text-dark">{anom.reason}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Numbers/Action */}
                            <div className="w-64 flex flex-col items-end border-l border-gray-200 pl-6 border-opacity-10" style={{ borderColor: 'var(--border-color)' }}>
                                <p className="text-sm text-muted mb-1">Suspicious Amount</p>
                                <h2 className="text-2xl mb-4 text-alert">{anom.amount}</h2>

                                <p className="text-sm text-muted mb-1">AI Risk Score</p>
                                <div className="flex gap-2 items-end mb-6">
                                    <span className="text-3xl font-bold leading-none">{anom.riskScore}</span>
                                    <span className="text-sm text-muted leading-none">/100</span>
                                </div>

                                <div className="flex flex-col gap-2 w-full">
                                    <Button variant="primary" size="sm">Investigate</Button>
                                    <Button variant="outline" size="sm">Dismiss</Button>
                                </div>
                            </div>

                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
