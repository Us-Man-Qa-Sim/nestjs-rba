import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToOne,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { PermissionObject } from '../permission.interface';
import { RoleEntity } from '../../roles/entities/role.entity';

const defaultPermissionObject: PermissionObject = {
  create: false,
  read: false,
  update: false,
  delete: false,
};

@Entity('permissions')
@Index(['id'])
export class PermissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('jsonb', { default: defaultPermissionObject })
  userPermissions: PermissionObject;

  @Column('jsonb', { default: defaultPermissionObject })
  rolePermissions: PermissionObject;

  // One can add many more permissions here as per requirement. For boiler plate limited it to two types of permissions

  @OneToOne(() => RoleEntity, (role) => role.permission)
  role: RoleEntity;

  @ApiProperty({ default: false, required: false })
  @Column({ default: false })
  isDeleted: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
