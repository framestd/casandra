import { MessageCreate } from '@/client';
import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

@Exclude()
export class MessageCreateConcrete implements MessageCreate {
  @IsNotEmpty({ message: 'message body cannot be empty' })
  @Expose()
  message_body: string;
}
