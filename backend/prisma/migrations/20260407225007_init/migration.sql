-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MANUFACTURER', 'DISTRIBUTOR', 'PHARMACY', 'DOCTOR', 'AUDITOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('ACTIVE', 'RECALLED', 'EXPIRED', 'DISPENSED');

-- CreateEnum
CREATE TYPE "TransferType" AS ENUM ('MANUFACTURE', 'DISTRIBUTE', 'RECEIVE', 'DISPENSE', 'RETURN');

-- CreateTable
CREATE TABLE "Participant" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DrugBatch" (
    "id" TEXT NOT NULL,
    "gtin" TEXT NOT NULL,
    "lot" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "manufacturerId" TEXT NOT NULL,
    "status" "BatchStatus" NOT NULL DEFAULT 'ACTIVE',
    "dataHash" TEXT NOT NULL,
    "txHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DrugBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transfer" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "type" "TransferType" NOT NULL,
    "nfeKey" TEXT,
    "nfeHash" TEXT,
    "signature" TEXT NOT NULL,
    "txHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prescription" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "pharmacyId" TEXT,
    "batchId" TEXT NOT NULL,
    "patientHash" TEXT NOT NULL,
    "encryptedData" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "dispensedAt" TIMESTAMP(3),
    "signature" TEXT NOT NULL,
    "txHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Prescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TempLog" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,
    "humidity" DOUBLE PRECISION,
    "deviceId" TEXT NOT NULL,
    "alertTriggered" BOOLEAN NOT NULL DEFAULT false,
    "txHash" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TempLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Participant_address_key" ON "Participant"("address");

-- CreateIndex
CREATE UNIQUE INDEX "Participant_cnpj_key" ON "Participant"("cnpj");

-- AddForeignKey
ALTER TABLE "DrugBatch" ADD CONSTRAINT "DrugBatch_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "Participant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "DrugBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "Participant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_toId_fkey" FOREIGN KEY ("toId") REFERENCES "Participant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Participant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_pharmacyId_fkey" FOREIGN KEY ("pharmacyId") REFERENCES "Participant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "DrugBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TempLog" ADD CONSTRAINT "TempLog_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "DrugBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
