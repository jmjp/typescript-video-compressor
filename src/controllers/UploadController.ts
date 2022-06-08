import {Request, Response } from 'express';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import { bucket } from '../services/BucketService';
import { v4 as uuidv4 } from 'uuid';

class UploadController {
    async handle(req: Request, res: Response) {
        const uuid = uuidv4();
        try{
            let file = req.file;
            let filePath = file.path;
            let fileName = file.filename;
            let fileExtension = file.originalname.split('.').pop();
            await ffmpeg(filePath).output(`${filePath}.${fileExtension}`).size('50%').aspectRatio('16:9').format('mp4')
            .on('end',async (stdout,stderr) => {
                if(stderr){
                    console.log(stderr);
                }
                const upload = await bucket.upload({
                    file: fs.createReadStream(filePath + '.mp4'),
                    fileName: `${uuid}.${fileExtension}`,
                    folder: 'videos',
                    useUniqueFileName: true
                })
                fs.unlink(filePath, (err) => {
                    if(err){
                        console.log(err);
                    }
                    console.log("input deletado");
                })
                fs.unlink(`${filePath}.${fileExtension}`, (err) => {
                    if(err){
                        console.log(err);
                    }
                    console.log("output deletado");
                })
                return res.json(upload);
            })
            .on('error', (stdout, stderr) => {
                if(stderr){
                    console.log(stderr);
                }
                return res.status(400).json({message: 'Falha ao enviar arquivo'});
            })
            .run();
        }catch(error){
            return res.status(400).json({message: error.message});
        }
    }
}

export { UploadController };