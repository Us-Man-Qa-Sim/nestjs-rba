import { UserGender } from '../enums/gender.enum';
import { UserStatus } from '../enums/status.enum';

export const usersData = [
  {
    firstName: 'Usman',
    lastName: 'Qasim',
    status: UserStatus.ACTIVE,
    email: 'usmanqasim0900@gmail.com',
    gender: UserGender.MALE,
    phoneNo: '+090078601',
    password: 'Aa@090078601',
  },
  {
    firstName: 'Ali',
    lastName: 'Qasim',
    status: UserStatus.ACTIVE,
    email: 'aliqasim0900@gmail.com',
    gender: UserGender.MALE,
    phoneNo: '+090078602',
    password: 'Aa@090078601',
  },
];
