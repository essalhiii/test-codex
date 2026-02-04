import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiRequest } from '../api/client';
import { useAuth } from '../contexts/AuthContext';

interface PR {
  id: string;
  title: string;
  description: string;
  amount: number;
  status: string;
  history?: { action: string; createdAt: string; performedBy: { name: string } }[];
}

export default function PRDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [pr, setPr] = useState<PR | null>(null);

  const fetchPR = () => {
    apiRequest(`/pr/${id}`).then(setPr);
  };

  useEffect(() => {
    fetchPR();
  }, [id]);

  const action = async (path: string) => {
    await apiRequest(`/pr/${id}/${path}`, { method: 'POST' });
    fetchPR();
  };

  if (!pr) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>{pr.title}</h2>
      <p>{pr.description}</p>
      <p>Amount: {pr.amount}</p>
      <p>Status: {pr.status}</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {user?.role === 'REQUESTER' && <button onClick={() => action('submit')}>Submit</button>}
        {user?.role === 'DEPT_MANAGER' && (
          <>
            <button onClick={() => action('approve-dept')}>Approve</button>
            <button onClick={() => action('reject')}>Reject</button>
          </>
        )}
        {user?.role === 'PLANT_MANAGER' && (
          <>
            <button onClick={() => action('approve-plant')}>Approve</button>
            <button onClick={() => action('reject')}>Reject</button>
          </>
        )}
        {user?.role === 'BUYER' && (
          <>
            <button onClick={() => action('request-info')}>Request Info</button>
            <button onClick={() => action('request-change')}>Request Change</button>
            <button onClick={() => action('start')}>In Progress</button>
            <button onClick={() => action('close')}>Close</button>
          </>
        )}
      </div>
      <h3>History</h3>
      <ul>
        {pr.history?.map((item, index) => (
          <li key={index}>
            {item.createdAt}: {item.action} by {item.performedBy.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
