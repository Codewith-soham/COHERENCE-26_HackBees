import { Outlet } from 'react-router-dom';
import './AuthLayout.css'; // Optional: Can add specific styles here or use global

export default function AuthLayout() {
  return (
    <div className="auth-layout container">
      <div className="auth-wrapper">
        <Outlet />
      </div>
    </div>
  );
}
