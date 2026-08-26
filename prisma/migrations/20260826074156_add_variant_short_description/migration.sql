/*
  Warnings:

  - You are about to drop the column `shortDescription` on the `ProductVariant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "shortDescription" VARCHAR(200);

-- AlterTable
ALTER TABLE "ProductVariant" DROP COLUMN "shortDescription";
