import { PrismaClient, Role, RequestStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.emailLog.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.approvalStep.deleteMany();
  await prisma.comparativeTable.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.purchaseRequest.deleteMany();
  await prisma.user.deleteMany();

  const users = await prisma.user.createMany({
    data: [
      {
        name: "Luc Martin",
        email: "requester@example.com",
        role: Role.REQUESTER,
        department: "Production"
      },
      {
        name: "Camille Durant",
        email: "dept.manager@example.com",
        role: Role.DEPT_MANAGER,
        department: "Production"
      },
      {
        name: "Amina Khalil",
        email: "proc.manager@example.com",
        role: Role.PROCUREMENT_MANAGER,
        department: "Achats"
      },
      {
        name: "Jonas Weber",
        email: "plant.director@example.com",
        role: Role.PLANT_DIRECTOR,
        department: "Usine"
      },
      {
        name: "Rita Gomez",
        email: "country.director@example.com",
        role: Role.COUNTRY_DIRECTOR,
        department: "Direction"
      },
      {
        name: "Marie Lopez",
        email: "admin@example.com",
        role: Role.ADMIN,
        department: "Achats"
      }
    ]
  });

  const requester = await prisma.user.findFirstOrThrow({
    where: { role: Role.REQUESTER }
  });

  const suppliers = await prisma.supplier.createMany({
    data: [
      { name: "Supplier A", email: "a@supplier.com", phone: "+33100000001" },
      { name: "Supplier B", email: "b@supplier.com", phone: "+33100000002" },
      { name: "Supplier C", email: "c@supplier.com", phone: "+33100000003" }
    ]
  });

  const supplierList = await prisma.supplier.findMany();

  const request1 = await prisma.purchaseRequest.create({
    data: {
      reference: "PR-2024-041",
      department: "Production",
      title: "Comparatif fourniture industrielle",
      description: "Achat d'équipements pour ligne de production",
      estimatedBudget: 120000,
      createdById: requester.id,
      status: RequestStatus.IN_REVIEW_DEPT
    }
  });

  const request2 = await prisma.purchaseRequest.create({
    data: {
      reference: "PR-2024-042",
      department: "Maintenance",
      title: "Prestations maintenance annuelle",
      description: "Contrats maintenance machines",
      estimatedBudget: 85000,
      createdById: requester.id,
      status: RequestStatus.DRAFT
    }
  });

  for (const request of [request1, request2]) {
    for (const [index, supplier] of supplierList.entries()) {
      await prisma.offer.create({
        data: {
          requestId: request.id,
          supplierId: supplier.id,
          price: 100000 + index * 8000,
          currency: "EUR",
          leadTimeDays: 30 + index * 5,
          incoterm: "DAP",
          paymentTerms: "30 jours fin de mois",
          notes: "Offre standard"
        }
      });
    }

    await prisma.comparativeTable.create({
      data: {
        requestId: request.id,
        criteriaJson: { price: 40, leadTime: 30, service: 30 },
        scoringJson: { supplierA: 75, supplierB: 82, supplierC: 70 },
        recommendedSupplierId: supplierList[1]?.id,
        justification: "Meilleur équilibre coût/délai.",
        totalRecommendedAmount: "118000 EUR"
      }
    });
  }

  await prisma.approvalStep.create({
    data: {
      requestId: request1.id,
      level: "DEPT_MANAGER",
      approverRole: "DEPT_MANAGER"
    }
  });

  console.log({ users, suppliers });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
