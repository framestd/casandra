import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

import { MessageCreate } from '@/client';

@Exclude()
export class ChatMessageCreateConcrete implements MessageCreate {
  @IsNotEmpty({ message: '$property cannot be empty' })
  @Expose()
  body: string;

  @IsNotEmpty({ message: '$property cannot be empty' })
  @IsUUID(4, { message: '$property must be a valid resource identifier' })
  @IsOptional()
  conversation_id?: string;
}
