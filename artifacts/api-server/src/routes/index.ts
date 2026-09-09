import { Router, type IRouter } from "express";
import authRouter from "./auth";
import healthRouter from "./health";
import opportunitiesRouter from "./opportunities";
import evidenceRouter from "./evidence";
import evidenceWorkersRouter from "./evidence-workers";
import policyChecksRouter from "./policy-checks";
import demandChecksRouter from "./demand-checks";
import researchRouter from "./research";
import candidateResearchHandoffRouter from "./candidate-research-handoff";
import discoveryRouter from "./discovery";
import { requireMoneyScoutAccess } from "../middlewares/authorizationMiddleware";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(requireMoneyScoutAccess);
router.use(opportunitiesRouter);
router.use(evidenceRouter);
router.use(evidenceWorkersRouter);
router.use(policyChecksRouter);
router.use(demandChecksRouter);
router.use(researchRouter);
router.use(candidateResearchHandoffRouter);
router.use(discoveryRouter);

export default router;
