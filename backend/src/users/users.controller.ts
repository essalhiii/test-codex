import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { AuthGuard } from '@nestjs/passport';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  password: string;

  @IsString()
  role: Role;

  @IsOptional()
  @IsString()
  plantId?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;
}

class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  role?: Role;

  @IsOptional()
  @IsString()
  plantId?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;
}

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  async create(@Body() dto: CreateUserDto) {
    const password = await bcrypt.hash(dto.password, 10);
    return this.usersService.create({
      email: dto.email,
      name: dto.name,
      password,
      role: dto.role,
      plant: dto.plantId ? { connect: { id: dto.plantId } } : undefined,
      department: dto.departmentId ? { connect: { id: dto.departmentId } } : undefined,
    });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, {
      name: dto.name,
      role: dto.role,
      plant: dto.plantId ? { connect: { id: dto.plantId } } : undefined,
      department: dto.departmentId ? { connect: { id: dto.departmentId } } : undefined,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
