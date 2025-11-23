import { Injectable } from '@nestjs/common';
import { StatisticsQueryDto } from './dtos/statistics-query.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatisticsService {
  constructor(private readonly prismaService: PrismaService) {}
  async getStatistics(query: StatisticsQueryDto) {
    const { from, to } = query;

    let dateFilter = {};

    if (from || to) {
      dateFilter = {
        createdAt: {
          ...(from ? { gte: new Date(from) } : {}),
          ...(to ? { lte: new Date(to) } : {}),
        },
      };
    }

    const [
      totalUsers,
      totalDishes,
      pendingDishes,
      approvedDishes,
      rejectedDishes,
    ] = await Promise.all([
      this.prismaService.users.count({
        where: dateFilter,
      }),

      this.prismaService.dishes.count({
        where: dateFilter,
      }),

      this.prismaService.dishes.count({
        where: {
          status: 'pending',
          ...dateFilter,
        },
      }),

      this.prismaService.dishes.count({
        where: {
          status: 'approved',
          ...dateFilter,
        },
      }),

      this.prismaService.dishes.count({
        where: {
          status: 'rejected',
          ...dateFilter,
        },
      }),
    ]);

    return {
      totalUsers,
      totalDishes,
      pendingDishes,
      approvedDishes,
      rejectedDishes,
    };
  }
}
