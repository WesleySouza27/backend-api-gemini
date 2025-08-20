import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({ example: 'Olá, Gemini!', description: 'Conteúdo da mensagem' })
  @IsString()
  @MinLength(1)
  content: string;

  @ApiProperty({
    example: 'id do usuário(uuid)',
    description: 'ID do usuário autor da mensagem',
  })
  @IsString()
  userId: string;

  isBot?: boolean;
}
