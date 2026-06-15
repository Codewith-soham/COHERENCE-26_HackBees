import { useState } from 'react';
import { Menu, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import UserProfilePanel from '../ui/UserProfilePanel';
import './Header.css';

export default function Header({ toggleSidebar, isSidebarOpen }) {
    const [showProfile, setShowProfile] = useState(false);
    const { user } = useAuth();

    return (
        <header className="header">
            <div className="header-left">
                <button className="menu-btn" onClick={toggleSidebar}>
                    <Menu size={24} />
                </button>
                <h1 
                    className="header-logo" 
                    onClick={() => setShowProfile(true)} 
                    style={{ cursor: 'pointer', margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--primary)' }}
                >
                    BudgetSetu
                </h1>
            </div>
            <div className="header-right">
                <div className="user-profile" onClick={() => setShowProfile(true)} style={{ cursor: 'pointer' }}>
                    <div className="avatar">
                        <User size={20} />
                    </div>
                    <div className="user-info">
                        <span className="user-name">{user?.fullName || 'Officer'}</span>
                        <span className="user-role">{user?.department || 'Department'}</span>
                    </div>
                </div>
            </div>

            <UserProfilePanel
                isOpen={showProfile}
                onClose={() => setShowProfile(false)}
            />
        </header>
    );
}
