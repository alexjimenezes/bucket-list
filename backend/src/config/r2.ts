import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from './env';

// R2 client (S3-compatible)
export const r2Client = new S3Client({
  region: 'auto',
  endpoint: env.r2Endpoint,
  credentials: {
    accessKeyId: env.r2AccessKeyId,
    secretAccessKey: env.r2SecretAccessKey,
  },
});

const BUCKET_NAME = env.r2BucketName;

/**
 * Upload a file to R2
 */
export async function uploadToR2(
  key: string,
  body: Buffer,
  contentType: string
): Promise<void> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
  });

  await r2Client.send(command);
}

/**
 * Delete a file from R2
 */
export async function deleteFromR2(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await r2Client.send(command);
}

/**
 * Generate a signed URL for viewing an image
 * @param key - The R2 object key
 * @param expiresIn - URL expiration time in seconds (default 1 hour)
 */
export async function getSignedImageUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(r2Client, command, { expiresIn });
}

/**
 * Generate a unique key for an image
 */
export function generateImageKey(
  bucketListId: string,
  itemId: string,
  extension: string
): string {
  const uuid = crypto.randomUUID();
  return `memories/${bucketListId}/${itemId}/${uuid}.${extension}`;
}

/**
 * Check if R2 is configured
 */
export function isR2Configured(): boolean {
  return !!(
    env.r2Endpoint &&
    env.r2AccessKeyId &&
    env.r2SecretAccessKey &&
    env.r2BucketName
  );
}
