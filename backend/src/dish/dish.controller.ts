import { Controller, Post, Body, Req, UseGuards, Put, Param, Get } from '@nestjs/common';
import { DishService } from './dish.service';
import { CreateDishDto } from './dtos/create-dish.dto';
import { UpdateDishDto } from './dtos/update-dish.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('dish-submissions')
export class DishController {
  constructor(private readonly dishService: DishService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  async addDish(@Body() createDishDto: CreateDishDto, @Req() req) {
    const userId = req.user.id;
    return this.dishService.createDish(createDishDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateDishSubmission(
    @Param('id') id: string,
    @Body() updateDishDto: UpdateDishDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    const userRole = req.user.role;
    const dishId = parseInt(id, 10);
    return this.dishService.updateDishSubmission(dishId, updateDishDto, userId, userRole);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  async getAllDishSubmissions() {
    return this.dishService.getAllDishSubmissions();
  }
}
