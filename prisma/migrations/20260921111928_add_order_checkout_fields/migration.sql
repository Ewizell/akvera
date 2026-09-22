-- AlterTable
ALTER TABLE "CategoryAttribute" ALTER COLUMN "categoryId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryAddress" TEXT,
ADD COLUMN     "deliveryMethod" TEXT,
ADD COLUMN     "organization" TEXT,
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "prepaymentType" TEXT;
