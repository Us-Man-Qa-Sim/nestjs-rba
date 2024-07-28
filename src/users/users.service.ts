import { Injectable, Logger } from '@nestjs/common';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserStatus } from './enums/status.enum';

import { ERRORS } from 'src/shared/constants/constants';
import { ConflictError, NotFoundError } from 'src/shared/errors';
import { UserRoleEntity } from 'src/users-roles/entities/users-role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { RolesService } from 'src/roles/roles.service';
import { CreateUser } from './users.interface';
import { UsersRolesService } from 'src/users-roles/users-roles.service';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly roleService: RolesService,
    private readonly usersRolesService: UsersRolesService,
  ) {}

  /**
   * This function is used to create user with invite, send email and return user
   *
   * @param createUserDto
   * @param currentUser
   * @returns User
   */
  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    const { email, phoneNo, roleId, firstName, lastName } = createUserDto;
    // fetch user
    const userDb = await this.userRepo.findOne({
      where: [{ email }, { phoneNo }],
    });
    if (userDb) {
      throw new ConflictError(ERRORS.USER_ALREADY_EXISTS);
    }
    // fetch role
    const roleData = await this.roleService.findOneByOptions({
      isDeleted: false,
      id: roleId,
    });
    if (!roleData) {
      throw new NotFoundError(ERRORS.RESOURCE_NOT_FOUND);
    }
    const user = await this.createUserInDb({
      email,
      phoneNo,
      roleId,
      firstName,
      lastName,
    });

    return user;
  }

  /**
   * This function is used to create user
   *
   * @param param0
   * @returns User
   */
  async createUserInDb(data: CreateUser): Promise<UserEntity> {
    try {
      const { roleId, ...rest } = data;
      // create user
      const newUserInstance = this.userRepo.create(rest);
      const newUser = await this.userRepo.save(newUserInstance);

      // add role in middle table
      await this.usersRolesService.create({ userId: newUser.id, roleId });
      return newUser;
    } catch (error) {
      Logger.error(
        `Error in createUser of user service where credentials: ${JSON.stringify(data)}`,
      );
      throw error;
    }
  }

  /**
   * This function is used to find user by means of id which is not active
   *
   * @param id
   * @returns user | null
   */
  async findOneById(id: string): Promise<UserEntity | null> {
    try {
      const user = await this.userRepo.findOne({
        where: {
          id,
          status: UserStatus.ACTIVE,
        },
        relations: {
          userRoles: {
            role: {
              permission: true,
            },
          },
        },
      });
      if (!user) {
        throw new NotFoundError(ERRORS.USER_NOT_FOUND);
      }
      // add user permissions to user object
      const userRoles: UserRoleEntity[] = user.userRoles;
      console.log(userRoles);

      // for the time being
      user['permissions'] = {
        read: false,
        create: false,
        delete: false,
        update: false,
      };

      return user;
    } catch (error) {
      Logger.error(`Error in findOneById of user service where id: ${id}`);
      throw error;
    }
  }

  /**
   * This function is used to find and return user by email address.
   *
   * @param email
   * @param isPasswordRequired if this is true it will also returns user password
   * @returns User
   */
  async findUserByEmail(
    email: string,
    isPasswordRequired?: boolean,
  ): Promise<UserEntity> {
    try {
      const query = this.userRepo
        .createQueryBuilder('users')
        .where({ email })
        .leftJoinAndSelect(
          'users.userRoles',
          'userRoles',
          'userRoles.isDeleted = false',
        )
        .leftJoinAndSelect('userRoles.role', 'role')
        .leftJoinAndSelect('role.permission', 'permission');

      if (isPasswordRequired) {
        query.addSelect(['users.password']);
      }
      return await query.getOne();
    } catch (error) {
      Logger.error(
        `Error in findUserByEmail of user service where credentials: ${JSON.stringify(
          {
            email,
            isPasswordRequired,
          },
        )}`,
      );
      throw error;
    }
  }
}
