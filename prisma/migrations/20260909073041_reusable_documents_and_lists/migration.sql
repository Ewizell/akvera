/*
  Warnings:

  - You are about to drop the column `title` on the `ProductDocument` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `ProductDocument` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `ProductDocument` table. All the data in the column will be lost.
  - You are about to drop the column `variantId` on the `ProductDocument` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[productId,documentId]` on the table `ProductDocument` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `documentId` to the `ProductDocument` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productId` to the `ProductDocument` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ProductDocument" DROP CONSTRAINT "ProductDocument_variantId_fkey";

-- AlterTable
ALTER TABLE "Brand" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "advantages" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "applicationAreas" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "ProductDocument" DROP COLUMN "title",
DROP COLUMN "type",
DROP COLUMN "url",
DROP COLUMN "variantId",
ADD COLUMN     "documentId" TEXT NOT NULL,
ADD COLUMN     "productId" TEXT NOT NULL,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "advantages" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "applicationAreas" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariantDocument" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductVariantDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariantDocument_variantId_documentId_key" ON "ProductVariantDocument"("variantId", "documentId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductDocument_productId_documentId_key" ON "ProductDocument"("productId", "documentId");

-- AddForeignKey
ALTER TABLE "ProductDocument" ADD CONSTRAINT "ProductDocument_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductDocument" ADD CONSTRAINT "ProductDocument_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariantDocument" ADD CONSTRAINT "ProductVariantDocument_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariantDocument" ADD CONSTRAINT "ProductVariantDocument_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
