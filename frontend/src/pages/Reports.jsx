import { FileText, FileSpreadsheet, Download } from 'lucide-react';
import Card from '../components/ui/Card';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';

export default function Reports() {
    const reportsList = [
        { title: 'National Budget Summary', desc: 'High-level overview of allocated vs spent budgets across all states.', type: 'pdf' },
        { title: 'Department Utilization Report', desc: 'Detailed breakdown of utilization rates grouped by department.', type: 'excel' },
        { title: 'AI Anomaly Intelligence', desc: 'Log of all flagged anomalies, risk factors, and investigation statuses.', type: 'csv' },
        { title: 'Lapse Prediction Forecast', desc: 'Predictive models for Q4 expected lapses by district.', type: 'pdf' },
    ];

    return (
        <div className="page-container animate-fade-in">
            <div className="page-header mb-6">
                <h2 className="text-primary">Financial Reports</h2>
                <p className="text-muted">Generate and export official documentation and data extracts.</p>
            </div>

            {/* Generator Form */}
            <Card title="Custom Report Generator" className="mb-8">
                <div className="grid grid-cols-4 gap-4 items-end">
                    <Select label="State" options={[{ value: '', label: 'All States' }]} />
                    <Select label="Department" options={[{ value: '', label: 'All Departments' }]} />
                    <Select label="Financial Year" options={[{ value: '', label: '2023-24' }]} />
                    <Button variant="primary" className="gap-2 w-full"><Download size={16} /> Generate Report</Button>
                </div>
            </Card>

            {/* Standard Reports */}
            <h3 className="text-lg mb-4">Standard Reports</h3>
            <div className="grid grid-cols-2 gap-6">
                {reportsList.map((rep, idx) => (
                    <Card key={idx} className="flex hover:border-primary transition-colors cursor-pointer">
                        <div className="flex items-start justify-between w-full">
                            <div className="flex gap-4">
                                <div className={`icon-wrapper ${rep.type === 'pdf' ? 'bg-alert-transparent text-alert' : 'bg-success-transparent text-success'}`}>
                                    {rep.type === 'pdf' ? <FileText size={24} /> : <FileSpreadsheet size={24} />}
                                </div>
                                <div>
                                    <h4 className="text-md mb-1">{rep.title}</h4>
                                    <p className="text-sm text-muted">{rep.desc}</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm">Export</Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
