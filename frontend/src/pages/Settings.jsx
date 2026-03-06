import { User, Bell, Shield, Key } from 'lucide-react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function Settings() {
    return (
        <div className="page-container animate-fade-in">
            <div className="page-header mb-6">
                <h2 className="text-primary">Settings</h2>
                <p className="text-muted">Manage your profile, preferences, and security options.</p>
            </div>

            <div className="flex gap-8">
                {/* Settings Navigation */}
                <div className="w-64 flex-shrink-0">
                    <Card className="p-2">
                        <ul className="flex flex-col gap-1">
                            <li>
                                <button className="w-full flex items-center gap-3 px-4 py-3 bg-secondary text-primary font-medium rounded-md text-left">
                                    <User size={18} /> Profile Details
                                </button>
                            </li>
                            <li>
                                <button className="w-full flex items-center gap-3 px-4 py-3 text-muted hover:bg-secondary rounded-md text-left transition-colors">
                                    <Bell size={18} /> Notifications
                                </button>
                            </li>
                            <li>
                                <button className="w-full flex items-center gap-3 px-4 py-3 text-muted hover:bg-secondary rounded-md text-left transition-colors">
                                    <Shield size={18} /> Role & Permissions
                                </button>
                            </li>
                            <li>
                                <button className="w-full flex items-center gap-3 px-4 py-3 text-muted hover:bg-secondary rounded-md text-left transition-colors">
                                    <Key size={18} /> Security
                                </button>
                            </li>
                        </ul>
                    </Card>
                </div>

                {/* Settings Content */}
                <div className="flex-1">
                    <Card title="Profile Information">
                        <div className="flex gap-6 mb-8 items-center pb-8 border-b border-gray-200">
                            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                ON
                            </div>
                            <div>
                                <Button variant="outline" size="sm" className="mb-2">Change Avatar</Button>
                                <p className="text-xs text-muted">JPG, GIF or PNG. Max size of 800K</p>
                            </div>
                        </div>

                        <form className="flex flex-col gap-6">
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Full Name" defaultValue="Officer Name" />
                                <Input label="Officer ID" defaultValue="GOV-IND-4829" disabled />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Email Address" type="email" defaultValue="officer@gov.in" />
                                <Input label="Phone Number" type="tel" defaultValue="+91 98765 43210" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Department" defaultValue="Health & Family Welfare" disabled />
                                <Input label="State/Region" defaultValue="Maharashtra" disabled />
                            </div>

                            <div className="flex justify-end gap-4 mt-2">
                                <Button type="button" variant="primary">Save Changes</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
}
