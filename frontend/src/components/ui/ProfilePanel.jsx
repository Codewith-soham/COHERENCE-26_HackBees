import { X, LogOut, Edit } from 'lucide-react';

export default function ProfilePanel({ isOpen, onClose, onLogout }) {
  if (!isOpen) return null;

  const userData = {
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@gov.in',
    role: 'Government Finance Officer',
    department: 'Finance Ministry',
    state: 'Maharashtra',
    lastLogin: new Date().toLocaleString(),
  };

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  };

  const panelStyle = {
    position: 'fixed',
    top: 0,
    right: 0,
    width: '320px',
    height: '100vh',
    backgroundColor: 'var(--bg-main)',
    borderLeft: '1px solid var(--border-color)',
    zIndex: 1000,
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    animation: 'slideIn 0.3s ease',
  };

  const closeButtonStyle = {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    padding: '8px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const avatarStyle = {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: '600',
    margin: '32px auto 16px',
  };

  const nameStyle = {
    fontSize: '20px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    textAlign: 'center',
    marginBottom: '4px',
  };

  const emailStyle = {
    fontSize: '14px',
    color: 'var(--text-muted)',
    textAlign: 'center',
    marginBottom: '24px',
  };

  const infoContainerStyle = {
    backgroundColor: 'var(--bg-card)',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '24px',
    border: '1px solid var(--border-color)',
  };

  const infoRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid var(--border-color)',
  };

  const infoRowLastStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0',
  };

  const labelStyle = {
    fontSize: '13px',
    color: 'var(--text-muted)',
  };

  const valueStyle = {
    fontSize: '13px',
    color: 'var(--text-primary)',
    fontWeight: '500',
  };

  const buttonContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: 'auto',
  };

  const editButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: 'var(--primary)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  };

  const logoutButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: 'transparent',
    color: '#ef4444',
    border: '1px solid #ef4444',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <>
      <div style={overlayStyle} onClick={onClose} />
      <div style={panelStyle}>
        <button style={closeButtonStyle} onClick={onClose}>
          <X size={20} />
        </button>

        <div style={avatarStyle}>{getInitials(userData.name)}</div>
        <h3 style={nameStyle}>{userData.name}</h3>
        <p style={emailStyle}>{userData.email}</p>

        <div style={infoContainerStyle}>
          <div style={infoRowStyle}>
            <span style={labelStyle}>Role</span>
            <span style={valueStyle}>{userData.role}</span>
          </div>
          <div style={infoRowStyle}>
            <span style={labelStyle}>Department</span>
            <span style={valueStyle}>{userData.department}</span>
          </div>
          <div style={infoRowStyle}>
            <span style={labelStyle}>State</span>
            <span style={valueStyle}>{userData.state}</span>
          </div>
          <div style={infoRowLastStyle}>
            <span style={labelStyle}>Last Login</span>
            <span style={valueStyle}>{userData.lastLogin}</span>
          </div>
        </div>

        <div style={buttonContainerStyle}>
          <button style={editButtonStyle}>
            <Edit size={16} />
            Edit Profile
          </button>
          <button style={logoutButtonStyle} onClick={onLogout}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
