import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

@Exclude()
export class SigninCredentials {
  @IsNotEmpty({ message: '$property cannot be empty' })
  @Expose()
  email: string;

  @IsNotEmpty({ message: '$property cannot be empty' })
  @Expose()
  password: string;
}
