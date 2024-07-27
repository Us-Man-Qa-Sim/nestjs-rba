import { ERRORS } from '../constants/constants';

export class UnauthorizedError extends Error {
  constructor(message: string = ERRORS.UN_AUTHORIZED) {
    super(message);
  }
}
