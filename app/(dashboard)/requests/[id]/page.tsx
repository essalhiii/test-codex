const approvals = [
  { level: "DEPT_MANAGER", name: "Camille Durant", decision: "APPROVED", date: "2024-05-02" },
  { level: "PROCUREMENT_MANAGER", name: "Ali Ben", decision: "PENDING", date: "" }
];

export default function RequestDetailPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-semibold text-slate-500">PR-2024-041</p>
        <h1 className="text-2xl font-semibold">Comparatif fourniture industrielle</h1>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            IN_REVIEW_PROCUREMENT
          </span>
          <span className="text-xs text-slate-500">Département Production</span>
        </div>
      </header>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-700">Tableau comparatif</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Critère</th>
                <th className="py-2">Supplier A</th>
                <th className="py-2">Supplier B</th>
                <th className="py-2">Supplier C</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-2 font-medium">Prix</td>
                <td className="py-2">€120k</td>
                <td className="py-2">€118k</td>
                <td className="py-2">€126k</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 font-medium">Délai</td>
                <td className="py-2">45 jours</td>
                <td className="py-2">50 jours</td>
                <td className="py-2">38 jours</td>
              </tr>
              <tr>
                <td className="py-2 font-medium">Incoterm</td>
                <td className="py-2">DAP</td>
                <td className="py-2">EXW</td>
                <td className="py-2">DAP</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-700">Recommandation</h2>
          <p className="mt-2 text-sm text-slate-600">Supplier B recommandé.</p>
          <p className="mt-2 text-sm text-slate-500">
            Justification : meilleur rapport coût / délai avec garanties.
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-700">Actions</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="rounded bg-emerald-600 px-4 py-2 text-xs font-semibold text-white">
              Approuver
            </button>
            <button className="rounded bg-amber-500 px-4 py-2 text-xs font-semibold text-white">
              Demander modifications
            </button>
            <button className="rounded bg-rose-600 px-4 py-2 text-xs font-semibold text-white">
              Rejeter
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-700">Historique des validations</h2>
        <ul className="mt-4 space-y-3 text-sm text-slate-600">
          {approvals.map((step) => (
            <li key={step.level} className="flex items-center justify-between">
              <span>
                {step.level} - {step.name}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {step.decision} {step.date && `• ${step.date}`}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
