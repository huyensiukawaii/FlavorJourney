import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDishDto } from './dtos/create-dish.dto';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class DishService {
  constructor(
    private prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  async createDish(createDishDto: CreateDishDto, userId: number) {
    const { category_id, region_id } = createDishDto;

    // Kiểm tra category tồn tại nếu có
    if (category_id) {
      const category = await this.prisma.categories.findUnique({
        where: { id: category_id },
      });
      if (!category)
        throw new BadRequestException(
          await this.i18n.t('dish.errors.invalid_category'),
        );
    }

    // Kiểm tra region tồn tại nếu có
    if (region_id) {
      const region = await this.prisma.regions.findUnique({
        where: { id: region_id },
      });
      if (!region)
        throw new BadRequestException(
          await this.i18n.t('dish.errors.invalid_region'),
        );
    }

    // Kiểm tra tên món ăn
    if (!createDishDto.name_japanese || !createDishDto.name_vietnamese) {
      throw new BadRequestException(
        await this.i18n.t('dish.errors.name_required'),
      );
    }

    const dish = await this.prisma.dishes.create({
      data: {
        ...createDishDto,
        submitted_by: userId,
        status: 'pending',
        submitted_at: new Date(),
      },
      select: {
        id: true,
        name_japanese: true,
        name_vietnamese: true,
        status: true,
        submitted_at: true,
      },
    });

    return dish;
  }
}
