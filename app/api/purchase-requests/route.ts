import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { RequestStatus } from "@prisma/client";

const createSchema = z.object({
  reference: z.string(),
  department: z.string(),
  title: z.string(),
  description: z.string().optional(),
  estimatedBudget: z.number(),
  createdById: z.string()
});

export async function GET() {
  const requests = await prisma.purchaseRequest.findMany({
    include: { approvals: true, comparativeTable: true },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(requests);
}

export async function POST(request: Request) {
  const payload = createSchema.parse(await request.json());
  const created = await prisma.purchaseRequest.create({
    data: {
      ...payload,
      status: RequestStatus.DRAFT
    }
  });
  return NextResponse.json(created, { status: 201 });
}
