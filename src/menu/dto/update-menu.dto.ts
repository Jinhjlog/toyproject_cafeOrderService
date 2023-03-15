import { PartialType } from '@nestjs/mapped-types';
import { InsertMenuDto } from './insert-menu.dto';

export class UpdateMenuDto extends PartialType(InsertMenuDto) {}
