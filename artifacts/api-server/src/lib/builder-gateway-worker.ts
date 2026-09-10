import { runBuilderGatewayTick } from "./builder-gateway";
import { logger } from "./logger";

let timer: NodeJS.Timeout | null = null;
let running = false;

export function startBuilderGatewayWorker(): void {
  if (timer || process.env.NODE_ENV === "test") return;
  const tick = async () => {
    if (running) return;
    running = true;
    try {
      await runBuilderGatewayTick();
    } catch (error) {
      logger.error({ err: error }, "Builder Gateway worker tick failed");
    } finally {
      running = false;
    }
  };
  void tick();
  timer = setInterval(() => void tick(), 2_000);
  timer.unref?.();
}
