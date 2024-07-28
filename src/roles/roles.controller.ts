import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  SetMetadata,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { MESSAGES, PERMISSIONS } from 'src/shared/constants/constants';
import { CreateRoleDto } from './dto/create-role.dto';
import { ResponseFormat } from 'src/shared/shared.interface';
import { RoleEntity } from './entities/role.entity';
import { ResponseFormatService } from 'src/shared/response-format.service';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UpdateResult } from 'typeorm';

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @SetMetadata('permissions', [{ [PERMISSIONS.ROLES]: { create: true } }])
  @Post('create')
  async create(
    @Body() createRoleDto: CreateRoleDto,
  ): Promise<ResponseFormat<RoleEntity>> {
    const role = await this.rolesService.create(createRoleDto);
    return ResponseFormatService.responseOk<RoleEntity>(
      role,
      MESSAGES.RESOURCE_CREATED_SUCCESSFULLY,
    );
  }

  @SetMetadata('permissions', [{ [PERMISSIONS.ROLES]: { read: true } }])
  @Get()
  async findRoles(
    @Query('take', ParseIntPipe) take: number = 10,
    @Query('pageNo', ParseIntPipe) pageNo: number = 1,
    @Query('searchText') searchText?: string,
  ): Promise<ResponseFormat<{ roles: RoleEntity[]; totalCount: number }>> {
    const [roles, totalCount] = await this.rolesService.findAll(
      { isDeleted: false },
      take,
      pageNo,
      searchText,
    );
    return ResponseFormatService.responseOk<{
      roles: RoleEntity[];
      totalCount: number;
    }>({ roles, totalCount }, MESSAGES.QUERY_SUCCESS);
  }

  @SetMetadata('permissions', [{ [PERMISSIONS.ROLES]: { read: true } }])
  @Get(':id')
  async findById(@Param('id') id: string): Promise<ResponseFormat<RoleEntity>> {
    const role = await this.rolesService.findOneById(id);
    return ResponseFormatService.responseOk<RoleEntity>(
      role,
      MESSAGES.QUERY_SUCCESS,
    );
  }

  @SetMetadata('permissions', [{ [PERMISSIONS.ROLES]: { update: true } }])
  @Patch('update/:id')
  async update(
    @Body() updateRoleDto: UpdateRoleDto,
    @Param('id') id: string,
  ): Promise<ResponseFormat<RoleEntity>> {
    const role = await this.rolesService.update(id, updateRoleDto);
    return ResponseFormatService.responseOk<RoleEntity>(
      role,
      MESSAGES.RESOURCE_CREATED_SUCCESSFULLY,
    );
  }

  @SetMetadata('permissions', [{ [PERMISSIONS.ROLES]: { delete: true } }])
  @Delete('archive/:id')
  async archive(
    @Param('id') id: string,
  ): Promise<ResponseFormat<UpdateResult>> {
    const updateResult = await this.rolesService.archiveRole(id);
    return ResponseFormatService.responseOk<UpdateResult>(
      updateResult,
      MESSAGES.QUERY_SUCCESS,
    );
  }
}
