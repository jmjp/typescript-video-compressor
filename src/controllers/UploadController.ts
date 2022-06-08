import {Request, Response } from 'express';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import { bucket } from '../services/BucketService';
import { v4 as uuidv4 } from 'uuid';

class UploadController {
    async handle(req: Request, res: Response) {
        const uuid = uuidv4();
        upload(req.file,uuid);
        return res.json({message:"uploaded"});
    }
}

async function upload(file: Express.Multer.File, uuid: string) {
    try{
        let filePath = file.path;
        let fileExtension = file.originalname.split('.').pop();
        await ffmpeg(filePath).output(`${filePath}.${fileExtension}`).size('50%').aspectRatio('16:9').FPS(30).format('mp4')
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
            console.log(upload);
        })
        .on('error', (stdout, stderr) => {
            if(stderr){
                console.log(stderr);
            }
            console.log('Falha ao enviar arquivo');
        })
        .run();
    }catch(error){
        console.log(error)
    }
}

export { UploadController };