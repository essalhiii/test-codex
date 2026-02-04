import React, { useEffect, useState } from 'react';
import { apiRequest } from '../api/client';

interface PR {
  id: string;
  title: string;
}

export default function AssignBuyer() {
  const [requests, setRequests] = useState<PR[]>([]);
  const [buyerId, setBuyerId] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    apiRequest('/pr').then((data) => {
      setRequests(data.filter((pr: any) => pr.status === 'TO_DISTRIBUTE'));
    });
  }, []);

  const assign = async (id: string) => {
    await apiRequest(`/pr/${id}/assign-buyer`, {
      method: 'POST',
      body: JSON.stringify({ buyerId }),
    });
    setStatus(`Assigned buyer to ${id}`);
  };

  return (
    <div>
      <h2>Assign Buyer</h2>
      <label>
        Buyer ID
        <input value={buyerId} onChange={(e) => setBuyerId(e.target.value)} />
      </label>
      <ul>
        {requests.map((pr) => (
          <li key={pr.id}>
            {pr.title} <button onClick={() => assign(pr.id)}>Assign</button>
          </li>
        ))}
      </ul>
      {status && <p>{status}</p>}
    </div>
  );
}
