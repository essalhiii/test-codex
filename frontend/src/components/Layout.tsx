import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const roleMenu: Record<string, { label: string; path: string }[]> = {
  REQUESTER: [
    { label: 'Create PR', path: '/requester/create' },
    { label: 'My PRs', path: '/requester/list' },
  ],
  DEPT_MANAGER: [{ label: 'Pending Approvals', path: '/dept-manager/pending' }],
  PLANT_MANAGER: [{ label: 'Pending Approvals', path: '/plant-manager/pending' }],
  PURCH_MANAGER: [
    { label: 'To Distribute', path: '/purch-manager/distribute' },
    { label: 'Assign Buyer', path: '/purch-manager/assign' },
  ],
  BUYER: [{ label: 'My Assigned PRs', path: '/buyer/assigned' }],
  ADMIN: [
    { label: 'Admin Users', path: '/admin/users' },
    { label: 'Dashboard KPI', path: '/dashboard' },
  ],
};

export default function Layout() {
  const { user, logout } = useAuth();
  if (!user) {
    return <Outlet />;
  }

  const menuItems = roleMenu[user.role] || [];
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <nav style={{ width: 240, padding: 20, borderRight: '1px solid #ddd' }}>
        <h3>DA App</h3>
        <p>{user.name}</p>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {menuItems.map((item) => (
            <li key={item.path} style={{ marginBottom: 8 }}>
              <Link to={item.path}>{item.label}</Link>
            </li>
          ))}
        </ul>
        <button onClick={logout}>Logout</button>
      </nav>
      <main style={{ flex: 1, padding: 20 }}>
        <Outlet />
      </main>
    </div>
  );
}
