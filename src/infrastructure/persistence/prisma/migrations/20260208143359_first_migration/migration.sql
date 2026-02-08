-- CreateTable
CREATE TABLE "players" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weapons" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "weapons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" BIGINT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "ended_at" TIMESTAMP(3),

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kills" (
    "id" SERIAL NOT NULL,
    "match_id" BIGINT NOT NULL,
    "killer_id" INTEGER NOT NULL,
    "victim_id" INTEGER NOT NULL,
    "weapon_id" INTEGER NOT NULL,
    "killed_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kills_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "players_name_key" ON "players"("name");

-- CreateIndex
CREATE UNIQUE INDEX "weapons_name_key" ON "weapons"("name");

-- CreateIndex
CREATE UNIQUE INDEX "kills_match_id_victim_id_killed_at_key" ON "kills"("match_id", "victim_id", "killed_at");

-- AddForeignKey
ALTER TABLE "kills" ADD CONSTRAINT "kills_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kills" ADD CONSTRAINT "kills_weapon_id_fkey" FOREIGN KEY ("weapon_id") REFERENCES "weapons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kills" ADD CONSTRAINT "kills_killer_id_fkey" FOREIGN KEY ("killer_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kills" ADD CONSTRAINT "kills_victim_id_fkey" FOREIGN KEY ("victim_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
