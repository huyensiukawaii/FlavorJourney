import { Module } from '@nestjs/common';
import { TemplateController } from './template.controller';
import { TemplateService } from './template.service';
import { UploadModule } from '../upload/upload.module';

@Module({
  controllers: [TemplateController],
  providers: [TemplateService],
  imports: [UploadModule],
})
export class TemplateModule {}
