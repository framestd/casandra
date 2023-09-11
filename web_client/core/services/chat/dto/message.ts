import { ChatMessageCreate } from '@/client';
import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty, IsUUID } from 'class-validator';

@Exclude()
export class ChatMessageCreateConcrete implements ChatMessageCreate {
  @IsNotEmpty({ message: '$property cannot be empty' })
  @Expose()
  body: string;

  @IsNotEmpty({ message: '$property cannot be empty' })
  @IsUUID(4, { message: '$property must be a valid resource identifier' })
  conversation_id?: string;
}
