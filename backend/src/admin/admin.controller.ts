import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { IsString } from 'class-validator';
import { Role } from '@prisma/client';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AdminService } from './admin.service';

class PlantDto {
  @IsString()
  name: string;
}

class DepartmentDto {
  @IsString()
  name: string;

  @IsString()
  plantId: string;
}

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('plants')
  listPlants() {
    return this.adminService.listPlants();
  }

  @Post('plants')
  createPlant(@Body() dto: PlantDto) {
    return this.adminService.createPlant(dto.name);
  }

  @Get('departments')
  listDepartments() {
    return this.adminService.listDepartments();
  }

  @Post('departments')
  createDepartment(@Body() dto: DepartmentDto) {
    return this.adminService.createDepartment(dto.name, dto.plantId);
  }
}
