import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendWorkflowEmail } from "@/lib/email/sender";

const payloadSchema = z.object({
  level: z.enum(["DEPT_MANAGER", "PROCUREMENT_MANAGER", "PLANT_DIRECTOR", "COUNTRY_DIRECTOR"]),
  approverUserId: z.string(),
  comment: z.string().min(1)
});

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const payload = payloadSchema.parse(await request.json());

  const updated = await prisma.purchaseRequest.update({
    where: { id: params.id },
    data: { status: "REJECTED" },
    include: { createdBy: true, comparativeTable: true }
  });

  await prisma.approvalStep.updateMany({
    where: { requestId: params.id, level: payload.level },
    data: {
      decision: "REJECTED",
      comment: payload.comment,
      decidedAt: new Date(),
      approverUserId: payload.approverUserId
    }
  });

  await prisma.auditLog.create({
    data: {
      requestId: params.id,
      actorUserId: payload.approverUserId,
      action: "REJECTED",
      metadataJson: JSON.stringify({ level: payload.level, comment: payload.comment })
    }
  });

  await sendWorkflowEmail(updated.createdBy.email, undefined, {
    reference: updated.reference,
    department: updated.department,
    recommendedSupplier: updated.comparativeTable?.recommendedSupplierId ?? undefined,
    recommendedAmount: updated.comparativeTable?.totalRecommendedAmount ?? undefined,
    requestUrl: `${process.env.APP_URL}/requests/${params.id}`,
    comment: payload.comment,
    decisionExpected: `Rejeté (${payload.level})`
  });

  return NextResponse.json(updated);
}
