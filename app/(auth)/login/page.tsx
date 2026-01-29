export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Connexion</h2>
        <p className="text-sm text-slate-500">
          Authentifiez-vous pour accéder aux demandes et validations.
        </p>
      </div>
      <form className="space-y-4">
        <label className="block text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            className="mt-2 w-full rounded border border-slate-300 px-3 py-2 text-sm"
            placeholder="prenom.nom@entreprise.com"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Mot de passe
          <input
            type="password"
            className="mt-2 w-full rounded border border-slate-300 px-3 py-2 text-sm"
            placeholder="********"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Se connecter
        </button>
      </form>
    </div>
  );
}
