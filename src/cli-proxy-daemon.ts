import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export interface DaemonPaths {
  dir: string;
  pidfile: string;
  logfile: string;
}

export function defaultDaemonPaths(): DaemonPaths {
  const dir = path.join(os.homedir(), ".localbydefault");
  return {
    dir,
    pidfile: path.join(dir, "proxy.pid"),
    logfile: path.join(dir, "proxy.log"),
  };
}

export function ensureDaemonDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

export function readPid(pidfile: string): number | null {
  try {
    const raw = fs.readFileSync(pidfile, "utf8").trim();
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

export function isRunning(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

export function writePid(pidfile: string, pid: number) {
  fs.writeFileSync(pidfile, String(pid), { encoding: "utf8" });
}

export function removePid(pidfile: string) {
  try {
    fs.unlinkSync(pidfile);
  } catch {
    // ignore
  }
}
