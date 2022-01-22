-- CreateTable
CREATE TABLE "RoleGrant" (
    "id" TEXT NOT NULL DEFAULT ulid_generate(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "roleKey" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "subjectTable" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RoleGrant" ADD FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TRIGGER sync_role_grant_updated_at BEFORE UPDATE ON "RoleGrant" FOR EACH ROW EXECUTE PROCEDURE sync_updated_at();
