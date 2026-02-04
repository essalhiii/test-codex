import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PurchaseRequestStatus, Role } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { AuditService } from '../audit/audit.service';

interface UserContext {
  userId: string;
  role: Role;
}

export class PurchaseRequestsService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  async list(user: UserContext) {
    const baseInclude = {
      plant: true,
      department: true,
      createdBy: true,
      assignedBuyer: true,
    };

    switch (user.role) {
      case Role.BUYER:
        return this.prisma.purchaseRequest.findMany({
          where: { assignedBuyerId: user.userId },
          include: baseInclude,
          orderBy: { createdAt: 'desc' },
        });
      case Role.REQUESTER:
        return this.prisma.purchaseRequest.findMany({
          where: { createdById: user.userId },
          include: baseInclude,
          orderBy: { createdAt: 'desc' },
        });
      case Role.DEPT_MANAGER:
        return this.prisma.purchaseRequest.findMany({
          where: { department: { users: { some: { id: user.userId } } } },
          include: baseInclude,
          orderBy: { createdAt: 'desc' },
        });
      case Role.PLANT_MANAGER:
        return this.prisma.purchaseRequest.findMany({
          where: { plant: { users: { some: { id: user.userId } } } },
          include: baseInclude,
          orderBy: { createdAt: 'desc' },
        });
      default:
        return this.prisma.purchaseRequest.findMany({
          include: baseInclude,
          orderBy: { createdAt: 'desc' },
        });
    }
  }

  async findById(id: string) {
    const pr = await this.prisma.purchaseRequest.findUnique({
      where: { id },
      include: {
        plant: true,
        department: true,
        createdBy: true,
        assignedBuyer: true,
        history: { include: { performedBy: true } },
      },
    });
    if (!pr) {
      throw new NotFoundException('PR not found');
    }
    return pr;
  }

  async create(user: UserContext, data: { title: string; description: string; amount: number; plantId: string; departmentId: string }) {
    const pr = await this.prisma.purchaseRequest.create({
      data: {
        ...data,
        createdById: user.userId,
      },
    });
    await this.audit.log({
      requestId: pr.id,
      action: 'CREATE',
      performedById: user.userId,
      toStatus: pr.status,
    });
    return pr;
  }

  async submit(user: UserContext, id: string) {
    const pr = await this.findById(id);
    if (pr.createdById !== user.userId) {
      throw new ForbiddenException('Only owner can submit');
    }
    if (pr.status !== PurchaseRequestStatus.DRAFT) {
      throw new ForbiddenException('Invalid status');
    }
    return this.updateStatus(pr.id, user.userId, PurchaseRequestStatus.PENDING_DEPT_MANAGER, 'SUBMIT');
  }

  async approveDept(user: UserContext, id: string) {
    const pr = await this.findById(id);
    if (pr.createdById === user.userId) {
      throw new ForbiddenException('Cannot approve own request');
    }
    if (pr.status !== PurchaseRequestStatus.PENDING_DEPT_MANAGER) {
      throw new ForbiddenException('Invalid status');
    }
    return this.updateStatus(pr.id, user.userId, PurchaseRequestStatus.PENDING_PLANT_MANAGER, 'APPROVE_DEPT');
  }

  async approvePlant(user: UserContext, id: string) {
    const pr = await this.findById(id);
    if (pr.createdById === user.userId) {
      throw new ForbiddenException('Cannot approve own request');
    }
    if (pr.status !== PurchaseRequestStatus.PENDING_PLANT_MANAGER) {
      throw new ForbiddenException('Invalid status');
    }
    return this.updateStatus(pr.id, user.userId, PurchaseRequestStatus.TO_DISTRIBUTE, 'APPROVE_PLANT');
  }

  async assignBuyer(user: UserContext, id: string, buyerId: string) {
    const pr = await this.findById(id);
    if (pr.status !== PurchaseRequestStatus.TO_DISTRIBUTE) {
      throw new ForbiddenException('Invalid status');
    }
    const updated = await this.prisma.purchaseRequest.update({
      where: { id },
      data: {
        assignedBuyerId: buyerId,
        status: PurchaseRequestStatus.ASSIGNED_TO_BUYER,
      },
    });
    await this.audit.log({
      requestId: id,
      action: 'ASSIGN_BUYER',
      performedById: user.userId,
      fromStatus: pr.status,
      toStatus: updated.status,
      message: `Assigned buyer ${buyerId}`,
    });
    return updated;
  }

  async startProgress(user: UserContext, id: string) {
    const pr = await this.findById(id);
    if (pr.assignedBuyerId !== user.userId) {
      throw new ForbiddenException('Only assigned buyer');
    }
    if (![PurchaseRequestStatus.ASSIGNED_TO_BUYER, PurchaseRequestStatus.INFO_REQUESTED, PurchaseRequestStatus.CHANGE_REQUESTED].includes(pr.status)) {
      throw new ForbiddenException('Invalid status');
    }
    return this.updateStatus(pr.id, user.userId, PurchaseRequestStatus.IN_PROGRESS, 'START_PROGRESS');
  }

  async close(user: UserContext, id: string) {
    const pr = await this.findById(id);
    if (pr.assignedBuyerId !== user.userId) {
      throw new ForbiddenException('Only assigned buyer');
    }
    if (pr.status !== PurchaseRequestStatus.IN_PROGRESS) {
      throw new ForbiddenException('Invalid status');
    }
    return this.updateStatus(pr.id, user.userId, PurchaseRequestStatus.CLOSED, 'CLOSE');
  }

  async requestInfo(user: UserContext, id: string) {
    return this.requestChangeStatus(user, id, PurchaseRequestStatus.INFO_REQUESTED, 'INFO_REQUESTED');
  }

  async requestChange(user: UserContext, id: string) {
    return this.requestChangeStatus(user, id, PurchaseRequestStatus.CHANGE_REQUESTED, 'CHANGE_REQUESTED');
  }

  private async requestChangeStatus(user: UserContext, id: string, status: PurchaseRequestStatus, action: string) {
    const pr = await this.findById(id);
    if (pr.assignedBuyerId !== user.userId) {
      throw new ForbiddenException('Only assigned buyer');
    }
    if (![PurchaseRequestStatus.ASSIGNED_TO_BUYER, PurchaseRequestStatus.IN_PROGRESS].includes(pr.status)) {
      throw new ForbiddenException('Invalid status');
    }
    return this.updateStatus(pr.id, user.userId, status, action);
  }

  async reject(user: UserContext, id: string) {
    const pr = await this.findById(id);
    if (pr.createdById === user.userId) {
      throw new ForbiddenException('Cannot reject own request');
    }
    return this.updateStatus(pr.id, user.userId, PurchaseRequestStatus.REJECTED, 'REJECT');
  }

  private async updateStatus(id: string, userId: string, status: PurchaseRequestStatus, action: string) {
    const previous = await this.prisma.purchaseRequest.findUnique({ where: { id } });
    if (!previous) {
      throw new NotFoundException('PR not found');
    }
    const updated = await this.prisma.purchaseRequest.update({
      where: { id },
      data: { status },
    });
    await this.audit.log({
      requestId: id,
      action,
      performedById: userId,
      fromStatus: previous.status,
      toStatus: status,
    });
    return updated;
  }
}
