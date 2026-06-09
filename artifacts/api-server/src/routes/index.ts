import { Router, type IRouter } from "express";
import healthRouter from "./health";
import startupsRouter from "./startups";
import insightsRouter from "./insights";

const router: IRouter = Router();

router.use(healthRouter);
router.use(startupsRouter);
router.use(insightsRouter);

export default router;
