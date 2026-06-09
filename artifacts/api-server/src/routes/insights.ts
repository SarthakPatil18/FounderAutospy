import { Router } from "express";
import { db, startupsTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const router = Router();

router.get("/insights/summary", async (req, res) => {
  try {
    const [countRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(startupsTable);

    const total = Number(countRow?.count ?? 0);

    const industries = await db
      .select({ industry: startupsTable.industry })
      .from(startupsTable);

    const uniqueIndustries = new Set(industries.map((i) => i.industry.toLowerCase()));

    const all = await db.select({ aiTags: startupsTable.aiTags }).from(startupsTable);
    const tagCounts: Record<string, number> = {};
    for (const row of all) {
      for (const tag of row.aiTags ?? []) {
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
    const all = await db.select({ aiTags: startupsTable.aiTags }).from(startupsTable);
    const tagCounts: Record<string, number> = {};
    for (const row of all) {
      for (const tag of row.aiTags ?? []) {
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
    const rows = await db
      .select({
        industry: startupsTable.industry,
        count: sql<number>`count(*)`,
      })
      .from(startupsTable)
      .groupBy(startupsTable.industry)
      .orderBy(sql`count(*) DESC`);

    res.json(rows.map((r) => ({ industry: r.industry, count: Number(r.count) })));
  } catch (err) {
    req.log.error({ err }, "Failed to get industry distribution");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/insights/failures-by-year", async (req, res) => {
  try {
    const rows = await db
      .select({
        year: startupsTable.closedYear,
        count: sql<number>`count(*)`,
      })
      .from(startupsTable)
      .groupBy(startupsTable.closedYear)
      .orderBy(startupsTable.closedYear);

    res.json(rows.map((r) => ({ year: r.year, count: Number(r.count) })));
  } catch (err) {
    req.log.error({ err }, "Failed to get failures by year");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
