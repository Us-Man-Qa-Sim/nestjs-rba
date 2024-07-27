import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './data-source';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { UsersRolesModule } from './users-roles/users-roles.module';
import { PermissionsModule } from './permissions/permissions.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      autoLoadEntities: true,
      ...dataSourceOptions,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    UsersModule,
    RolesModule,
    UsersRolesModule,
    PermissionsModule,
  ],
})
export class AppModule {}
