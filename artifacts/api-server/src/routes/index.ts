import { Router, type IRouter } from "express";
import authRouter from "./auth";
import healthRouter from "./health";
import opportunitiesRouter from "./opportunities";
import evidenceRouter from "./evidence";
import evidenceWorkersRouter from "./evidence-workers";
import validationEvidenceRouter from "./validation-evidence";
import validationAssessmentsRouter from "./validation-assessments";
import validationRouter from "./validation";
import experimentPlansRouter from "./experiment-plans";
import experimentExecutionRouter from "./experiment-execution";
import policyChecksRouter from "./policy-checks";
import demandChecksRouter from "./demand-checks";
import researchRouter from "./research";
import runTimelineRouter from "./run-timeline";
import candidateResearchHandoffRouter from "./candidate-research-handoff";
import commercialBuildRouter from "./commercial-build";
import monetizationPlanRouter from "./monetization-plan";
import discoveryRouter from "./discovery";
import { requireMoneyScoutAccess } from "../middlewares/authorizationMiddleware";
import { requireSafePaidResearchRuntime } from "../middlewares/paidResearchSafetyMiddleware";
import { registerApifyExperimentAdapters } from "../lib/apify-experiment-adapters";

registerApifyExperimentAdapters();

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(requireMoneyScoutAccess);
router.use(requireSafePaidResearchRuntime);
router.use(opportunitiesRouter);
router.use(evidenceRouter);
router.use(evidenceWorkersRouter);
router.use(validationEvidenceRouter);
router.use(validationAssessmentsRouter);
router.use(validationRouter);
router.use(experimentPlansRouter);
router.use(experimentExecutionRouter);
router.use(policyChecksRouter);
router.use(demandChecksRouter);
router.use(researchRouter);
router.use(runTimelineRouter);
router.use(candidateResearchHandoffRouter);
router.use(commercialBuildRouter);
router.use(monetizationPlanRouter);
router.use(discoveryRouter);

export default router;
