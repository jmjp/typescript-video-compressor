import {Request, Response } from 'express';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import { bucket } from '../services/BucketService';
import { v4 as uuidv4 } from 'uuid';
import { addVideo } from '../queue/AddVideoQueue';

class UploadController {
    async handle(req: Request, res: Response) {
        const uuid = uuidv4();
        let file = req.file;
        await addVideo({
            path: file.path,
            extension: file.originalname.split('.').pop()
        })
        return res.json({status: "success", "message": "Video uploaded successfully"});
    }
}

export { UploadController };