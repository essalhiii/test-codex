import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { decisionToStatus, nextLevel } from "@/lib/workflow";
import { sendWorkflowEmail } from "@/lib/email/sender";

const payloadSchema = z.object({
  level: z.enum(["DEPT_MANAGER", "PROCUREMENT_MANAGER", "PLANT_DIRECTOR", "COUNTRY_DIRECTOR"]),
  approverUserId: z.string()
});

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const payload = payloadSchema.parse(await request.json());

  const status = decisionToStatus(payload.level, "APPROVED");
  const updated = await prisma.purchaseRequest.update({
    where: { id: params.id },
    data: { status },
    include: { createdBy: true, comparativeTable: true }
  });

  await prisma.approvalStep.updateMany({
    where: { requestId: params.id, level: payload.level },
    data: {
      decision: "APPROVED",
      decidedAt: new Date(),
      approverUserId: payload.approverUserId
    }
  });

  const next = nextLevel(payload.level);
  if (next) {
    await prisma.approvalStep.create({
      data: {
        requestId: params.id,
        level: next,
        approverRole: next
      }
    });
  }

  await prisma.auditLog.create({
    data: {
      requestId: params.id,
      actorUserId: payload.approverUserId,
      action: "APPROVED",
      metadataJson: JSON.stringify({ level: payload.level })
    }
  });

  await sendWorkflowEmail("next.approver@example.com", updated.createdBy.email, {
    reference: updated.reference,
    department: updated.department,
    recommendedSupplier: updated.comparativeTable?.recommendedSupplierId ?? undefined,
    recommendedAmount: updated.comparativeTable?.totalRecommendedAmount ?? undefined,
    requestUrl: `${process.env.APP_URL}/requests/${params.id}`,
    decisionExpected: next ? `Validation ${next}` : "Validation finale"
  });

  return NextResponse.json(updated);
}
