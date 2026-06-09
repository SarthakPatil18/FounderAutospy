import { Router } from "express";
import { db } from "@workspace/db";

const router = Router();

router.get("/insights/summary", async (req, res) => {
  try {
    const total = await db.startup.count();

    const industries = await db.startup.findMany({
      select: { industry: true },
    });

    const uniqueIndustries = new Set(industries.map((i) => i.industry.toLowerCase()));

    const all = await db.startup.findMany({
      select: { aiTags: true },
    });

    const tagCounts: Record<string, number> = {};
    for (const row of all) {
      const tags = parseJsonField(row.aiTags);
      for (const tag of tags) {
        tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
      }
    }

    const topFailureCause =
      Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ??
      "PMF mismatch";

    res.json({
      totalPostmortems: total,
      totalIndustries: uniqueIndustries.size,
      topFailureCause,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get insights summary");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/insights/failure-reasons", async (req, res) => {
  try {
    const all = await db.startup.findMany({
      select: { aiTags: true },
    });

    const tagCounts: Record<string, number> = {};
    for (const row of all) {
      const tags = parseJsonField(row.aiTags);
      for (const tag of tags) {
        tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
      }
    }

    const result = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([reason, count]) => ({ reason, count }));

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to get failure reasons");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/insights/industries", async (req, res) => {
  try {
    const rows = await db.startup.groupBy({
      by: ["industry"],
      _count: {
        _all: true,
      },
      orderBy: {
        _count: {
          industry: "desc",
        },
      },
    });

    res.json(
      rows.map((r) => ({
        industry: r.industry,
        count: r._count._all,
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to get industry distribution");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/insights/failures-by-year", async (req, res) => {
  try {
    const rows = await db.startup.groupBy({
      by: ["closedYear"],
      _count: {
        _all: true,
      },
      orderBy: {
        closedYear: "asc",
      },
    });

    res.json(
      rows.map((r) => ({
        year: r.closedYear,
        count: r._count._all,
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to get failures by year");
    res.status(500).json({ error: "Internal server error" });
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

export default router;
