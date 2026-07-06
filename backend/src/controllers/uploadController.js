import { Readable } from "stream";
import cloudinary from "../config/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function uploadStream(fileBuffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    Readable.from(fileBuffer).pipe(stream);
  });
}

export const uploadImage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(new ApiError(400, "Please provide an image file."));
  const result = await uploadStream(req.file.buffer, "portfolio-showcase");
  res.status(201).json({
    success: true,
    image: {
      url: result.secure_url,
      publicId: result.public_id
    }
  });
});
