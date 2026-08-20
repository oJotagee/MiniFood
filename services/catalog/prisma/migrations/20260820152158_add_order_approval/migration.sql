-- CreateEnum
CREATE TYPE "OrderApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "order_approvals" (
    "order_id" TEXT NOT NULL,
    "operation_id" TEXT NOT NULL,
    "establishment_id" TEXT NOT NULL,
    "status" "OrderApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "items" JSONB NOT NULL,
    "decided_by" TEXT,
    "decided_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_approvals_pkey" PRIMARY KEY ("order_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "order_approvals_operation_id_key" ON "order_approvals"("operation_id");

-- CreateIndex
CREATE INDEX "order_approvals_establishment_id_status_idx" ON "order_approvals"("establishment_id", "status");
