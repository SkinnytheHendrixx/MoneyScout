import { runAssetFactoryTick } from "./asset-factory";
import { logger } from "./logger";

let timer: NodeJS.Timeout | null = null;
let running = false;

export function startAssetFactoryWorker(): void {
  if (timer || process.env.NODE_ENV === "test") return;
  const tick = async () => {
    if (running) return;
    running = true;
    try {
      await runAssetFactoryTick();
    } catch (error) {
      logger.error({ err: error }, "Asset Factory worker tick failed");
    } finally {
      running = false;
    }
  };
  void tick();
  timer = setInterval(() => void tick(), 3_000);
  timer.unref?.();
}
