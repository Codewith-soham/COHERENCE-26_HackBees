import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Activity,
    AlertTriangle,
    TrendingDown,
    ArrowRightLeft,
    LineChart,
    PlusCircle,
    FileText,
    Settings
} from 'lucide-react';
import './Sidebar.css';

export default function Sidebar({ isOpen }) {
    const menuItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Budget Monitoring', path: '/monitoring', icon: Activity },
        { name: 'Anomaly Detection', path: '/anomalies', icon: AlertTriangle },
        { name: 'Lapse Prediction', path: '/lapse', icon: TrendingDown },
        { name: 'Fund Reallocation', path: '/reallocation', icon: ArrowRightLeft },
        { name: 'Budget Prediction', path: '/prediction', icon: LineChart },
        { name: 'Real-Time Entry', path: '/entry', icon: PlusCircle },
        { name: 'Reports', path: '/reports', icon: FileText },
        { name: 'Settings', path: '/settings', icon: Settings },
    ];

    return (
        <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
            <div className="sidebar-logo">
                <h2 className="text-accent">{isOpen ? 'BudgetSetu' : 'BS'}</h2>
            </div>
            <nav className="sidebar-nav">
                <ul>
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                >
                                    <Icon size={20} />
                                    {isOpen && <span>{item.name}</span>}
                                </NavLink>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </aside>
    );
}
