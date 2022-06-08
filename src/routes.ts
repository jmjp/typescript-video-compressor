import express, { Router } from 'express';
import multer from 'multer';
import { UploadController } from './controllers/UploadController';
export const routes = express.Router();
const uploader = multer({ dest: './uploads' });

routes.get('/',(req,res) => res.json({message: 'Hello World'}));
routes.post('/upload', uploader.single('file'), new UploadController().handle);