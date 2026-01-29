import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { canActOnLevel, decisionToStatus, nextLevel, nextStatusForLevel } from "@/lib/workflow";
import { sendWorkflowEmail } from "@/lib/email/sender";

const payloadSchema = z.object({
  level: z.enum(["DEPT_MANAGER", "PROCUREMENT_MANAGER", "PLANT_DIRECTOR", "COUNTRY_DIRECTOR"])
});

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const approver = await prisma.user.findUnique({
    where: { email: session.user.email }
  });
  if (!approver) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = payloadSchema.parse(await request.json());
  if (!canActOnLevel(approver.role, payload.level)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const requestRecord = await prisma.purchaseRequest.findUnique({
    where: { id: params.id },
    include: { approvals: true, createdBy: true, comparativeTable: true }
  });
  if (!requestRecord) {
    return NextResponse.json({ error: "Purchase request not found" }, { status: 404 });
  }

  const pendingStep = requestRecord.approvals.find((step) => step.decision === null);
  if (!pendingStep || pendingStep.level !== payload.level) {
    return NextResponse.json({ error: "Approval level mismatch" }, { status: 409 });
  }

  const expectedStatus = nextStatusForLevel(payload.level);
  if (requestRecord.status !== expectedStatus) {
    return NextResponse.json({ error: "Request not in expected approval state" }, { status: 409 });
  }

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
      approverUserId: approver.id
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
      actorUserId: approver.id,
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
