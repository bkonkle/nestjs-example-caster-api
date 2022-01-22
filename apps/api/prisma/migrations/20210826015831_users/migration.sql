-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL DEFAULT ulid_generate(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "username" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL DEFAULT ulid_generate(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "displayName" TEXT,
    "picture" TEXT,
    "content" JSONB,
    "city" TEXT,
    "stateProvince" TEXT,
    "userId" TEXT,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User.username_unique" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Profile.userId_unique" ON "Profile"("userId");

-- AddForeignKey
ALTER TABLE "Profile" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TRIGGER sync_user_updated_at BEFORE UPDATE ON "User" FOR EACH ROW EXECUTE PROCEDURE sync_updated_at();

CREATE TRIGGER sync_profile_updated_at BEFORE UPDATE ON "Profile" FOR EACH ROW EXECUTE PROCEDURE sync_updated_at();
