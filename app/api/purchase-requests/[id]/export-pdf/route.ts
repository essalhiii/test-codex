import { NextResponse } from "next/server";
import { generateComparativePdf } from "@/lib/pdf/generateComparativePdf";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const pdf = await generateComparativePdf(params.id);
  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=comparatif-${params.id}.pdf`
    }
  });
}
