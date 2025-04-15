import { v2 as cloudinary, UploadApiResponse,  UploadApiOptions } from "cloudinary"

import fs from "fs"


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string
});

const extractPublicIdFromUrl = (url: string): string => {
  const parts = url.split('/');
  const fileWithExtension = parts[parts.length - 1];
  const publicId = fileWithExtension.split('.')[0];
  return publicId;
};

const cloudinaryUpload = async (localFilePath: string): Promise<UploadApiResponse | null> => {
  try {
    if (!localFilePath) return null;
    const response: UploadApiResponse = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    } as UploadApiOptions);
    console.log("File uploaded successfully ", response.url);
    fs.unlink(localFilePath, (err) => {
      if (err) throw err;
    })
    console.log(`deleted ${localFilePath}`)
    return response;
  } catch (error) {
    console.log(error)
    fs.unlink(localFilePath, (err) => {
      if (err) throw err;
    })
    console.log(`deleted ${localFilePath}`)
    return null;
  }

}

const cloudinaryDelete = async (remoteFilePath: string): Promise<UploadApiResponse | null> => {
  try {
    if (!remoteFilePath) return null;
    const publicId = extractPublicIdFromUrl(remoteFilePath)
    const response = await cloudinary.uploader.destroy(publicId)
    console.log(response)
    return response;
  } catch (error) {
    console.log(error)
    return null
  }
}


export { cloudinaryUpload, cloudinaryDelete }
