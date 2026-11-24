import Image from 'next/image';

export default function MediaImage({
  asset,
  className,
  priority = false,
  sizes = '(max-width: 768px) 100vw, 50vw',
  alt,
}) {
  if (!asset?.url) return null;
  return (
    <Image
      src={asset.url}
      alt={alt ?? asset.altText ?? ''}
      width={asset.width || 1000}
      height={asset.height || 1000}
      sizes={sizes}
      priority={priority}
      className={className}
      unoptimized={asset.mimeType === 'image/svg+xml'}
    />
  );
}
