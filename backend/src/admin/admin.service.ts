import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  listPlants() {
    return this.prisma.plant.findMany({ orderBy: { name: 'asc' } });
  }

  createPlant(name: string) {
    return this.prisma.plant.create({ data: { name } });
  }

  listDepartments() {
    return this.prisma.department.findMany({ include: { plant: true } });
  }

  createDepartment(name: string, plantId: string) {
    return this.prisma.department.create({ data: { name, plantId } });
  }
}
