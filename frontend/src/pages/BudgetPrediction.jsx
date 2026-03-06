import { TrendingUp } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const forecastData = [
    { year: '2020', actual: 4000, forecast: 4000 },
    { year: '2021', actual: 4500, forecast: 4200 },
    { year: '2022', actual: 5200, forecast: 5000 },
    { year: '2023', actual: 6100, forecast: 5800 },
    { year: '2024 (Est)', actual: null, forecast: 7000 },
    { year: '2025 (Est)', actual: null, forecast: 8200 },
    { year: '2026 (Est)', actual: null, forecast: 9500 },
];

export default function BudgetPrediction() {
    return (
        <div className="page-container animate-fade-in">
            <div className="page-header mb-6">
                <h2 className="text-primary">Budget Prediction</h2>
                <p className="text-muted">Long-term forecasting of budget requirements based on historical growth and socio-economic factors.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 mb-6">
                <Card title="National Budget Forecast (5-Year Horizon)">
                    <div className="chart-container" style={{ height: 400 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={forecastData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="year" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}Cr`} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <Tooltip formatter={(value) => [`₹${value} Cr`, '']} />
                                <Area type="monotone" dataKey="actual" name="Actual Spending" stroke="var(--primary)" fillOpacity={1} fill="url(#colorActual)" />
                                <Area type="monotone" dataKey="forecast" name="AI Forecast" stroke="var(--accent)" strokeDasharray="5 5" fillOpacity={1} fill="url(#colorForecast)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-3 gap-6">
                <Card>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="icon-wrapper bg-primary-transparent text-primary">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-muted">Predicted Infra Budget (Next Year)</p>
                            <h3 className="text-2xl font-bold">₹24,500 Cr</h3>
                        </div>
                    </div>
                    <Badge variant="success" className="w-full justify-center">Expected Growth: +18.5%</Badge>
                </Card>

                <Card>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="icon-wrapper bg-alert-transparent text-alert">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-muted">Predicted Health Budget (Next Year)</p>
                            <h3 className="text-2xl font-bold">₹15,200 Cr</h3>
                        </div>
                    </div>
                    <Badge variant="success" className="w-full justify-center">Expected Growth: +22.8%</Badge>
                </Card>

                <Card>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="icon-wrapper bg-warning-transparent text-warning">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-muted">Predicted Edu Budget (Next Year)</p>
                            <h3 className="text-2xl font-bold">₹18,000 Cr</h3>
                        </div>
                    </div>
                    <Badge variant="success" className="w-full justify-center">Expected Growth: +12.0%</Badge>
                </Card>
            </div>
        </div>
    );
}
