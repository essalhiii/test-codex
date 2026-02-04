import React from 'react';

const downloadFile = async (path: string, filename: string) => {
  const response = await fetch(path, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
  });
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
};

export default function Dashboard() {
  return (
    <div>
      <h2>Dashboard KPI</h2>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <button onClick={() => downloadFile('http://localhost:3000/pr/export/excel', 'requests.xlsx')}>
          Export Excel
        </button>
        <button onClick={() => downloadFile('http://localhost:3000/pr/export/pdf', 'requests.pdf')}>
          Export PDF
        </button>
      </div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <div style={{ padding: 16, border: '1px solid #ddd', borderRadius: 8 }}>Total PRs: 42</div>
        <div style={{ padding: 16, border: '1px solid #ddd', borderRadius: 8 }}>In Progress: 12</div>
        <div style={{ padding: 16, border: '1px solid #ddd', borderRadius: 8 }}>Closed: 18</div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label>
          Filter Plant:
          <select style={{ marginLeft: 8 }}>
            <option>KT1</option>
            <option>KT2</option>
          </select>
        </label>
        <label style={{ marginLeft: 16 }}>
          Date:
          <input type="date" style={{ marginLeft: 8 }} />
        </label>
      </div>
      <div style={{ height: 240, border: '1px dashed #999', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Charts placeholder
      </div>
    </div>
  );
}
