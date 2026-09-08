import { Router, type IRouter } from "express";
import healthRouter from "./health";
import opportunitiesRouter from "./opportunities";
import evidenceRouter from "./evidence";
import policyChecksRouter from "./policy-checks";
import demandChecksRouter from "./demand-checks";

const router: IRouter = Router();

router.use(healthRouter);
router.use(opportunitiesRouter);
router.use(evidenceRouter);
router.use(policyChecksRouter);
router.use(demandChecksRouter);

export default router;
