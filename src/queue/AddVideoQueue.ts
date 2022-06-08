import Queue from 'bull';
import { reduceVideoSizeProcess } from './jobs/VideoConverter';
const processVideo = new Queue('reduceVideoQueue', {
    limiter:{
        max: 1,
        duration: 2000
    },
    redis: {
        host: '',
        port: 14000,
        password: '',
        tls: {
            rejectUnauthorized: false
        }
    }
});

processVideo.on('completed', job => {
    console.log(`Task ${job.id} has been completed`);
})
processVideo.on('failed', job => {
    console.log(`Task ${job.id} has been failed`);
})

processVideo.process('reduceVideoQueue',1, reduceVideoSizeProcess);
const addVideo= async (data: any) => {
    var job = await processVideo.add('reduceVideoQueue',data, {
        attempts: 1,
        removeOnComplete: true,
        removeOnFail: true,
        delay: 1000
    });
    return job.id;
}

export {
    addVideo
}
