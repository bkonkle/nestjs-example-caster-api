-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL DEFAULT ulid_generate(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "text" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "episodeId" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Message" ADD FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD FOREIGN KEY ("episodeId") REFERENCES "Episode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TRIGGER sync_message_updated_at BEFORE UPDATE ON "Message" FOR EACH ROW EXECUTE PROCEDURE sync_updated_at();
