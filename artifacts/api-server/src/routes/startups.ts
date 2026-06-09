import { Router } from "express";
import { db } from "@workspace/db";
import { logger } from "../lib/logger";
import { runAutopsy } from "../lib/gemini";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/startups", async (req: any, res: any): Promise<void> => {
  try {
    const { search, industry, failureCause, year, limit = "20", offset = "0" } =
      req.query as Record<string, string>;

    const limitNum = Math.min(parseInt(limit) || 20, 100);
    const offsetNum = parseInt(offset) || 0;

    // Build conditions for Prisma
    const conditions: any[] = [];

    if (search) {
      conditions.push({
        OR: [
          { name: { contains: search } },
          { tagline: { contains: search } },
        ],
      });
    }

    if (industry) {
      conditions.push({
        industry: { contains: industry },
      });
    }

    if (year) {
      conditions.push({
        closedYear: parseInt(year),
      });
    }

    const whereClause = conditions.length > 0 ? { AND: conditions } : {};

    let startups = await db.startup.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: limitNum,
      skip: offsetNum,
    });

    if (failureCause) {
      startups = startups.filter((s) => {
        const tags = parseJsonField(s.aiTags);
        return tags.some((tag) =>
          tag.toLowerCase().includes(failureCause.toLowerCase())
        );
      });
    }

    const total = await db.startup.count({
      where: whereClause,
    });

    res.json({
      startups: startups.map(mapStartup),
      total,
    });
    return;
  } catch (err) {
    req.log.error({ err }, "Failed to list startups");
    res.status(500).json({ error: "Internal server error" });
    return;
  }
});

router.post("/startups", requireAuth, async (req: any, res: any): Promise<void> => {
  try {
    const {
      name, tagline, industry, foundedYear, closedYear,
      story, whatFailed, lessonsLearned,
      peakMrr, teamSize, totalRaised,
    } = req.body;

    if (!name || !tagline || !industry || !foundedYear || !closedYear || !story || !whatFailed || !lessonsLearned) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const submittedBy = req.auth.userId;

    const startup = await db.startup.create({
      data: {
        name,
        tagline,
        industry,
        foundedYear: parseInt(foundedYear),
        closedYear: parseInt(closedYear),
        story,
        whatFailed,
        lessonsLearned,
        peakMrr: peakMrr ? parseInt(peakMrr) : null,
        teamSize: teamSize ? parseInt(teamSize) : null,
        totalRaised: totalRaised ? parseInt(totalRaised) : null,
        submittedBy,
      },
    });

    res.status(201).json(mapStartup(startup));

    // Run AI autopsy async after responding
    runAutopsy(name, story, whatFailed, lessonsLearned)
      .then(async (result) => {
        if (!result) return;
        await db.startup.update({
          where: { id: startup.id },
          data: {
            aiRootCause: result.rootCause,
            aiFactors: result.factors,
            aiTags: result.tags,
            aiVerdict: result.verdict,
          },
        });
        logger.info({ id: startup.id }, "Autopsy complete");
      })
      .catch((err) => logger.error({ err }, "Autopsy failed"));
    return;
  } catch (err) {
    req.log.error({ err }, "Failed to create startup");
    res.status(500).json({ error: "Internal server error" });
    return;
  }
});

router.get("/startups/:id", async (req: any, res: any): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const startup = await db.startup.findUnique({
      where: { id },
    });

    if (!startup) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    res.json(mapStartup(startup));
    return;
  } catch (err) {
    req.log.error({ err }, "Failed to get startup");
    res.status(500).json({ error: "Internal server error" });
    return;
  }
});

router.get("/startups/:id/similar", async (req: any, res: any): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const startup = await db.startup.findUnique({
      where: { id },
    });

    if (!startup) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    const tags = parseJsonField(startup.aiTags);
    const industry = startup.industry;

    const similar = await db.startup.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Score by shared tags and industry
    const scored = similar
      .filter((s) => s.id !== id)
      .map((s) => {
        const sTags = parseJsonField(s.aiTags);
        const sharedTags = sTags.filter((t) => tags.includes(t));
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
    return;
  } catch (err) {
    req.log.error({ err }, "Failed to get similar startups");
    res.status(500).json({ error: "Internal server error" });
    return;
  }
});

function parseJsonField(val: any): string[] {
  if (!val) return [];
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return Array.isArray(val) ? (val as string[]) : [];
}

function mapStartup(s: any) {
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
    aiFactors: parseJsonField(s.aiFactors),
    aiTags: parseJsonField(s.aiTags),
    aiVerdict: s.aiVerdict ?? null,
    submittedBy: s.submittedBy ?? null,
    createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : s.createdAt,
  };
}

export default router;
