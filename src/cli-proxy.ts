import fs from "node:fs";

import { serve } from "./server/index.js";
import {
  defaultDaemonPaths,
  ensureDaemonDir,
  isRunning,
  readPid,
  removePid,
  writePid,
} from "./cli-proxy-daemon.js";

export async function startProxy(configPath: string) {
  const { cfg } = await serve(configPath);
  // eslint-disable-next-line no-console
  console.log(`localbydefault proxy listening on http://localhost:${cfg.port}`);
  // keep alive
  await new Promise(() => {});
}

export async function startProxyDaemon(configPath: string) {
  const paths = defaultDaemonPaths();
  ensureDaemonDir(paths.dir);

  const existing = readPid(paths.pidfile);
  if (existing && isRunning(existing)) {
    throw new Error(`proxy already running (pid ${existing})`);
  }

  const log = fs.openSync(paths.logfile, "a");
  const { spawn } = await import("node:child_process");

  // Re-invoke the same CLI entrypoint with `proxy`.
  const child = spawn(process.execPath, [process.argv[1]!, "proxy", configPath], {
    detached: true,
    stdio: ["ignore", log, log],
    env: process.env,
  });
  child.unref();

  if (child.pid === undefined) {
    throw new Error("failed to spawn proxy daemon (no pid)");
  }

  writePid(paths.pidfile, child.pid);
  return { pid: child.pid, pidfile: paths.pidfile, logfile: paths.logfile };
}

export async function proxyStatus() {
  const paths = defaultDaemonPaths();
  const pid = readPid(paths.pidfile);
  if (!pid) return { running: false, pid: null, pidfile: paths.pidfile, logfile: paths.logfile };
  return { running: isRunning(pid), pid, pidfile: paths.pidfile, logfile: paths.logfile };
}

export async function proxyStop() {
  const paths = defaultDaemonPaths();
  const pid = readPid(paths.pidfile);
  if (!pid) return { stopped: true, alreadyStopped: true };
  try {
    process.kill(pid, "SIGTERM");
  } catch {
    // ignore
  }
  removePid(paths.pidfile);
  return { stopped: true, pid };
}
