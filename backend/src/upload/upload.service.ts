import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
    private readonly uploadDir = path.join(process.cwd(), 'uploads', 'dishes');

    constructor() {
        // Create upload directory if it doesn't exist
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    async uploadDishImage(file: Express.Multer.File): Promise<string> {
        if (!file) {
            throw new BadRequestException('画像ファイルが必要です');
        }

        // Validate file type
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException('無効な画像形式です。JPEG、PNG、またはWEBPのみ許可されています');
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            throw new BadRequestException('画像サイズは5MB以下である必要があります');
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const extension = path.extname(file.originalname);
        const filename = `dish_${timestamp}_${randomString}${extension}`;
        const filePath = path.join(this.uploadDir, filename);

        // Save file
        fs.writeFileSync(filePath, file.buffer);

        // Return relative URL path
        return `/uploads/dishes/${filename}`;
    }

    deleteFile(filePath: string): void {
        try {
            const fullPath = path.join(process.cwd(), filePath);
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
            }
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    }
}
