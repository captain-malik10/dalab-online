import ImageKit from 'imagekit';

// ImageKit is optional. Without credentials, uploads are disabled and vendors
// provide image URLs instead.
export const isImageKitConfigured = Boolean(
  process.env.IMAGEKIT_PUBLIC_KEY &&
    process.env.IMAGEKIT_PRIVATE_KEY &&
    process.env.IMAGEKIT_URL_ENDPOINT,
);

const imagekit = isImageKitConfigured
  ? new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    })
  : null;

if (!isImageKitConfigured) {
  console.warn('ImageKit is not configured: file uploads are disabled, image URLs are used instead.');
}

export default imagekit;
