-- CreateTable
CREATE TABLE "Show" (
    "id" TEXT NOT NULL DEFAULT ulid_generate(),
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "picture" TEXT,
    "content" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);
