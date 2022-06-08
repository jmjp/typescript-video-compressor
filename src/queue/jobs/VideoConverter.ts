import { DoneCallback, Job } from "bull";
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import { bucket } from './../../services/BucketService';
import { v4 as uuidv4 } from 'uuid';

const reduceVideoSizeProcess = async (job: Job, done: DoneCallback) => {
    const uuid = uuidv4();
    try{
            let filePath = job.data.path;
            let fileExtension =job.data;
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
                done(null, upload);
            })
            .on('error', (stdout, stderr) => {
                if(stderr){
                    console.log(stderr);
                }
                done(new Error('Falha ao enviar arquivo'), false);
            })
            .run();
    }catch(error){
        done(Error(`Falha ao enviar arquivo`), false);
    }
}

export { reduceVideoSizeProcess };