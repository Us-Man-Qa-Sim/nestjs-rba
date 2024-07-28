import { Body, Controller, Post, SetMetadata } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { MESSAGES, PERMISSIONS } from 'src/shared/constants/constants';
import { CreateRoleDto } from './dto/create-role.dto';
import { ResponseFormat } from 'src/shared/shared.interface';
import { RoleEntity } from './entities/role.entity';
import { ResponseFormatService } from 'src/shared/response-format.service';

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
}
