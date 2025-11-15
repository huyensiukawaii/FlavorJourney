import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProfileModule } from './profile/profile.module';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { DishModule } from './dish/dish.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [ProfileModule, PrismaModule, CommonModule, AuthModule, DishModule, UploadModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
