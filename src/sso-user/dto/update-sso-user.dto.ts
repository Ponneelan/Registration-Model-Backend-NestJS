import { PartialType } from '@nestjs/swagger';
import { CreateSsoUserDto } from './create-sso-user.dto';

export class UpdateSsoUserDto extends PartialType(CreateSsoUserDto) {}
