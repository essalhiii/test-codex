import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { prisma } from "@/lib/prisma";

export async function generateComparativePdf(requestId: string) {
  const request = await prisma.purchaseRequest.findUnique({
    where: { id: requestId },
    include: {
      offers: { include: { supplier: true } },
      comparativeTable: true,
      approvals: { include: { approver: true }, orderBy: { decidedAt: "asc" } }
    }
  });

  if (!request) {
    throw new Error("Purchase request not found");
  }

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  let y = height - 50;

  page.drawText(`Demande: ${request.reference}`, { x: 40, y, size: 16, font });
  y -= 24;
  page.drawText(`Département: ${request.department}`, { x: 40, y, size: 12, font });
  y -= 20;
  page.drawText(`Statut: ${request.status}`, { x: 40, y, size: 12, font });
  y -= 30;

  page.drawText("Offres", { x: 40, y, size: 14, font, color: rgb(0.2, 0.2, 0.2) });
  y -= 18;
  request.offers.forEach((offer) => {
    page.drawText(
      `${offer.supplier.name} - ${offer.price} ${offer.currency} - ${offer.leadTimeDays} jours`,
      { x: 50, y, size: 10, font }
    );
    y -= 14;
  });

  y -= 10;
  page.drawText("Historique validations", { x: 40, y, size: 14, font });
  y -= 18;
  request.approvals.forEach((approval) => {
    page.drawText(
      `${approval.level} - ${approval.decision} - ${approval.approver?.name ?? ""}`,
      { x: 50, y, size: 10, font }
    );
    y -= 14;
  });

  return pdfDoc.save();
}
