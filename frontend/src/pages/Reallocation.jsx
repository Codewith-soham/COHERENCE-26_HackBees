import { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

export default function Reallocation() {
    const [reallocations, setReallocations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReallocations();
    }, []);

    const fetchReallocations = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/prediction/all');
            const json = await res.json();
            const data = json.data || [];

            // Only show HIGH and MEDIUM risk predictions that have reallocation suggestions
            const mapped = data
                .filter(p => p.risk_level !== 'LOW' && p.reallocation_suggestion)
                .map((p, i) => ({
                    id: i + 1,
                    source: p.department,
                    dest: extractDestination(p.reallocation_suggestion),
                    amount: Math.round((p.predicted_unused) / 10000000),
                    sourceUtil: p.allocated_amount > 0
                        ? Math.round((p.projected_spending / p.allocated_amount) * 100)
                        : 0,
                    destUtil: p.risk_level === 'HIGH' ? 95 : 80,
                    reason: p.reallocation_suggestion,
                    risk: p.risk_level,
                }));

            setReallocations(mapped);
        } catch (err) {
            console.error('Reallocation fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Try to extract destination department from AI suggestion text
    const extractDestination = (suggestion) => {
        const match = suggestion.match(/to ([A-Za-z\s]+) department/i);
        return match ? match[1].trim() : 'Priority Sector';
    };

    if (loading) return <div className="page-container"><p className="text-muted">Loading reallocation recommendations...</p></div>;

    return (
        <div className="page-container animate-fade-in">
            <div className="page-header mb-6">
                <h2 className="text-primary">Fund Reallocation</h2>
                <p className="text-muted">AI-driven recommendations for redistributing underutilized funds to high-priority sectors.</p>
            </div>

            {reallocations.length === 0 && (
                <Card>
                    <p className="text-muted text-center py-6">
                        No reallocation recommendations yet. Run predictions on HIGH or MEDIUM risk departments to generate suggestions.
                    </p>
                </Card>
            )}

            <div className="grid gap-6">
                {reallocations.map((rec) => (
                    <Card key={rec.id}>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Badge variant={rec.risk === 'HIGH' ? 'alert' : 'warning'}>
                                    {rec.risk === 'HIGH' ? 'Critical Priority' : 'High Priority Match'}
                                </Badge>
                                <span className="text-sm text-muted">Recommendation #{rec.id}</span>
                            </div>
                            <Button variant="primary" size="sm" className="gap-2">
                                <CheckCircle2 size={16} /> Approve Reallocation
                            </Button>
                        </div>

                        <div className="flex items-stretch justify-between mb-6 bg-secondary p-6 rounded-lg border border-gray-200">
                            {/* Source */}
                            <div className="flex-1 text-center">
                                <p className="text-sm text-muted mb-1">Source Department</p>
                                <h3 className="text-xl mb-2 text-primary">{rec.source}</h3>
                                <Badge variant="warning">Low Utilization ({rec.sourceUtil}%)</Badge>
                            </div>

                            {/* Flow amount */}
                            <div className="flex-1 flex flex-col items-center justify-center px-4">
                                <p className="text-lg font-bold text-accent mb-2">₹{rec.amount} Cr</p>
                                <div className="w-full flex items-center justify-center">
                                    <div className="h-px bg-border-color flex-1 relative">
                                        <ArrowRight size={24} className="text-accent absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-secondary px-1" />
                                    </div>
                                </div>
                            </div>

                            {/* Destination */}
                            <div className="flex-1 text-center">
                                <p className="text-sm text-muted mb-1">Destination Department</p>
                                <h3 className="text-xl mb-2 text-primary">{rec.dest}</h3>
                                <Badge variant="alert">High Demand ({rec.destUtil}%)</Badge>
                            </div>
                        </div>

                        <div className="bg-primary-transparent p-4 rounded-md">
                            <p className="text-sm"><strong>AI Reason for Recommendation:</strong> {rec.reason}</p>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}