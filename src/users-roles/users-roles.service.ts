import { Injectable } from '@nestjs/common';
import { UserRoleEntity } from './entities/users-role.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersRolesService {
  constructor(
    @InjectRepository(UserRoleEntity)
    private usersRoleRepository: Repository<UserRoleEntity>,
  ) {}
}
