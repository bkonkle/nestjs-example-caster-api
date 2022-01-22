-- CreateTable
CREATE TABLE "Show" (
    "id" TEXT NOT NULL DEFAULT ulid_generate(),
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "picture" TEXT,
    "content" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

CREATE TRIGGER sync_show_updated_at BEFORE UPDATE ON "Show" FOR EACH ROW EXECUTE PROCEDURE sync_updated_at();
