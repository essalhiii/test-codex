import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nextStatusForLevel } from "@/lib/workflow";
import { sendWorkflowEmail } from "@/lib/email/sender";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const requestItem = await prisma.purchaseRequest.update({
    where: { id: params.id },
    data: { status: nextStatusForLevel("DEPT_MANAGER") },
    include: { createdBy: true, comparativeTable: true }
  });

  await prisma.approvalStep.create({
    data: {
      requestId: params.id,
      level: "DEPT_MANAGER",
      approverRole: "DEPT_MANAGER"
    }
  });

  await prisma.auditLog.create({
    data: {
      requestId: params.id,
      actorUserId: requestItem.createdById,
      action: "SUBMITTED",
      metadataJson: JSON.stringify({ status: requestItem.status })
    }
  });

  await sendWorkflowEmail("dept.manager@example.com", requestItem.createdBy.email, {
    reference: requestItem.reference,
    department: requestItem.department,
    recommendedSupplier: requestItem.comparativeTable?.recommendedSupplierId ?? undefined,
    recommendedAmount: requestItem.comparativeTable?.totalRecommendedAmount ?? undefined,
    requestUrl: `${process.env.APP_URL}/requests/${params.id}`,
    decisionExpected: "Validation niveau 1"
  });

  return NextResponse.json(requestItem);
}
