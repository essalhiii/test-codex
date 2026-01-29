const cards = [
  {
    title: "À valider",
    description: "Demandes en attente de votre validation.",
    count: 3
  },
  {
    title: "Mes demandes",
    description: "Suivi des demandes créées.",
    count: 5
  },
  {
    title: "Historique",
    description: "Dernières actions de validation.",
    count: 12
  }
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Tableau de bord</h1>
        <p className="text-sm text-slate-500">
          Vue personnalisée selon votre rôle et vos responsabilités.
        </p>
      </header>
      <section className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <article key={card.title} className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-slate-700">{card.title}</h2>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{card.count}</p>
            <p className="mt-2 text-sm text-slate-500">{card.description}</p>
          </article>
        ))}
      </section>
      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <select className="rounded border border-slate-200 px-3 py-2 text-sm">
            <option>Statut</option>
            <option>En cours</option>
            <option>Rejeté</option>
            <option>Validé</option>
          </select>
          <select className="rounded border border-slate-200 px-3 py-2 text-sm">
            <option>Département</option>
            <option>Production</option>
            <option>Achats</option>
            <option>Finance</option>
          </select>
          <input type="date" className="rounded border border-slate-200 px-3 py-2 text-sm" />
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-700">PR-2024-041</p>
              <p className="text-sm text-slate-500">Comparatif fourniture industrielle</p>
            </div>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
              IN_REVIEW_DEPT
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
