import * as bcrypt from 'bcrypt';
export class Utils {
  public static generateHash(str: string): string {
    return bcrypt.hashSync(str, parseInt(process.env.BCRYPT_WORK));
  }

  public static trimLowerString(str: string): string {
    return str.trim().toLowerCase();
  }

  public static verifyPassword(
    userPassword: string,
    passwordInput: string,
  ): boolean {
    return bcrypt.compareSync(passwordInput, userPassword);
  }
}
