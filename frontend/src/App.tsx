import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RequesterCreate from './pages/RequesterCreate';
import RequesterList from './pages/RequesterList';
import PRDetail from './pages/PRDetail';
import PendingApprovals from './pages/PendingApprovals';
import ToDistribute from './pages/ToDistribute';
import AssignBuyer from './pages/AssignBuyer';
import BuyerAssigned from './pages/BuyerAssigned';
import AdminUsers from './pages/AdminUsers';

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/requester/create" element={<RequesterCreate />} />
        <Route path="/requester/list" element={<RequesterList />} />
        <Route path="/dept-manager/pending" element={<PendingApprovals />} />
        <Route path="/plant-manager/pending" element={<PendingApprovals />} />
        <Route path="/purch-manager/distribute" element={<ToDistribute />} />
        <Route path="/purch-manager/assign" element={<AssignBuyer />} />
        <Route path="/buyer/assigned" element={<BuyerAssigned />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/pr/:id" element={<PRDetail />} />
        <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
      </Route>
    </Routes>
  );
}
