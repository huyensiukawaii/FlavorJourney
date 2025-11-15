import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDishDto } from './dtos/create-dish.dto';
import { UpdateDishDto } from './dtos/update-dish.dto';

@Injectable()
export class DishService {
  constructor(private prisma: PrismaService) { }

  async createDish(createDishDto: CreateDishDto, userId: number) {
    const { category_id, region_id } = createDishDto;

    // Kiểm tra category tồn tại nếu có
    if (category_id) {
      const category = await this.prisma.categories.findUnique({
        where: { id: category_id },
      });
      if (!category) throw new BadRequestException('カテゴリーが無効です');
    }

    // Kiểm tra region tồn tại nếu có
    if (region_id) {
      const region = await this.prisma.regions.findUnique({
        where: { id: region_id },
      });
      if (!region) throw new BadRequestException('地域が無効です');
    }

    // Kiểm tra tên món ăn
    if (!createDishDto.name_japanese || !createDishDto.name_vietnamese) {
      throw new BadRequestException('料理名は必須です');
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

  async updateDishSubmission(id: number, updateDishDto: UpdateDishDto, userId: number, userRole: string) {
    // Check if dish exists
    const existingDish = await this.prisma.dishes.findUnique({
      where: { id },
    });

    if (!existingDish) {
      throw new NotFoundException('料理が見つかりません');
    }

    const isAdmin = userRole === 'admin';
    const isOwner = existingDish.submitted_by === userId;

    // Regular users can only update their own pending dishes
    if (!isAdmin) {
      if (!isOwner) {
        throw new ForbiddenException('他のユーザーが提出した料理は更新できません');
      }
      if (existingDish.status !== 'pending') {
        throw new BadRequestException('承認済みまたは却下された料理は更新できません');
      }
      // Regular users cannot change status
      if (updateDishDto.status) {
        throw new ForbiddenException('ステータスを変更する権限がありません');
      }
    }

    // Admin can update any dish, but when changing status, it's a review action
    if (isAdmin && updateDishDto.status && updateDishDto.status !== existingDish.status) {
      // If admin is changing status, they are reviewing
      const { category_id, region_id, status, rejection_reason, ...otherFields } = updateDishDto;

      const updateData: any = {
        ...otherFields,
        status,
        reviewed_by: userId,
        reviewed_at: new Date(),
      };

      // Add rejection reason if rejecting
      if (status === 'rejected') {
        if (!rejection_reason) {
          throw new BadRequestException('却下理由が必要です');
        }
        updateData.rejection_reason = rejection_reason;
      } else {
        updateData.rejection_reason = null;
      }

      // Validate category if provided
      if (category_id !== undefined) {
        const category = await this.prisma.categories.findUnique({
          where: { id: category_id },
        });
        if (!category) throw new BadRequestException('カテゴリーが無効です');
        updateData.category_id = category_id;
      }

      // Validate region if provided
      if (region_id !== undefined) {
        const region = await this.prisma.regions.findUnique({
          where: { id: region_id },
        });
        if (!region) throw new BadRequestException('地域が無効です');
        updateData.region_id = region_id;
      }

      const updatedDish = await this.prisma.dishes.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          name_japanese: true,
          name_vietnamese: true,
          name_romaji: true,
          description_japanese: true,
          description_vietnamese: true,
          description_romaji: true,
          image_url: true,
          category_id: true,
          region_id: true,
          spiciness_level: true,
          saltiness_level: true,
          sweetness_level: true,
          sourness_level: true,
          ingredients: true,
          how_to_eat: true,
          status: true,
          reviewed_by: true,
          reviewed_at: true,
          rejection_reason: true,
          submitted_at: true,
          updated_at: true,
        },
      });

      return updatedDish;
    }

    // Regular update (not changing status or regular user editing)
    const { category_id, region_id, status, rejection_reason, ...otherFields } = updateDishDto;

    // Validate category if provided
    if (category_id !== undefined) {
      const category = await this.prisma.categories.findUnique({
        where: { id: category_id },
      });
      if (!category) throw new BadRequestException('カテゴリーが無効です');
    }

    // Validate region if provided
    if (region_id !== undefined) {
      const region = await this.prisma.regions.findUnique({
        where: { id: region_id },
      });
      if (!region) throw new BadRequestException('地域が無効です');
    }

    const updateData: any = { ...otherFields };
    if (category_id !== undefined) updateData.category_id = category_id;
    if (region_id !== undefined) updateData.region_id = region_id;

    // Update the dish
    const updatedDish = await this.prisma.dishes.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name_japanese: true,
        name_vietnamese: true,
        name_romaji: true,
        description_japanese: true,
        description_vietnamese: true,
        description_romaji: true,
        image_url: true,
        category_id: true,
        region_id: true,
        spiciness_level: true,
        saltiness_level: true,
        sweetness_level: true,
        sourness_level: true,
        ingredients: true,
        how_to_eat: true,
        status: true,
        submitted_at: true,
        updated_at: true,
      },
    });

    return updatedDish;
  }

  async getAllDishSubmissions() {
    const dishes = await this.prisma.dishes.findMany({
      select: {
        id: true,
        name_japanese: true,
        name_vietnamese: true,
        name_romaji: true,
        description_japanese: true,
        description_vietnamese: true,
        description_romaji: true,
        image_url: true,
        category_id: true,
        region_id: true,
        spiciness_level: true,
        saltiness_level: true,
        sweetness_level: true,
        sourness_level: true,
        ingredients: true,
        how_to_eat: true,
        status: true,
        submitted_by: true,
        reviewed_by: true,
        submitted_at: true,
        reviewed_at: true,
        rejection_reason: true,
        category: {
          select: {
            id: true,
            name_japanese: true,
            name_vietnamese: true,
          },
        },
        region: {
          select: {
            id: true,
            name_japanese: true,
            name_vietnamese: true,
          },
        },
        users_dishes_submitted_byTousers: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        submitted_at: 'desc',
      },
    });

    return dishes.map(dish => ({
      ...dish,
      submitter: dish.users_dishes_submitted_byTousers,
      users_dishes_submitted_byTousers: undefined,
    }));
  }
}
