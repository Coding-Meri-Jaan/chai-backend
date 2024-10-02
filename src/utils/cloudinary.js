import { v2 as cloudinary } from "cloudinary"
import fs from "fs"

//this config will allow you to upload the file, else it can't identify who is 
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});


//using try catch for file upload case because it is complex task
export const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload the file  on cloudinary
       const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
       })
        //file uploaded successfully and providing public url
        console.log("file is uploaded on cloudinary", response.url);
        return response;
    }
    catch (error) {

        //file is on server but if it is not uploaded, we can unlink it from the server (locally saved temporary file)
        fs.unlinkSync(localFilePath)
        return null;
    }
}



cloudinary.uploader.upload("https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg",
    { public_id: "shoes" },
    function (error, result) {
        if (error) console.error(error);
        else console.log(result);
    }
);

