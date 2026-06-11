-- CreateEnum
CREATE TYPE "public"."DataSourceStatus" AS ENUM ('NEW', 'OK', 'BAD_REQUEST', 'FORBIDDEN', 'NOT_FOUND', 'REQUEST_TIMEOUT', 'UNKNOWN_ERROR');

-- CreateEnum
CREATE TYPE "public"."DataSourceEntityStatus" AS ENUM ('ENABLED', 'DISABLED', 'REMOVED');

-- CreateEnum
CREATE TYPE "public"."DataSourceFieldStatus" AS ENUM ('ENABLED', 'DISABLED', 'REMOVED');

-- CreateEnum
CREATE TYPE "public"."DataSourcePullStatus" AS ENUM ('CREATED', 'PULLING', 'PULL_COMPLETED', 'PULL_FAILED', 'SUBMITTING', 'SUBMIT_COMPLETED', 'SUBMIT_FAILED');

-- CreateEnum
CREATE TYPE "public"."DataSourcePullTargetType" AS ENUM ('DATA_SOURCE', 'TABLE', 'ROW', 'CELL');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'User',
    "email" TEXT NOT NULL DEFAULT '',
    "role" TEXT NOT NULL DEFAULT 'USER',
    "department" TEXT NOT NULL DEFAULT 'General',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "lastLogin" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DataSource" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "engineApiKey" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "status" "public"."DataSourceStatus" NOT NULL DEFAULT 'NEW',
    "message" TEXT,
    "order" INTEGER NOT NULL DEFAULT 99999,

    CONSTRAINT "DataSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DataSourceEntity" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dataSourceId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "status" "public"."DataSourceEntityStatus" NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 99999,

    CONSTRAINT "DataSourceEntity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DataSourceField" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "entityId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "primary" BOOLEAN NOT NULL DEFAULT false,
    "status" "public"."DataSourceFieldStatus" NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 99999,

    CONSTRAINT "DataSourceField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DataSourceData" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "entityId" INTEGER NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "updatedBy" TEXT,

    CONSTRAINT "DataSourceData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DataSourceValue" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dataId" INTEGER NOT NULL,
    "fieldId" INTEGER NOT NULL,
    "value" TEXT,
    "active" BOOLEAN NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "DataSourceValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DataSourceForeignKey" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "entityId" INTEGER NOT NULL,
    "refEntityId" INTEGER NOT NULL,

    CONSTRAINT "DataSourceForeignKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DataSourceForeignKeyField" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "foreignKeyId" INTEGER NOT NULL,
    "fieldId" INTEGER NOT NULL,
    "refFieldId" INTEGER NOT NULL,

    CONSTRAINT "DataSourceForeignKeyField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DataSourcePull" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "targetType" "public"."DataSourcePullTargetType" NOT NULL,
    "targetId" INTEGER NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "pulledCount" INTEGER NOT NULL DEFAULT 0,
    "submittedCount" INTEGER NOT NULL DEFAULT 0,
    "status" "public"."DataSourcePullStatus" NOT NULL DEFAULT 'CREATED',

    CONSTRAINT "DataSourcePull_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DataSourcePullData" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dataSourcePullId" INTEGER NOT NULL,
    "data" JSONB,

    CONSTRAINT "DataSourcePullData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ComplianceRecord" (
    "id" SERIAL NOT NULL,
    "productSku" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "regulation" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COMPLIANT',
    "auditDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextAudit" TIMESTAMP(3),
    "notes" TEXT,
    "auditedBy" TEXT NOT NULL DEFAULT 'System',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplianceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuditLog" (
    "id" SERIAL NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "performedBy" TEXT NOT NULL DEFAULT 'system',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "DataSource_name_key" ON "public"."DataSource"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DataSource_apiKey_key" ON "public"."DataSource"("apiKey");

-- CreateIndex
CREATE UNIQUE INDEX "DataSource_engineApiKey_key" ON "public"."DataSource"("engineApiKey");

-- CreateIndex
CREATE UNIQUE INDEX "DataSource_url_key" ON "public"."DataSource"("url");

-- CreateIndex
CREATE UNIQUE INDEX "DataSourceEntity_dataSourceId_name_key" ON "public"."DataSourceEntity"("dataSourceId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "DataSourceField_entityId_name_key" ON "public"."DataSourceField"("entityId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "DataSourceValue_dataId_fieldId_key" ON "public"."DataSourceValue"("dataId", "fieldId");

-- CreateIndex
CREATE UNIQUE INDEX "DataSourceForeignKey_entityId_refEntityId_key" ON "public"."DataSourceForeignKey"("entityId", "refEntityId");

-- CreateIndex
CREATE UNIQUE INDEX "DataSourceForeignKeyField_foreignKeyId_fieldId_refFieldId_key" ON "public"."DataSourceForeignKeyField"("foreignKeyId", "fieldId", "refFieldId");

-- AddForeignKey
ALTER TABLE "public"."DataSourceEntity" ADD CONSTRAINT "DataSourceEntity_dataSourceId_fkey" FOREIGN KEY ("dataSourceId") REFERENCES "public"."DataSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DataSourceField" ADD CONSTRAINT "DataSourceField_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "public"."DataSourceEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DataSourceData" ADD CONSTRAINT "DataSourceData_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "public"."DataSourceEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DataSourceValue" ADD CONSTRAINT "DataSourceValue_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "public"."DataSourceField"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DataSourceValue" ADD CONSTRAINT "DataSourceValue_dataId_fkey" FOREIGN KEY ("dataId") REFERENCES "public"."DataSourceData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DataSourceForeignKey" ADD CONSTRAINT "DataSourceForeignKey_refEntityId_fkey" FOREIGN KEY ("refEntityId") REFERENCES "public"."DataSourceEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DataSourceForeignKey" ADD CONSTRAINT "DataSourceForeignKey_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "public"."DataSourceEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DataSourceForeignKeyField" ADD CONSTRAINT "DataSourceForeignKeyField_refFieldId_fkey" FOREIGN KEY ("refFieldId") REFERENCES "public"."DataSourceField"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DataSourceForeignKeyField" ADD CONSTRAINT "DataSourceForeignKeyField_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "public"."DataSourceField"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DataSourceForeignKeyField" ADD CONSTRAINT "DataSourceForeignKeyField_foreignKeyId_fkey" FOREIGN KEY ("foreignKeyId") REFERENCES "public"."DataSourceForeignKey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DataSourcePullData" ADD CONSTRAINT "DataSourcePullData_dataSourcePullId_fkey" FOREIGN KEY ("dataSourcePullId") REFERENCES "public"."DataSourcePull"("id") ON DELETE CASCADE ON UPDATE CASCADE;
