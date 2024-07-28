import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository, UpdateResult } from 'typeorm';
import { RoleEntity } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { ERRORS } from 'src/shared/constants/constants';
import { ConflictError, NotFoundError } from 'src/shared/errors';
import { PermissionsService } from 'src/permissions/permissions.service';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UsersRolesService } from 'src/users-roles/users-roles.service';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,
    private permissionService: PermissionsService,
    private userRolesService: UsersRolesService,
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

  /**
   * This is to find all roles, with pagination and search where search is optional
   *
   * @param options
   * @param take
   * @param pageNo
   * @returns [RoleEntity[], number]
   */
  async findAll(
    options: FindOptionsWhere<RoleEntity>,
    take: number,
    pageNo: number,
    searchText?: string,
  ): Promise<[RoleEntity[], number]> {
    try {
      // calculate skip
      const skip = (pageNo - 1) * take;
      // adding search query in options
      let searchClause: FindOptionsWhere<RoleEntity> | undefined;
      if (searchText) {
        searchClause = {
          name: ILike(`%${searchText}%`),
        };
      }

      // Combine search and other options
      const combinedOptions = {
        ...options,
        ...(searchClause ? searchClause : {}),
      };

      return await this.roleRepository.findAndCount({
        where: combinedOptions,
        take: take,
        skip: skip,
      });
    } catch (error) {
      Logger.error(
        `Error in findAll of RolesService where options: ${JSON.stringify(options)}`,
      );
      throw error;
    }
  }

  /**
   * This function is used to find role by id which is not deleted along with its permissions
   *
   * @param id
   * @returns
   */
  async findOneById(id: string): Promise<RoleEntity> {
    try {
      return this.roleRepository.findOne({
        where: { id, isDeleted: false },
        relations: { permission: true },
      });
    } catch (error) {
      Logger.error(`Error in findOneById of RolesService where id: ${id}`);
      throw error;
    }
  }

  /**
   * This function is used to update role
   *
   * @param data
   * @returns RoleEntity
   */
  async update(id: string, data: UpdateRoleDto): Promise<RoleEntity> {
    try {
      const { name, description, permissions } = data;
      // get role with permission from db
      const existingRole = await this.findOneById(id);
      if (!existingRole) {
        throw new NotFoundError(ERRORS.RESOURCE_NOT_FOUND);
      }
      if (permissions) {
        const permissionId = existingRole.permission.id;
        // update permissions
        await this.permissionService.update({ id: permissionId }, permissions);
      }
      // create update object
      const updateObject: { name?: string; description?: string } = {};
      if (name) {
        updateObject.name = name;
      }
      if (description) {
        updateObject.description = description;
      }
      // update role
      await this.roleRepository.update({ id }, updateObject);
      // fetch new role
      return this.findOneById(id);
    } catch (error) {
      Logger.error(
        `Error in create of RolesService where data: ${JSON.stringify(data)}`,
      );
      throw error;
    }
  }

  /**
   * This function is used to archive role
   *
   * @param id
   * @returns UpdateResult
   */
  async archiveRole(id: string): Promise<UpdateResult> {
    try {
      // check if user exist with that role or not
      const usersWithRole = await this.userRolesService.find({ roleId: id });
      if (usersWithRole.length > 0) {
        throw new ConflictError(
          'Role is assigned to user, please remove role from user first',
        );
      }
      await this.roleRepository.update({ id }, { isDeleted: true });
      // update middle tables
      return await this.userRolesService.archiveUserRole({ roleId: id });
    } catch (error) {
      Logger.error(`Error in archiveUser of user service where id: ${id}`);
      throw error;
    }
  }

  /**
   * This function is used to merge permissions of user roles
   *
   * @param userRoles
   * @returns
   */
  cumulatePermissions(userRoles) {
    try {
      return userRoles.reduce((permissions, userRole) => {
        const rolePermissionTypes = userRole.role.permission;

        Object.keys(rolePermissionTypes).forEach((permissionType) => {
          const rolePermissions = rolePermissionTypes[permissionType];
          const isObject = typeof rolePermissions === 'object';

          if (isObject) {
            Object.keys(rolePermissions).forEach((permission) => {
              if (!permissions[permissionType]) {
                permissions[permissionType] = {
                  [permission]: rolePermissions[permission],
                };
              } else {
                permissions[permissionType][permission] =
                  permissions[permissionType][permission] ||
                  rolePermissions[permission];
              }
            });
          }
        });

        return permissions;
      }, {});
    } catch (error) {
      Logger.error(
        `Error in cumulatePermissions of AuthService where userRoles: ${JSON.stringify(
          userRoles,
        )}`,
      );
      throw error;
    }
  }
}
