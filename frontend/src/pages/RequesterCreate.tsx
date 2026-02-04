import React, { useState } from 'react';
import { apiRequest } from '../api/client';
import { useAuth } from '../contexts/AuthContext';

export default function RequesterCreate() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(0);
  const [status, setStatus] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user?.plantId || !user?.departmentId) {
      setStatus('Missing plant/department');
      return;
    }
    const pr = await apiRequest('/pr', {
      method: 'POST',
      body: JSON.stringify({
        title,
        description,
        amount,
        plantId: user.plantId,
        departmentId: user.departmentId,
      }),
    });
    setStatus(`Created PR ${pr.id}`);
  };

  return (
    <div>
      <h2>Create Purchase Request</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, maxWidth: 480 }}>
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
        <button type="submit">Create</button>
      </form>
      {status && <p>{status}</p>}
    </div>
  );
}
