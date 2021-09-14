/*
  Warnings:

  - Added the required column `showId` to the `Episode` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Episode" ADD COLUMN     "showId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Episode" ADD FOREIGN KEY ("showId") REFERENCES "Show"("id") ON DELETE CASCADE ON UPDATE CASCADE;
