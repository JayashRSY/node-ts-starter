// import fs from 'fs';
// import stream from 'stream';
// import { v2 as cloudinary } from 'cloudinary';
// import streamifier from 'streamifier';
// import { fileURLToPath } from 'url';
// import path from 'path';
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.resolve(path.dirname(__filename), '../');
// const KEYFILEPATH = path.join(__dirname, "../cred.json");

// export const uploadToCloudinary = async (file) => {
//     try {
//         cloudinary.config({
//             cloud_name: process.env.CD_NAME,
//             api_key: process.env.CD_API_KEY,
//             api_secret: process.env.CD_API_SECRET,
//         });
//         const result = await cloudinary.uploader.upload('url',
//             { public_id: new Date().toISOString().replace(/[-T:.Z]/g, '') + file.originalname }
//         );
//         return result;
//     } catch (err) {
//         throw err;
//     }
// }