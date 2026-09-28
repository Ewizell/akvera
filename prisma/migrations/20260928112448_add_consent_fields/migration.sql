-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "consentAt" TIMESTAMP(3),
ADD COLUMN     "consentIp" TEXT,
ADD COLUMN     "consentVersion" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "consentAt" TIMESTAMP(3),
ADD COLUMN     "consentIp" TEXT,
ADD COLUMN     "consentVersion" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "consentAt" TIMESTAMP(3),
ADD COLUMN     "consentIp" TEXT,
ADD COLUMN     "consentVersion" TEXT;
