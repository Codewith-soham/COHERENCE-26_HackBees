import { Menu, Search, Bell, User } from 'lucide-react';
import './Header.css';

export default function Header({ toggleSidebar, isSidebarOpen }) {
    return (
        <header className="header">
            <div className="header-left">
                <button className="menu-btn" onClick={toggleSidebar}>
                    <Menu size={24} />
                </button>
                <div className="search-bar">
                    <Search size={20} className="search-icon" />
                    <input type="text" placeholder="Search..." />
                </div>
            </div>
            <div className="header-right">
                <button className="icon-btn">
                    <Bell size={20} />
                    <span className="badge">3</span>
                </button>
                <div className="user-profile">
                    <div className="avatar">
                        <User size={20} />
                    </div>
                    <div className="user-info">
                        <span className="user-name">Officer Name</span>
                        <span className="user-role">Admin</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
