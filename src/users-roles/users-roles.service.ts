import { Injectable, Logger } from '@nestjs/common';
import { UserRoleEntity } from './entities/users-role.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersRolesService {
  constructor(
    @InjectRepository(UserRoleEntity)
    private usersRoleRepository: Repository<UserRoleEntity>,
  ) {}

  /**
   * This function is used to add record in userRole table
   *
   * @param param0
   * @returns
   */
  create({
    userId,
    roleId,
  }: {
    userId: string;
    roleId: string;
  }): Promise<UserRoleEntity> {
    try {
      const userRolesInstance = this.usersRoleRepository.create({
        userId,
        roleId,
      });
      return this.usersRoleRepository.save(userRolesInstance);
    } catch (error) {
      Logger.error(
        `Error in create of usersRoles service where credentials: ${JSON.stringify(
          {
            userId,
            roleId,
          },
        )}`,
      );
      throw error;
    }
  }
}
