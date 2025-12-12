import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFile,
    UseGuards,
    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { UploadResponseDto } from './dtos/upload-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('upload')
export class UploadController {
    constructor(private readonly uploadService: UploadService) { }

    @UseGuards(JwtAuthGuard)
    @Post('dish-image')
    @UseInterceptors(FileInterceptor('image'))
    async uploadDishImage(
        @UploadedFile() file: Express.Multer.File,
    ): Promise<UploadResponseDto> {
        if (!file) {
            throw new BadRequestException('画像ファイルが必要です');
        }

        const url = await this.uploadService.uploadDishImage(file);
        return {
            url,
            message: '画像が正常にアップロードされました',
        };
    }

    @UseGuards(JwtAuthGuard)
    @Post('avatar')
    @UseInterceptors(FileInterceptor('avatar'))
    async uploadAvatar(
        @UploadedFile() file: Express.Multer.File,
    ): Promise<UploadResponseDto> {
        if (!file) {
            throw new BadRequestException('Avatar file is required');
        }

        const url = await this.uploadService.uploadAvatar(file);
        return {
            url,
            message: 'Avatar uploaded successfully',
        };
    }
}
