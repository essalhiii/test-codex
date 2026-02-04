# Demandes d'Achat (DA) - Full Stack Docker

Projet full stack dockerisé pour gérer les Demandes d’Achat avec NestJS + Prisma + PostgreSQL et frontend React.

## Stack
- Backend: NestJS + Prisma + JWT + RBAC + Swagger + ExcelJS + PDFKit
- DB: PostgreSQL
- Frontend: React + Vite + TypeScript + React Router
- Outils: pgAdmin

## Structure
```
/backend
  /prisma
  /src
/frontend
```

## Lancement (Docker)
1. Copier `.env.example` en `.env` et ajuster si besoin.
2. Construire et démarrer:

```bash
docker compose up -d --build
```

3. Appliquer migrations + seed:

```bash
docker compose exec backend npm run prisma:migrate

docker compose exec backend npm run prisma:seed
```

## Accès
- Backend API: http://localhost:3000
- Swagger: http://localhost:3000/swagger
- Frontend: http://localhost:5173
- pgAdmin: http://localhost:5050

## Utilisateurs de test (password: `password`)
- requester@example.com (REQUESTER)
- deptmanager@example.com (DEPT_MANAGER)
- plantmanager@example.com (PLANT_MANAGER)
- purchmanager@example.com (PURCH_MANAGER)
- buyer@example.com (BUYER)
- admin@example.com (ADMIN)

## Workflow
DRAFT → submit → PENDING_DEPT_MANAGER → PENDING_PLANT_MANAGER → TO_DISTRIBUTE → ASSIGNED_TO_BUYER → IN_PROGRESS → CLOSED

Statuts alternatifs: INFO_REQUESTED, CHANGE_REQUESTED, REJECTED

## Exports
- Excel: `GET /pr/export/excel`
- PDF: `GET /pr/export/pdf`

## Notes RBAC
- Un user ne valide jamais sa propre DA
- Buyer voit uniquement les DA assignées
- Dept manager voit DA de son département
- Plant manager voit DA de son plant
- Purch manager distribue les DA validées à distribuer
