"use server";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3, S3_BUCKET } from "@/lib/s3";
import { randomUUID } from "crypto";

export async function getPresignedUploadUrl(
  fileName: string,
  fileType: string,
  folder: "products/images" = "products/images"
) {
  const ext = fileName.split(".").pop();
  const key = `${folder}/${randomUUID()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    ContentType: fileType,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 минут

  const publicUrl = `${process.env.S3_PUBLIC_URL}/${key}`;

  return { uploadUrl, key, publicUrl };
}