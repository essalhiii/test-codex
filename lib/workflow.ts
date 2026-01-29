import { RequestStatus, ApprovalDecision, ApprovalLevel, Role } from "@prisma/client";

export const approvalOrder: ApprovalLevel[] = [
  "DEPT_MANAGER",
  "PROCUREMENT_MANAGER",
  "PLANT_DIRECTOR",
  "COUNTRY_DIRECTOR"
];

const statusByLevel: Record<ApprovalLevel, RequestStatus> = {
  DEPT_MANAGER: "IN_REVIEW_DEPT",
  PROCUREMENT_MANAGER: "IN_REVIEW_PROCUREMENT",
  PLANT_DIRECTOR: "IN_REVIEW_PLANT",
  COUNTRY_DIRECTOR: "IN_REVIEW_COUNTRY"
};

export const levelByRole: Record<Role, ApprovalLevel | null> = {
  REQUESTER: null,
  DEPT_MANAGER: "DEPT_MANAGER",
  PROCUREMENT_MANAGER: "PROCUREMENT_MANAGER",
  PLANT_DIRECTOR: "PLANT_DIRECTOR",
  COUNTRY_DIRECTOR: "COUNTRY_DIRECTOR",
  ADMIN: null
};

export function nextStatusForLevel(level: ApprovalLevel): RequestStatus {
  return statusByLevel[level];
}

export function nextLevel(current: ApprovalLevel): ApprovalLevel | null {
  const index = approvalOrder.indexOf(current);
  return index >= 0 && index < approvalOrder.length - 1 ? approvalOrder[index + 1] : null;
}

export function decisionToStatus(
  currentLevel: ApprovalLevel,
  decision: ApprovalDecision
): RequestStatus {
  if (decision === "REJECTED") {
    return "REJECTED";
  }
  if (decision === "CHANGES_REQUESTED") {
    return "CHANGES_REQUESTED";
  }
  const next = nextLevel(currentLevel);
  if (!next) {
    return "APPROVED";
  }
  return nextStatusForLevel(next);
}

export function canActOnLevel(role: Role, level: ApprovalLevel) {
  return levelByRole[role] === level;
}

export function resubmissionPolicy() {
  return {
    optionA: "Redémarrer au niveau 1 après modification (standard).",
    optionB: "Reprendre au niveau où la modification a été demandée.",
    chosen: "optionA",
    rationale:
      "Standard en achats pour réévaluer l'ensemble de la validation après modification du comparatif."
  };
}
