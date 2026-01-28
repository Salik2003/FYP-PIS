-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "DataSource" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "engineApiKey" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "message" TEXT,
    "order" INTEGER NOT NULL DEFAULT 99999
);

-- CreateTable
CREATE TABLE "DataSourceEntity" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "dataSourceId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 99999,
    CONSTRAINT "DataSourceEntity_dataSourceId_fkey" FOREIGN KEY ("dataSourceId") REFERENCES "DataSource" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DataSourceField" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "entityId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "primary" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 99999,
    CONSTRAINT "DataSourceField_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "DataSourceEntity" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DataSourceData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "entityId" INTEGER NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "updatedBy" TEXT,
    CONSTRAINT "DataSourceData_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "DataSourceEntity" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DataSourceValue" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "dataId" INTEGER NOT NULL,
    "fieldId" INTEGER NOT NULL,
    "value" TEXT,
    "active" BOOLEAN NOT NULL,
    "updatedBy" TEXT,
    CONSTRAINT "DataSourceValue_dataId_fkey" FOREIGN KEY ("dataId") REFERENCES "DataSourceData" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DataSourceValue_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "DataSourceField" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DataSourceForeignKey" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "entityId" INTEGER NOT NULL,
    "refEntityId" INTEGER NOT NULL,
    CONSTRAINT "DataSourceForeignKey_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "DataSourceEntity" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DataSourceForeignKey_refEntityId_fkey" FOREIGN KEY ("refEntityId") REFERENCES "DataSourceEntity" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DataSourceForeignKeyField" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "foreignKeyId" INTEGER NOT NULL,
    "fieldId" INTEGER NOT NULL,
    "refFieldId" INTEGER NOT NULL,
    CONSTRAINT "DataSourceForeignKeyField_foreignKeyId_fkey" FOREIGN KEY ("foreignKeyId") REFERENCES "DataSourceForeignKey" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DataSourceForeignKeyField_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "DataSourceField" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DataSourceForeignKeyField_refFieldId_fkey" FOREIGN KEY ("refFieldId") REFERENCES "DataSourceField" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DataSourcePull" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" INTEGER NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "pulledCount" INTEGER NOT NULL DEFAULT 0,
    "submittedCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'CREATED'
);

-- CreateTable
CREATE TABLE "DataSourcePullData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "dataSourcePullId" INTEGER NOT NULL,
    "data" JSONB,
    CONSTRAINT "DataSourcePullData_dataSourcePullId_fkey" FOREIGN KEY ("dataSourcePullId") REFERENCES "DataSourcePull" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "DataSource_name_key" ON "DataSource"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DataSource_apiKey_key" ON "DataSource"("apiKey");

-- CreateIndex
CREATE UNIQUE INDEX "DataSource_engineApiKey_key" ON "DataSource"("engineApiKey");

-- CreateIndex
CREATE UNIQUE INDEX "DataSource_url_key" ON "DataSource"("url");

-- CreateIndex
CREATE UNIQUE INDEX "DataSourceEntity_dataSourceId_name_key" ON "DataSourceEntity"("dataSourceId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "DataSourceField_entityId_name_key" ON "DataSourceField"("entityId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "DataSourceValue_dataId_fieldId_key" ON "DataSourceValue"("dataId", "fieldId");

-- CreateIndex
CREATE UNIQUE INDEX "DataSourceForeignKey_entityId_refEntityId_key" ON "DataSourceForeignKey"("entityId", "refEntityId");

-- CreateIndex
CREATE UNIQUE INDEX "DataSourceForeignKeyField_foreignKeyId_fieldId_refFieldId_key" ON "DataSourceForeignKeyField"("foreignKeyId", "fieldId", "refFieldId");
