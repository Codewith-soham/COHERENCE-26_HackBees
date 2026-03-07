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
                .map((a, i) => {
                    const riskScore = Math.min(Math.round(a.anomaly_score * 100), 100);
                    // Determine severity based on score
                    let severity;
                    if (riskScore >= 75) severity = 'CRITICAL';
                    else if (riskScore >= 50) severity = 'HIGH';
                    else if (riskScore >= 25) severity = 'MEDIUM';
                    else severity = 'LOW';

                    return {
                        id: i + 1,
                        state: a.state || 'N/A',
                        district: a.district,
                        dept: a.department,
                        riskScore,
                        reason: a.explanation,
                        severity,
                    };
                });

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
                {anomalies.map((anom) => {
                    // Determine colors based on severity
                    const getBorderColor = () => {
                        if (anom.severity === 'CRITICAL') return 'var(--alert)';
                        if (anom.severity === 'HIGH') return 'var(--warning, orange)';
                        if (anom.severity === 'MEDIUM') return 'var(--warning-light, #f59e0b)';
                        return 'var(--success, green)';
                    };
                    const getBadgeVariant = () => {
                        if (anom.severity === 'CRITICAL') return 'alert';
                        if (anom.severity === 'HIGH') return 'warning';
                        if (anom.severity === 'MEDIUM') return 'warning';
                        return 'success';
                    };

                    return (
                        <Card key={anom.id} className="border-l-4" style={{ borderLeftColor: getBorderColor() }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px' }}>
                                <div style={{ flex: 1 }}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <Badge variant={getBadgeVariant()}>
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
                                <div style={{ width: '180px', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <p className="text-sm text-muted mb-1" style={{ textAlign: 'center' }}>AI Risk Score</p>
                                    <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', marginBottom: '16px', justifyContent: 'center' }}>
                                        <span className="text-3xl font-bold leading-none">{anom.riskScore}</span>
                                        <span className="text-sm text-muted leading-none">/100</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                                        <Button variant="primary" size="sm" style={{ width: '100%' }}>Investigate</Button>
                                        <Button variant="outline" size="sm" style={{ width: '100%' }}>Dismiss</Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}