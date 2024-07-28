import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionEntity } from './entities/permission.entity';
import { PermissionKeys, PermissionLevel } from './permissions.enum';
import { PermissionObject } from './permission.interface';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(PermissionEntity)
    private readonly permissionRepo: Repository<PermissionEntity>,
  ) {}

  /**
   * This function is used to create permission in the database while creation of role.
   *
   * @param permission
   * @returns
   */
  async create(permissions: {
    [key in PermissionKeys]: PermissionLevel;
  }): Promise<PermissionEntity> {
    try {
      const permissionObject = this.getPermissions(
        permissions,
      ) as unknown as PermissionEntity;
      const permissionInstance = this.permissionRepo.create(permissionObject);
      return await this.permissionRepo.save(permissionInstance);
    } catch (error) {
      Logger.error(
        `Error in create of PermissionsService where permission: ${JSON.stringify(permissions)}`,
      );
      throw error;
    }
  }

  /**
   * This function is used to get transformed permissions object
   *
   * @param permissions
   * @returns object
   */
  getPermissions(permissions: {
    [key in PermissionKeys]: PermissionLevel;
  }): PermissionObject {
    const permissionObject = {};
    for (const key in permissions) {
      if (permissions[key] === PermissionLevel.FULL_ACCESS) {
        permissionObject[key] = {
          create: true,
          read: true,
          update: true,
          delete: true,
        };
      } else if (permissions[key] === PermissionLevel.PARTIAL) {
        permissionObject[key] = {
          create: false,
          read: true,
          update: true,
          delete: false,
        };
      } else if (permissions[key] === PermissionLevel.VIEW) {
        permissionObject[key] = {
          create: false,
          read: true,
          update: false,
          delete: false,
        };
      } else {
        permissionObject[key] = {
          create: false,
          read: false,
          update: false,
          delete: false,
        };
      }
    }
    return permissionObject as PermissionObject;
  }
}
