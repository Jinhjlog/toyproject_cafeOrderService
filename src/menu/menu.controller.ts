import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { InsertMenuDto } from './dto/insert-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { JwtAuthGuardAdmin } from '../auth/admin/jwt.auth.guard.admin';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @UseGuards(JwtAuthGuardAdmin)
  @Post('insert')
  insertMenu(@Body() data: InsertMenuDto) {
    return this.menuService.insertMenu(data);
  }

  @Get('getMenu')
  getMenu() {
    return this.menuService.getMenu();
  }

  @UseGuards(JwtAuthGuardAdmin)
  @Delete('deleteMenu/:docId')
  deleteMenu(@Param('docId') docId: string) {
    return this.menuService.deleteMenu(docId);
  }

  @UseGuards(JwtAuthGuardAdmin)
  @Put('updateMenu/')
  updateMenu(@Body() data: UpdateMenuDto) {
    return this.menuService.updateMenu(data);
  }
}
