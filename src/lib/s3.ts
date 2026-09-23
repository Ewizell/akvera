import { S3Client } from "@aws-sdk/client-s3";
export const S3_PUBLIC_URL = process.env.S3_PUBLIC_URL!;

export const s3 = new S3Client({
  region: process.env.S3_REGION,
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true, // важно для не-AWS S3-совместимых провайдеров
});

export const S3_BUCKET = process.env.S3_BUCKET!;