import { Module } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { PurchaseRequestsService } from './pr.service';
import { PurchaseRequestsController } from './pr.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  providers: [PrismaService, PurchaseRequestsService],
  controllers: [PurchaseRequestsController],
})
export class PurchaseRequestsModule {}
