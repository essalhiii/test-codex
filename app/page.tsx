import Link from "next/link";

export default function HomePage() {
  return (
    <main className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-semibold text-slate-500">Procurement workflow</p>
        <h1 className="text-3xl font-semibold">Validation des tableaux comparatifs</h1>
        <p className="text-slate-600">
          Plateforme de gestion des demandes d'achat, validations multi-niveaux et export PDF.
        </p>
      </header>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Se connecter
        </Link>
        <Link
          href="/dashboard"
          className="rounded border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
        >
          Tableau de bord
        </Link>
      </div>
    </main>
  );
}
