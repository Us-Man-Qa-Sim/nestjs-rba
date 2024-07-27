import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  PasswordTransformer,
  TrimLowerTransformer,
} from '../../shared/transformers';
import { TrimTransformer } from '../../shared/transformers/trim.transformer';
import { UserGender } from '../enums/gender.enum';
import { UserStatus } from '../enums/status.enum';
import { UserRoleEntity } from 'src/users-roles/entities/users-role.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ transformer: new TrimTransformer() })
  firstName: string;

  @ApiProperty({ required: false })
  @Column({ nullable: true, transformer: new TrimTransformer() })
  lastName: string;

  @ApiProperty({ uniqueItems: true })
  @Column({ unique: true, transformer: new TrimLowerTransformer() })
  email: string;

  @ApiProperty({
    enum: UserStatus,
    default: UserStatus.PENDING,
    required: false,
  })
  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.PENDING })
  status: UserStatus;

  @ApiProperty({ required: false, enum: UserGender })
  @Column({ nullable: true, enum: UserGender })
  gender: UserGender;

  @ApiProperty({ maxLength: 100, required: false })
  @Column({
    length: 100,
    select: false,
    transformer: new PasswordTransformer(),
    nullable: true,
  })
  password: string;

  @ApiProperty({ required: false, uniqueItems: true })
  @Column({ unique: true, nullable: true })
  phoneNo: string;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  dateOfBirth: Date;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  address: string;

  @OneToMany(() => UserRoleEntity, (userRole) => userRole.user)
  userRoles: UserRoleEntity[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  public get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
