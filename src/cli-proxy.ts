import { serve } from "./server/index.js";

export async function startProxy(configPath: string) {
  const { cfg } = await serve(configPath);
  // eslint-disable-next-line no-console
  console.log(`9ed localbydefault proxy listening on http://localhost:${cfg.port}`);
  // keep alive
  await new Promise(() => {});
}
