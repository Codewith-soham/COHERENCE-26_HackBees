import { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

export default function Reallocation() {
    const [reallocations, setReallocations] = useState([]);
    const [totalSuggestions, setTotalSuggestions] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchReallocations(); }, []);

    const fetchReallocations = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/prediction/reallocation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });
            const json = await res.json();
            const data = json.data || {};
            const suggestions = data.suggestions || [];

            setTotalSuggestions(suggestions.length);
            setTotalAmount(suggestions.reduce((s, r) => s + (r.amount_to_reallocate || 0), 0));

            const mapped = suggestions.map((s, i) => ({
                id: i + 1,
                source: s.source_department,
                dest: s.destination_department,
                amount: Number(s.amount_to_reallocate),
                reason: s.reason,
                priority: s.priority,
                sourceUtil: 0,
                destUtil: 0,
            }));

            setReallocations(mapped);
        } catch (err) {
            console.error('Reallocation fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="page-container"><p className="text-muted">Loading reallocation recommendations...</p></div>;

    return (
        <div className="page-container animate-fade-in">
            <div className="page-header mb-6">
                <h2 className="text-primary">Fund Reallocation</h2>
                <p className="text-muted">AI-driven recommendations for redistributing underutilized funds to high-priority sectors.</p>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 gap-6 mb-6">
                <Card className="p-4">
                    <p className="text-sm text-muted">Total Suggestions</p>
                    <h3 className="text-2xl font-bold">{totalSuggestions}</h3>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-muted">Total Reallocatable Amount</p>
                    <h3 className="text-2xl font-bold text-accent">₹{totalAmount.toFixed(1)} Cr</h3>
                </Card>
            </div>

            {reallocations.length === 0 && (
                <Card>
                    <p className="text-muted text-center py-6">
                        No reallocation recommendations yet. Submit budget entries with low utilization to generate suggestions.
                    </p>
                </Card>
            )}

            <div className="grid gap-6">
                {reallocations.map((rec) => (
                    <Card key={rec.id}>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Badge variant={rec.priority === 'HIGH' ? 'alert' : rec.priority === 'MEDIUM' ? 'warning' : 'success'}>
                                    {rec.priority} Priority
                                </Badge>
                                <span className="text-sm text-muted">Recommendation #{rec.id}</span>
                            </div>
                            <Button variant="primary" size="sm" className="gap-2">
                                <CheckCircle2 size={16} /> Approve Reallocation
                            </Button>
                        </div>

                        <div className="flex items-stretch justify-between mb-6 bg-secondary p-6 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                            <div className="flex-1 text-center">
                                <p className="text-sm text-muted mb-1">Source Department</p>
                                <h3 className="text-xl mb-2 text-primary">{rec.source}</h3>
                                <Badge variant="warning">Underutilized</Badge>
                            </div>

                            <div className="flex-1 flex flex-col items-center justify-center px-4">
                                <p className="text-lg font-bold mb-2" style={{ color: 'var(--accent)' }}>₹{rec.amount} Cr</p>
                                <ArrowRight size={32} style={{ color: 'var(--accent)' }} />
                            </div>

                            <div className="flex-1 text-center">
                                <p className="text-sm text-muted mb-1">Destination Department</p>
                                <h3 className="text-xl mb-2 text-primary">{rec.dest}</h3>
                                <Badge variant="alert">High Demand</Badge>
                            </div>
                        </div>

                        <div className="p-4 rounded-md" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                            <p className="text-sm"><strong>AI Reason:</strong> {rec.reason}</p>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}