import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Validation achats",
  description: "Workflow de validation des tableaux comparatifs"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen">
        <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
      </body>
    </html>
  );
}
