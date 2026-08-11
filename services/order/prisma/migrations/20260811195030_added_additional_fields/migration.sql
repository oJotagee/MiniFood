/*
  Warnings:

  - You are about to alter the column `price` on the `order_items` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `BigInt`.
  - You are about to drop the `customer_addresses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `customers` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `establishment_id` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "customer_addresses" DROP CONSTRAINT "customer_addresses_customer_id_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_customer_id_fkey";

-- AlterTable
ALTER TABLE "order_items" ALTER COLUMN "price" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "establishment_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "customer_addresses";

-- DropTable
DROP TABLE "customers";
