import { Body, Controller, Post, SetMetadata } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MESSAGES, PERMISSIONS } from 'src/shared/constants/constants';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './entities/user.entity';
import { ResponseFormatService } from 'src/shared/response-format.service';
import { ResponseFormat } from 'src/shared/shared.interface';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @SetMetadata('permissions', [{ [PERMISSIONS.USERS]: { create: true } }])
  @Post('create-user')
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<ResponseFormat<UserEntity>> {
    const user = await this.usersService.createUser(createUserDto);
    return ResponseFormatService.responseOk<UserEntity>(
      user,
      MESSAGES.USER_CREATED_SUCCESSFULLY,
    );
  }
}
