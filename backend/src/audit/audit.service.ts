import { Injectable } from '@nestjs/common';
import { PurchaseRequestStatus } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  log(params: {
    requestId: string;
    action: string;
    performedById: string;
    fromStatus?: PurchaseRequestStatus;
    toStatus?: PurchaseRequestStatus;
    message?: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        requestId: params.requestId,
        action: params.action,
        performedById: params.performedById,
        fromStatus: params.fromStatus,
        toStatus: params.toStatus,
        message: params.message,
      },
    });
  }
}
