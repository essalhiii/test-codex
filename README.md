# Application de validation des tableaux comparatifs

## User stories
- En tant que **Requester**, je peux créer une demande d'achat, renseigner un tableau comparatif et soumettre la demande pour validation.
- En tant que **Dept Manager**, je peux approuver, rejeter ou demander des modifications sur les demandes en attente de niveau 1.
- En tant que **Procurement Manager**, je valide les demandes après le niveau 1.
- En tant que **Plant Director**, je valide les demandes après le niveau 2.
- En tant que **Country Director**, je donne la validation finale.
- En tant qu'**Admin**, je gère les utilisateurs, les rôles et les paramètres email.
- En tant que **Requester**, je reçois des notifications par email à chaque changement de statut.
- En tant qu'**approbateur**, je reçois un email lorsqu'une action est requise.

## Modèle de données (Prisma)
Les entités principales sont :
- **User** (role, department)
- **PurchaseRequest** (reference, status, createdBy)
- **Supplier**
- **Offer**
- **Attachment**
- **ComparativeTable** (criteriaJson, scoringJson, recommandation)
- **ApprovalStep** (niveau, décision, commentaire)
- **AuditLog** (historique des actions)
- **EmailLog** (statut d'envoi des notifications)

Voir le schéma complet dans `prisma/schema.prisma`.

## Diagramme statuts & transitions (simplifié)
```
DRAFT
  | soumission
  v
IN_REVIEW_DEPT -> IN_REVIEW_PROCUREMENT -> IN_REVIEW_PLANT -> IN_REVIEW_COUNTRY -> APPROVED
  | reject
  v
REJECTED
  | changes requested
  v
CHANGES_REQUESTED -> (resoumission niveau 1) -> IN_REVIEW_DEPT
```
> Politique choisie : après modifications, redémarrage au niveau 1 (standard achats).

## Architecture du projet (arborescence)
```
app/
  (auth)/login
  (dashboard)/dashboard
  (dashboard)/requests/[id]
  admin
  api/
    auth/[...nextauth]
    purchase-requests
      [id]/approve
      [id]/reject
      [id]/request-changes
      [id]/submit
      [id]/export-pdf
components/
lib/
  email/
  pdf/
  prisma.ts
  storage.ts
  workflow.ts
prisma/
  schema.prisma
  seed.ts
```

## Workflow & règles
- Soumission : status -> `IN_REVIEW_DEPT`, création d'une `ApprovalStep` niveau 1.
- Approval : passage au niveau suivant ou `APPROVED` si niveau 4.
- Reject : `REJECTED` + commentaire obligatoire.
- Changes requested : `CHANGES_REQUESTED` + commentaire obligatoire + retour demandeur.
- Validation bloquée si l'utilisateur n'est pas l'approbateur du niveau courant (cf `lib/workflow.ts`).

## Endpoints/API
- `GET /api/purchase-requests` : liste des demandes.
- `POST /api/purchase-requests` : création (draft).
- `POST /api/purchase-requests/:id/submit` : soumission niveau 1.
- `POST /api/purchase-requests/:id/approve` : validation d'un niveau.
- `POST /api/purchase-requests/:id/reject` : rejet.
- `POST /api/purchase-requests/:id/request-changes` : demande de modifications.
- `GET /api/purchase-requests/:id/export-pdf` : export PDF.

## Service Email
- Nodemailer SMTP + retry (3 tentatives) + journalisation `EmailLog`.
- Templates HTML + texte dans `lib/email/templates.ts`.

## PDF
- Génération via `pdf-lib` dans `lib/pdf/generateComparativePdf.ts`.

## Lancer en local
1) Copier `.env.example` vers `.env` et renseigner :
```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
APP_URL=http://localhost:3000
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=achats@example.com
```
2) Installer les dépendances :
```
npm install
```
3) Migration + seed :
```
npm run prisma:migrate
npm run seed
```
4) Lancer :
```
npm run dev
```

## Données seed
- 6 utilisateurs (1 par rôle + admin)
- 2 demandes d'achat
- 3 fournisseurs et 3 offres par demande

