import { Controller } from '@nestjs/common';
import { Get, Query } from '@nestjs/common/decorators';
import { StatisticsService } from './statistics.service';
import { StatisticsQueryDto } from './dtos/statistics-query.dto';
import { UseGuards } from '@nestjs/common/decorators/core/use-guards.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('')
  async getStatistics(@Query() query: StatisticsQueryDto) {
    return this.statisticsService.getStatistics(query);
  }
}
