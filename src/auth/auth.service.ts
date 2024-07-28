import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { ERRORS, JWT_SECRET } from 'src/shared/constants/constants';
import { PermissionsService } from '../permissions/permissions.service';
import { NotFoundError, PasswordMismatchError } from '../shared/errors';
import { Utils } from '../shared/utils/utils';
import { UserRoleEntity } from '../users-roles/entities/users-role.entity';
import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { TokenPayload } from './auth.interface';
import { LoginUserDto } from './dto/login-user.dto';
import { UserWithToken } from './dto/user-with-token.dto';
import { RolesService } from 'src/roles/roles.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
    private readonly permissionService: PermissionsService,
    private readonly rolesService: RolesService,
  ) {}

  /**
   * This function is used to get user logged in if credentials are valid
   *
   * @param {email, password}
   * @returns user and access_token
   */
  async loginUser({ email, password }: LoginUserDto): Promise<UserWithToken> {
    try {
      // check if user exists with provided credentials
      const user = await this.checkUserForLogin(email, password);
      const userToReturn = this.getUserLoggedIn(user);
      return userToReturn;
    } catch (error) {
      Logger.error(
        `Error in loginUser of AuthService where login credentials are ${JSON.stringify(
          {
            email,
            password,
          },
        )}`,
      );
      throw error;
    }
  }

  /**
   * This function is used to check while user provided credentials (email, password) are valid or not for login purpose.
   *
   * @param email
   * @param password
   * @returns User
   */
  async checkUserForLogin(
    email: string,
    password: string,
  ): Promise<UserEntity> {
    try {
      // get user by email along with password
      const user = await this.userService.findUserByEmail(email, true);
      if (!user) {
        throw new NotFoundError(ERRORS.USER_NOT_FOUND);
      }
      // verify password
      const isPasswordVerified = Utils.verifyPassword(user.password, password);
      if (!isPasswordVerified) {
        throw new PasswordMismatchError(ERRORS.PASSWORD_MISMATCHED);
      }
      // return user without password
      delete user.password;
      return user;
    } catch (error) {
      Logger.error(
        `Error in checkUserForLogin of auth service where credentials are ${JSON.stringify(
          {
            email,
            password,
          },
        )}`,
      );
      throw error;
    }
  }

  /**
   * This function is used to generate token for user
   *
   * @param payload
   * @param expiresIn
   * @returns token
   */
  generateToken(payload: TokenPayload, expiresIn: number): string {
    const secretKey = this.configService.get<string>(JWT_SECRET);
    return jwt.sign(payload, secretKey, { expiresIn });
  }

  /**
   * This function is used to get user logged in
   *
   * @param user
   * @returns user and access_token
   */
  getUserLoggedIn(user: UserEntity): UserWithToken {
    try {
      // get user loggedIn
      const token = this.generateToken({ id: user.id }, 3600);
      // add user permissions to user object
      const userRoles: UserRoleEntity[] = user.userRoles;
      user['permissions'] = this.rolesService.cumulatePermissions(userRoles);

      // response
      return { user, accessToken: token };
    } catch (error) {
      Logger.error(
        `Error in getUserLoggedIn of AuthService where user: ${JSON.stringify(user)}`,
      );
      throw error;
    }
  }
}
