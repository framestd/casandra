import { USERNAME_REGEX } from '@/core/utils';
import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, Matches, MinLength } from 'class-validator';

@Exclude()
export class SignupCredentials {
  @IsNotEmpty({ message: 'First name cannot be empty' })
  @Expose()
  first_name: string;

  @IsNotEmpty({ message: 'Last name cannot be empty' })
  @Expose()
  last_name: string;

  @IsNotEmpty({ message: 'Username cannot be empty' })
  @Matches(USERNAME_REGEX, {
    message: '$property must start with latin alphabets, may contain an underscore, or alphanumeric characters',
  })
  @Expose()
  username: string;

  @IsEmail(undefined, { message: 'Invalid email address' })
  @Expose()
  email: string;

  @MinLength(8, { message: '$property must be at least $constraint1 characters' })
  @Expose()
  password: string;
}
