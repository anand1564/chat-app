-- Every room receives a non-guessable invite token. New tokens are generated
-- by the application; this backfill preserves rooms created before this change.
ALTER TABLE "Room" ADD COLUMN "inviteCode" TEXT;

UPDATE "Room"
SET "inviteCode" = md5(random()::text || clock_timestamp()::text || "id"::text)
WHERE "inviteCode" IS NULL;

ALTER TABLE "Room" ALTER COLUMN "inviteCode" SET NOT NULL;
CREATE UNIQUE INDEX "Room_inviteCode_key" ON "Room"("inviteCode");
