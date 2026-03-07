import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  AlertTriangle,
  TrendingDown,
  ArrowRightLeft,
  LineChart,
  PlusCircle,
  FileText,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

export default function Sidebar({ isOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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

      <div className="sidebar-user-panel">
        <div className="sidebar-profile">
          <div className="sidebar-avatar">{user?.fullName?.charAt(0).toUpperCase() || '?'}</div>
          {isOpen && (
            <div className="sidebar-user-info">
              <p className="sidebar-user-name">{user?.fullName || 'Officer'}</p>
              <p className="sidebar-user-id">{user?.officerId || '-'}</p>
            </div>
          )}
        </div>

        {isOpen && (
          <div className="sidebar-user-meta">
            <span className="sidebar-dept-badge">{user?.department || 'Department'}</span>
            <span className="sidebar-state">{user?.state || 'State'}</span>
          </div>
        )}

        <button className="sidebar-logout-btn" onClick={handleLogout}>
          <LogOut size={16} />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
