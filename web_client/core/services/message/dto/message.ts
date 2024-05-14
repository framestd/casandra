import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsUUID, ValidateNested } from 'class-validator';

import { MessageCreate, MessageCreateCustomizations, BodyPublishMessageMessagesPost } from '@/client';

@Exclude()
export class MessageCreateConcrete implements MessageCreate {
  @IsNotEmpty({ message: '$property cannot be empty' })
  @Expose()
  body: string;

  @IsNotEmpty({ message: '$property cannot be empty' })
  @IsUUID(4, { message: '$property must be a valid resource identifier' })
  @IsOptional()
  conversation_id?: string;
}

@Exclude()
export class MessageCreateCustomizationsConcrete implements MessageCreateCustomizations {
  @IsUUID(4, { message: '$property must be a valid resource identifier' })
  @Expose()
  quotes?: string[];

  @IsNotEmpty({ message: '$property cannot be empty' })
  @IsOptional()
  @Expose()
  context_length?: number;
}

@Exclude()
export class CustomizedMessageCreate implements BodyPublishMessageMessagesPost {
  @ValidateNested()
  @Expose()
  message: MessageCreateConcrete;

  @ValidateNested()
  @Expose()
  customizations: MessageCreateCustomizationsConcrete;
}
