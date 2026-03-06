import { ArrowRight, CheckCircle2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

const reallocations = [
    { id: 1, source: 'Education', dest: 'Healthcare', amount: 5, sourceUtil: 45, destUtil: 98, reason: 'Critical shortage of beds in district hospitals.' },
    { id: 2, source: 'Tourism', dest: 'Infrastructure', amount: 12, sourceUtil: 30, destUtil: 100, reason: 'Ongoing highway construction requires immediate cash flow.' },
    { id: 3, source: 'Sports', dest: 'Agriculture', amount: 3, sourceUtil: 20, destUtil: 85, reason: 'Unseasonal rains require emergency crop relief funds.' },
];

export default function Reallocation() {
    return (
        <div className="page-container animate-fade-in">
            <div className="page-header mb-6">
                <h2 className="text-primary">Fund Reallocation</h2>
                <p className="text-muted">AI-driven recommendations for redistributing underutilized funds to high-priority sectors.</p>
            </div>

            <div className="grid gap-6">
                {reallocations.map((rec) => (
                    <Card key={rec.id}>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Badge variant="success">High Priority Match</Badge>
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
