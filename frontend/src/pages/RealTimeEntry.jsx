import { useState } from 'react';
import { Send, UploadCloud } from 'lucide-react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';

export default function RealTimeEntry() {
    const [formData, setFormData] = useState({
        state: '',
        district: '',
        department: '',
        fy: '2023-24',
        type: 'allocation',
        allocated: '',
        spent: '',
        remarks: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRadioChange = (type) => {
        setFormData(prev => ({ ...prev, type }));
    };

    // Preview calculations
    const allocNum = Number(formData.allocated) || 0;
    const spentNum = Number(formData.spent) || 0;
    const utilPerc = allocNum > 0 ? Math.min(100, (spentNum / allocNum) * 100).toFixed(1) : 0;

    return (
        <div className="page-container animate-fade-in">
            <div className="page-header mb-6">
                <h2 className="text-primary">Real-Time Budget Entry</h2>
                <p className="text-muted">Manually input or update budget allocations and expenditure records.</p>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Form Column */}
                <div className="col-span-2">
                    <Card title="Transaction Details">
                        <form className="flex flex-col gap-6">

                            <div className="grid grid-cols-2 gap-4">
                                <Select label="State" name="state" value={formData.state} onChange={handleChange} options={[
                                    { value: '', label: 'Select State' },
                                    { value: 'mh', label: 'Maharashtra' },
                                    { value: 'dl', label: 'Delhi' }
                                ]} />
                                <Select label="District" name="district" value={formData.district} onChange={handleChange} options={[
                                    { value: '', label: 'Select District' },
                                    { value: 'pune', label: 'Pune' },
                                    { value: 'nd', label: 'New Delhi' }
                                ]} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Select label="Department" name="department" value={formData.department} onChange={handleChange} options={[
                                    { value: '', label: 'Select Department' },
                                    { value: 'health', label: 'Health' },
                                    { value: 'edu', label: 'Education' }
                                ]} />
                                <Select label="Financial Year" name="fy" value={formData.fy} onChange={handleChange} options={[
                                    { value: '2022-23', label: '2022-23' },
                                    { value: '2023-24', label: '2023-24' },
                                    { value: '2024-25', label: '2024-25' }
                                ]} />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium">Transaction Type</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="type" checked={formData.type === 'allocation'} onChange={() => handleRadioChange('allocation')} />
                                        <span>Budget Allocation</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="type" checked={formData.type === 'spending'} onChange={() => handleRadioChange('spending')} />
                                        <span>Budget Spending</span>
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Allocated Budget (₹ Cr)" type="number" name="allocated" value={formData.allocated} onChange={handleChange} placeholder="e.g. 500" />
                                <Input label="Amount Spent (₹ Cr)" type="number" name="spent" value={formData.spent} onChange={handleChange} placeholder="e.g. 200" disabled={formData.type === 'allocation'} />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium">Remarks (Optional)</label>
                                <textarea
                                    className="input-field"
                                    rows="3"
                                    name="remarks"
                                    value={formData.remarks}
                                    onChange={handleChange}
                                    placeholder="Add any notes relevant to this transaction..."
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-4 mt-2">
                                <Button type="button" variant="outline">Reset Form</Button>
                                <Button type="button" variant="primary" className="gap-2"><Send size={16} /> Submit Transaction</Button>
                            </div>

                        </form>
                    </Card>
                </div>

                {/* Live Preview Column */}
                <div className="col-span-1">
                    <Card title="Live Utilization Preview" className="mb-6">
                        <div className="flex flex-col gap-4">
                            <div className="bg-secondary p-4 rounded text-center">
                                <p className="text-sm text-muted mb-1">Current Utilization</p>
                                <h3 className={`text-3xl ${utilPerc > 90 ? 'text-alert' : 'text-primary'}`}>{utilPerc}%</h3>
                            </div>

                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Progress</span>
                                    <span>{utilPerc}%</span>
                                </div>
                                <div style={{ backgroundColor: 'var(--bg-secondary)', height: '10px', borderRadius: '5px' }}>
                                    <div style={{
                                        width: `${utilPerc}%`,
                                        backgroundColor: utilPerc > 90 ? 'var(--alert)' : 'var(--primary)',
                                        height: '100%',
                                        borderRadius: '5px',
                                        transition: 'width 0.3s ease'
                                    }}></div>
                                </div>
                            </div>

                            <div className="text-sm text-muted mt-2">
                                <p><strong>Available:</strong> ₹{Math.max(0, allocNum - spentNum)} Cr</p>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="text-center py-6">
                            <UploadCloud size={48} className="text-muted mx-auto mb-4 opacity-50" />
                            <h4 className="mb-2">Bulk Upload</h4>
                            <p className="text-sm text-muted mb-4">Upload a CSV or Excel file for multiple entries.</p>
                            <Button variant="outline" size="sm" className="w-full">Choose File</Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
