import React, { useEffect, useState } from 'react';
import { apiRequest } from '../api/client';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [plants, setPlants] = useState<{ id: string; name: string }[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string; plant: { name: string } }[]>([]);
  const [plantName, setPlantName] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const [departmentPlantId, setDepartmentPlantId] = useState('');

  useEffect(() => {
    apiRequest('/users').then(setUsers);
    apiRequest('/admin/plants').then(setPlants);
    apiRequest('/admin/departments').then(setDepartments);
  }, []);

  const createPlant = async () => {
    if (!plantName) return;
    const plant = await apiRequest('/admin/plants', {
      method: 'POST',
      body: JSON.stringify({ name: plantName }),
    });
    setPlants((prev) => [...prev, plant]);
    setPlantName('');
  };

  const createDepartment = async () => {
    if (!departmentName || !departmentPlantId) return;
    const dept = await apiRequest('/admin/departments', {
      method: 'POST',
      body: JSON.stringify({ name: departmentName, plantId: departmentPlantId }),
    });
    setDepartments((prev) => [...prev, dept]);
    setDepartmentName('');
  };

  return (
    <div>
      <h2>Admin - Users</h2>
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Name</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.email}</td>
              <td>{user.name}</td>
              <td>{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Plants</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input placeholder="Plant name" value={plantName} onChange={(e) => setPlantName(e.target.value)} />
        <button onClick={createPlant}>Add Plant</button>
      </div>
      <ul>
        {plants.map((plant) => (
          <li key={plant.id}>{plant.name}</li>
        ))}
      </ul>
      <h2>Departments</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input placeholder="Department name" value={departmentName} onChange={(e) => setDepartmentName(e.target.value)} />
        <select value={departmentPlantId} onChange={(e) => setDepartmentPlantId(e.target.value)}>
          <option value="">Select plant</option>
          {plants.map((plant) => (
            <option key={plant.id} value={plant.id}>
              {plant.name}
            </option>
          ))}
        </select>
        <button onClick={createDepartment}>Add Department</button>
      </div>
      <ul>
        {departments.map((dept) => (
          <li key={dept.id}>
            {dept.name} - {dept.plant?.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
