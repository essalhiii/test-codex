import React, { useEffect, useState } from 'react';
import { apiRequest } from '../api/client';

interface PR {
  id: string;
  title: string;
  status: string;
}

export default function ToDistribute() {
  const [requests, setRequests] = useState<PR[]>([]);

  useEffect(() => {
    apiRequest('/pr').then((data) => {
      setRequests(data.filter((pr: PR) => pr.status === 'TO_DISTRIBUTE'));
    });
  }, []);

  return (
    <div>
      <h2>To Distribute</h2>
      <ul>
        {requests.map((pr) => (
          <li key={pr.id}>{pr.title}</li>
        ))}
      </ul>
    </div>
  );
}
