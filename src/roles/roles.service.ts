import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { RoleEntity } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { ERRORS } from 'src/shared/constants/constants';
import { ConflictError } from 'src/shared/errors';
import { PermissionsService } from 'src/permissions/permissions.service';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,
    private permissionService: PermissionsService,
  ) {}

  /**
   * This function is used to find one role on the basis of options
   *
   * @param options
   * @returns RoleEntity
   */
  async findOneByOptions(
    options: FindOptionsWhere<RoleEntity>,
  ): Promise<RoleEntity> {
    try {
      return this.roleRepository.findOne({ where: options });
    } catch (error) {
      Logger.error(
        `Error in findOneByOptions of RolesService where options: ${JSON.stringify(options)}`,
      );
      throw error;
    }
  }

  /**
   * This function is used to create role depending upon their permission level
   *
   * @param data
   * @returns RoleEntity
   */
  async create(data: CreateRoleDto): Promise<RoleEntity> {
    try {
      const { name, description, permissions } = data;
      // get role by name as it should be unique
      const existingRole = await this.findOneByOptions({ name });
      if (existingRole) {
        throw new ConflictError(ERRORS.RESOURCE_ALREADY_EXISTS);
      }
      // create permission
      const permissionCreated =
        await this.permissionService.create(permissions);
      // create role
      const roleData = { name, description, permission: permissionCreated };
      const roleInstance = this.roleRepository.create(roleData);
      return await this.roleRepository.save(roleInstance);
    } catch (error) {
      Logger.error(
        `Error in create of RolesService where data: ${JSON.stringify(data)}`,
      );
      throw error;
    }
  }

  /**
   * This is to find roles,
   *
   * @param options
   * @returns RoleEntity[]
   */
  async find(options: FindOptionsWhere<RoleEntity>): Promise<RoleEntity[]> {
    try {
      return this.roleRepository.find({ where: options });
    } catch (error) {
      Logger.error(
        `Error in findAll of RolesService where options: ${JSON.stringify(options)}`,
      );
      throw error;
    }
  }
}
