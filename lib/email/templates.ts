export type EmailPayload = {
  reference: string;
  department: string;
  recommendedSupplier?: string | null;
  recommendedAmount?: string | null;
  requestUrl: string;
  decisionExpected?: string;
  comment?: string | null;
};

export function buildSubject(reference: string) {
  return `[ACHATS] Validation requise – Tableau comparatif #${reference}`;
}

export function buildHtml(payload: EmailPayload) {
  return `
  <div style="font-family:Arial,sans-serif;line-height:1.5;">
    <h2>Validation du tableau comparatif</h2>
    <p><strong>Référence :</strong> ${payload.reference}</p>
    <p><strong>Département :</strong> ${payload.department}</p>
    <p><strong>Fournisseur recommandé :</strong> ${payload.recommendedSupplier ?? "-"}</p>
    <p><strong>Montant recommandé :</strong> ${payload.recommendedAmount ?? "-"}</p>
    ${
      payload.comment
        ? `<p><strong>Commentaire :</strong> ${payload.comment}</p>`
        : ""
    }
    ${
      payload.decisionExpected
        ? `<p><strong>Décision attendue :</strong> ${payload.decisionExpected}</p>`
        : ""
    }
    <p>
      <a href="${payload.requestUrl}">Accéder à la demande</a>
    </p>
  </div>
  `;
}

export function buildText(payload: EmailPayload) {
  return [
    "Validation du tableau comparatif",
    `Référence : ${payload.reference}`,
    `Département : ${payload.department}`,
    `Fournisseur recommandé : ${payload.recommendedSupplier ?? "-"}`,
    `Montant recommandé : ${payload.recommendedAmount ?? "-"}`,
    payload.comment ? `Commentaire : ${payload.comment}` : null,
    payload.decisionExpected ? `Décision attendue : ${payload.decisionExpected}` : null,
    `Accéder à la demande : ${payload.requestUrl}`
  ]
    .filter(Boolean)
    .join("\n");
}
