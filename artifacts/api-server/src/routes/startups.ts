import { Router } from "express";
import { db, startupsTable } from "@workspace/db";
import { eq, ilike, or, sql, and, inArray } from "drizzle-orm";
import { logger } from "../lib/logger";
import { runAutopsy } from "../lib/gemini";

const router = Router();

router.get("/startups", async (req, res) => {
  try {
    const { search, industry, failureCause, year, limit = "20", offset = "0" } =
      req.query as Record<string, string>;

    const limitNum = Math.min(parseInt(limit) || 20, 100);
    const offsetNum = parseInt(offset) || 0;

    const conditions = [];

    if (search) {
      conditions.push(
        or(
          ilike(startupsTable.name, `%${search}%`),
          ilike(startupsTable.tagline, `%${search}%`),
        ),
      );
    }

    if (industry) {
      conditions.push(ilike(startupsTable.industry, `%${industry}%`));
    }

    if (year) {
      conditions.push(eq(startupsTable.closedYear, parseInt(year)));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    let startups = await db
      .select()
      .from(startupsTable)
      .where(whereClause)
      .orderBy(sql`${startupsTable.createdAt} DESC`)
      .limit(limitNum)
      .offset(offsetNum);

    if (failureCause) {
      startups = startups.filter((s) =>
        s.aiTags?.some((tag) =>
          tag.toLowerCase().includes(failureCause.toLowerCase()),
        ),
      );
    }

    const total = await db
      .select({ count: sql<number>`count(*)` })
      .from(startupsTable)
      .where(whereClause);

    res.json({
      startups: startups.map(mapStartup),
      total: Number(total[0]?.count ?? 0),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to list startups");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/startups", async (req, res) => {
  try {
    const {
      name, tagline, industry, foundedYear, closedYear,
      story, whatFailed, lessonsLearned,
      peakMrr, teamSize, totalRaised,
    } = req.body;

    if (!name || !tagline || !industry || !foundedYear || !closedYear || !story || !whatFailed || !lessonsLearned) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const submittedBy = (req as any).auth?.userId ? 1 : undefined;

    const [startup] = await db
      .insert(startupsTable)
      .values({
        name,
        tagline,
        industry,
        foundedYear: parseInt(foundedYear),
        closedYear: parseInt(closedYear),
        story,
        whatFailed,
        lessonsLearned,
        peakMrr: peakMrr ? parseInt(peakMrr) : undefined,
        teamSize: teamSize ? parseInt(teamSize) : undefined,
        totalRaised: totalRaised ? parseInt(totalRaised) : undefined,
        submittedBy,
      })
      .returning();

    res.status(201).json(mapStartup(startup));

    // Run AI autopsy async after responding
    runAutopsy(name, story, whatFailed, lessonsLearned)
      .then(async (result) => {
        if (!result) return;
        await db
          .update(startupsTable)
          .set({
            aiRootCause: result.rootCause,
            aiFactors: result.factors,
            aiTags: result.tags,
            aiVerdict: result.verdict,
          })
          .where(eq(startupsTable.id, startup.id));
        logger.info({ id: startup.id }, "Autopsy complete");
      })
      .catch((err) => logger.error({ err }, "Autopsy failed"));
  } catch (err) {
    req.log.error({ err }, "Failed to create startup");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/startups/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    const [startup] = await db
      .select()
      .from(startupsTable)
      .where(eq(startupsTable.id, id));

    if (!startup) return res.status(404).json({ error: "Not found" });

    res.json(mapStartup(startup));
  } catch (err) {
    req.log.error({ err }, "Failed to get startup");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/startups/:id/similar", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    const [startup] = await db
      .select()
      .from(startupsTable)
      .where(eq(startupsTable.id, id));

    if (!startup) return res.status(404).json({ error: "Not found" });

    const tags = startup.aiTags ?? [];
    const industry = startup.industry;

    let similar = await db
      .select()
      .from(startupsTable)
      .orderBy(sql`${startupsTable.createdAt} DESC`)
      .limit(50);

    // Score by shared tags and industry
    const scored = similar
      .filter((s) => s.id !== id)
      .map((s) => {
        const sharedTags = (s.aiTags ?? []).filter((t) => tags.includes(t));
        const sameIndustry = s.industry.toLowerCase() === industry.toLowerCase();
        return { startup: s, score: sharedTags.length * 2 + (sameIndustry ? 1 : 0) };
      })
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    // If not enough tag-matched, fill with other startups
    if (scored.length < 3) {
      const existingIds = new Set([id, ...scored.map((s) => s.startup.id)]);
      const extras = similar
        .filter((s) => !existingIds.has(s.id))
        .slice(0, 3 - scored.length)
        .map((s) => ({ startup: s, score: 0 }));
      scored.push(...extras);
    }

    res.json({
      startups: scored.map((s) => mapStartup(s.startup)),
      total: scored.length,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get similar startups");
    res.status(500).json({ error: "Internal server error" });
  }
});

function mapStartup(s: typeof startupsTable.$inferSelect) {
  return {
    id: s.id,
    name: s.name,
    tagline: s.tagline,
    industry: s.industry,
    foundedYear: s.foundedYear,
    closedYear: s.closedYear,
    story: s.story,
    whatFailed: s.whatFailed,
    lessonsLearned: s.lessonsLearned,
    peakMrr: s.peakMrr ?? null,
    teamSize: s.teamSize ?? null,
    totalRaised: s.totalRaised ?? null,
    aiRootCause: s.aiRootCause ?? null,
    aiFactors: s.aiFactors ?? null,
    aiTags: s.aiTags ?? null,
    aiVerdict: s.aiVerdict ?? null,
    submittedBy: s.submittedBy ?? null,
    createdAt: s.createdAt.toISOString(),
  };
}

export default router;
