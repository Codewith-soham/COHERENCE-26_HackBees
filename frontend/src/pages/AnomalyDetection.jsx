import { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

export default function AnomalyDetection() {
    const [anomalies, setAnomalies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnomalies();
    }, []);

    const fetchAnomalies = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/anomaly/all');
            const json = await res.json();
            const data = json.data || [];

            // Only show detected anomalies, map to frontend shape
            const mapped = data
                .filter(a => a.anomaly_detected)
                .map((a, i) => ({
                    id: i + 1,
                    state: a.state || 'N/A',
                    district: a.district,
                    dept: a.department,
                    riskScore: Math.round(a.anomaly_score * 100), // 0-1 → 0-100
                    reason: a.explanation,
                    severity: a.severity,
                }));

            setAnomalies(mapped);
        } catch (err) {
            console.error('Anomaly fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="page-container"><p className="text-muted">Loading anomalies...</p></div>;

    return (
        <div className="page-container animate-fade-in">
            <div className="page-header mb-6">
                <h2 className="text-primary">AI Anomaly Detection</h2>
                <p className="text-muted">Review suspicious spending patterns identified by the AI engine.</p>
            </div>

            {anomalies.length === 0 && (
                <Card><p className="text-muted text-center py-6">No anomalies detected yet. Submit budget data to begin analysis.</p></Card>
            )}

            <div className="grid grid-cols-1 gap-6 mb-6">
                {anomalies.map((anom) => (
                    <Card key={anom.id} className="border-l-4" style={{ borderLeftColor: anom.riskScore > 90 ? 'var(--alert)' : 'var(--accent)' }}>
                        <div className="flex gap-6 items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <Badge variant={anom.riskScore > 90 ? 'alert' : 'warning'}>
                                        {anom.severity} Risk
                                    </Badge>
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
                            <div className="w-64 flex flex-col items-end border-l border-gray-200 pl-6" style={{ borderColor: 'var(--border-color)' }}>
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