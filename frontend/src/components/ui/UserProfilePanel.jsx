import { useState, useEffect } from 'react';
import { X, LogOut, Edit, Save, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UserProfilePanel({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: '', department: '', state: '' });

  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem('budgetsetu_user');
      const userData = stored ? JSON.parse(stored) : {};
      setUser(userData);
      setEditForm({
        fullName: userData.fullName || '',
        department: userData.department || '',
        state: userData.state || '',
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogout = () => {
    localStorage.removeItem('budgetsetu_token');
    localStorage.removeItem('budgetsetu_user');
    onClose();
    navigate('/login');
  };

  const handleSaveEdit = () => {
    const updatedUser = { ...user, ...editForm };
    localStorage.setItem('budgetsetu_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditForm({
      fullName: user?.fullName || '',
      department: user?.department || '',
      state: user?.state || '',
    });
    setIsEditing(false);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
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
    overflowY: 'auto',
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
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid var(--border-color)',
  };

  const infoRowLastStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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

  const inputStyle = {
    fontSize: '13px',
    padding: '6px 10px',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    backgroundColor: 'var(--bg-main)',
    color: 'var(--text-primary)',
    width: '140px',
    textAlign: 'right',
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

  const cancelButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: 'transparent',
    color: 'var(--text-muted)',
    border: '1px solid var(--border-color)',
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

  return (
    <>
      <div style={overlayStyle} onClick={onClose} />
      <div style={panelStyle}>
        <button style={closeButtonStyle} onClick={onClose}>
          <X size={20} />
        </button>

        <div style={avatarStyle}>{getInitials(user?.fullName)}</div>
        <h3 style={nameStyle}>{user?.fullName || 'User'}</h3>
        <p style={emailStyle}>{user?.email || '-'}</p>

        <div style={infoContainerStyle}>
          <div style={infoRowStyle}>
            <span style={labelStyle}>Officer ID</span>
            <span style={valueStyle}>{user?.officerId || '-'}</span>
          </div>
          <div style={infoRowStyle}>
            <span style={labelStyle}>Role</span>
            <span style={valueStyle}>Government Finance Officer</span>
          </div>
          <div style={infoRowStyle}>
            <span style={labelStyle}>Full Name</span>
            {isEditing ? (
              <input
                style={inputStyle}
                value={editForm.fullName}
                onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
              />
            ) : (
              <span style={valueStyle}>{user?.fullName || '-'}</span>
            )}
          </div>
          <div style={infoRowStyle}>
            <span style={labelStyle}>Department</span>
            {isEditing ? (
              <input
                style={inputStyle}
                value={editForm.department}
                onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
              />
            ) : (
              <span style={valueStyle}>{user?.department || '-'}</span>
            )}
          </div>
          <div style={infoRowStyle}>
            <span style={labelStyle}>State</span>
            {isEditing ? (
              <input
                style={inputStyle}
                value={editForm.state}
                onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
              />
            ) : (
              <span style={valueStyle}>{user?.state || '-'}</span>
            )}
          </div>
          <div style={infoRowLastStyle}>
            <span style={labelStyle}>Last Login</span>
            <span style={valueStyle}>{new Date().toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div style={buttonContainerStyle}>
          {isEditing ? (
            <>
              <button style={editButtonStyle} onClick={handleSaveEdit}>
                <Save size={16} />
                Save Changes
              </button>
              <button style={cancelButtonStyle} onClick={handleCancelEdit}>
                <XCircle size={16} />
                Cancel
              </button>
            </>
          ) : (
            <button style={editButtonStyle} onClick={() => setIsEditing(true)}>
              <Edit size={16} />
              Edit Profile
            </button>
          )}
          <button style={logoutButtonStyle} onClick={handleLogout}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
