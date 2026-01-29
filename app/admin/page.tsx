const users = [
  { name: "Marie Lopez", role: "ADMIN", department: "Achats" },
  { name: "Julien Roux", role: "REQUESTER", department: "Production" },
  { name: "Nadia Khan", role: "DEPT_MANAGER", department: "Production" }
];

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Administration</h1>
        <p className="text-sm text-slate-500">Gestion des utilisateurs, rôles et paramètres email.</p>
      </header>
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Utilisateurs</h2>
          <button className="rounded bg-slate-900 px-3 py-2 text-xs font-semibold text-white">
            Ajouter
          </button>
        </div>
        <ul className="mt-4 space-y-2 text-sm text-slate-600">
          {users.map((user) => (
            <li key={user.name} className="flex items-center justify-between">
              <span>
                {user.name} • {user.department}
              </span>
              <span className="text-xs font-semibold text-slate-500">{user.role}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
