import { v2 as cloudinary } from 'cloudinary';

function client() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET)
    throw new Error('Cloudinary environment is not configured');
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
  return cloudinary;
}

export const cloudinaryStorage = {
  async upload({ key, original }) {
    const cloud = client();
    const result = await new Promise((resolve, reject) => {
      const stream = cloud.uploader.upload_stream(
        { public_id: `bloom/${key}`, resource_type: 'image', format: 'webp', overwrite: false },
        (error, asset) => (error ? reject(error) : resolve(asset)),
      );
      stream.end(original);
    });
    return {
      provider: 'cloudinary',
      providerKey: result.public_id,
      url: result.secure_url,
      thumbnailUrl: cloud.url(result.public_id, {
        width: 420,
        height: 320,
        crop: 'limit',
        format: 'webp',
        secure: true,
      }),
    };
  },
  async remove(asset) {
    await client().uploader.destroy(asset.providerKey, {
      resource_type: 'image',
      invalidate: true,
    });
  },
};
