import { Router, type IRouter } from "express";
import healthRouter from "./health";
import startupsRouter from "./startups";
import insightsRouter from "./insights";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(startupsRouter);
router.use(insightsRouter);
router.use(authRouter);

export default router;
