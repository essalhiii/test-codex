import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { Role } from '@prisma/client';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { PurchaseRequestsService } from './pr.service';

class CreatePRDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  amount: number;

  @IsString()
  plantId: string;

  @IsString()
  departmentId: string;
}

class AssignBuyerDto {
  @IsString()
  buyerId: string;
}

@ApiTags('purchase-requests')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('pr')
export class PurchaseRequestsController {
  constructor(private prService: PurchaseRequestsService) {}

  @Get()
  list(@Req() req: Request) {
    return this.prService.list(req.user as { userId: string; role: Role });
  }

  @Post()
  @Roles(Role.REQUESTER)
  create(@Body() dto: CreatePRDto, @Req() req: Request) {
    return this.prService.create(req.user as { userId: string; role: Role }, dto);
  }

  @Post(':id/submit')
  @Roles(Role.REQUESTER)
  submit(@Param('id') id: string, @Req() req: Request) {
    return this.prService.submit(req.user as { userId: string; role: Role }, id);
  }

  @Post(':id/approve-dept')
  @Roles(Role.DEPT_MANAGER)
  approveDept(@Param('id') id: string, @Req() req: Request) {
    return this.prService.approveDept(req.user as { userId: string; role: Role }, id);
  }

  @Post(':id/approve-plant')
  @Roles(Role.PLANT_MANAGER)
  approvePlant(@Param('id') id: string, @Req() req: Request) {
    return this.prService.approvePlant(req.user as { userId: string; role: Role }, id);
  }

  @Post(':id/assign-buyer')
  @Roles(Role.PURCH_MANAGER)
  assignBuyer(@Param('id') id: string, @Body() dto: AssignBuyerDto, @Req() req: Request) {
    return this.prService.assignBuyer(req.user as { userId: string; role: Role }, id, dto.buyerId);
  }

  @Post(':id/start')
  @Roles(Role.BUYER)
  start(@Param('id') id: string, @Req() req: Request) {
    return this.prService.startProgress(req.user as { userId: string; role: Role }, id);
  }

  @Post(':id/close')
  @Roles(Role.BUYER)
  close(@Param('id') id: string, @Req() req: Request) {
    return this.prService.close(req.user as { userId: string; role: Role }, id);
  }

  @Post(':id/request-info')
  @Roles(Role.BUYER)
  requestInfo(@Param('id') id: string, @Req() req: Request) {
    return this.prService.requestInfo(req.user as { userId: string; role: Role }, id);
  }

  @Post(':id/request-change')
  @Roles(Role.BUYER)
  requestChange(@Param('id') id: string, @Req() req: Request) {
    return this.prService.requestChange(req.user as { userId: string; role: Role }, id);
  }

  @Post(':id/reject')
  @Roles(Role.DEPT_MANAGER, Role.PLANT_MANAGER)
  reject(@Param('id') id: string, @Req() req: Request) {
    return this.prService.reject(req.user as { userId: string; role: Role }, id);
  }

  @Get('export/excel')
  @Roles(Role.ADMIN, Role.PURCH_MANAGER)
  async exportExcel(@Req() req: Request, @Res() res: Response) {
    const requests = await this.prService.list(req.user as { userId: string; role: Role });
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('DA');
    sheet.columns = [
      { header: 'ID', key: 'id' },
      { header: 'Title', key: 'title' },
      { header: 'Status', key: 'status' },
      { header: 'Amount', key: 'amount' },
      { header: 'Plant', key: 'plant' },
      { header: 'Department', key: 'department' },
    ];
    requests.forEach((req: any) => {
      sheet.addRow({
        id: req.id,
        title: req.title,
        status: req.status,
        amount: req.amount,
        plant: req.plant?.name,
        department: req.department?.name,
      });
    });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="requests.xlsx"');
    await workbook.xlsx.write(res);
    res.end();
  }

  @Get('export/pdf')
  @Roles(Role.ADMIN, Role.PURCH_MANAGER)
  async exportPdf(@Req() req: Request, @Res() res: Response) {
    const requests = await this.prService.list(req.user as { userId: string; role: Role });
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="requests.pdf"');
    doc.pipe(res);
    doc.fontSize(18).text('Demandes d\'Achat', { align: 'center' });
    doc.moveDown();
    requests.forEach((req: any) => {
      doc.fontSize(12).text(`${req.title} - ${req.status} - ${req.amount} EUR`);
    });
    doc.end();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.prService.findById(id);
  }
}
