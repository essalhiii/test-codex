import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../api/client';

interface PR {
  id: string;
  title: string;
  status: string;
}

export default function PendingApprovals() {
  const [requests, setRequests] = useState<PR[]>([]);

  useEffect(() => {
    apiRequest('/pr').then((data) => {
      setRequests(data.filter((pr: PR) => pr.status.includes('PENDING')));
    });
  }, []);

  return (
    <div>
      <h2>Pending Approvals</h2>
      <ul>
        {requests.map((pr) => (
          <li key={pr.id}>
            <Link to={`/pr/${pr.id}`}>{pr.title}</Link> - {pr.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
