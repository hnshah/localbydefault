import http from "node:http";

function postJson(url: string, body: unknown): Promise<{ status: number; text: string }> {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request(
      {
        hostname: u.hostname,
        port: u.port ? parseInt(u.port, 10) : 80,
        path: u.pathname + u.search,
        method: "POST",
        headers: { "content-type": "application/json" },
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (d) => chunks.push(Buffer.from(d)));
        res.on("end", () => {
          resolve({ status: res.statusCode ?? 0, text: Buffer.concat(chunks).toString("utf8") });
        });
      },
    );
    req.on("error", reject);
    req.end(JSON.stringify(body));
  });
}

async function getText(url: string): Promise<{ status: number; text: string }> {
  const res = await fetch(url);
  return { status: res.status, text: await res.text() };
}

export async function dogfood(opts: { baseUrl: string; localModel: string; cloudModel: string }) {
  const base = opts.baseUrl.replace(/\/$/, "");

  const localUrl = `${base}/chat/completions`;
  const cloudUrl = `${base.replace(/\/v1$/, "/v1/cloud")}/chat/completions`;

  console.log("== localbydefault dogfood ==");
  console.log("base:", base);

  console.log("\n-- local chat");
  try {
    const localResp = await postJson(localUrl, {
      model: opts.localModel,
      messages: [{ role: "user", content: "Say only: ok" }],
    });
    console.log("status:", localResp.status);
    console.log(localResp.text.slice(0, 240));
  } catch (e) {
    console.log("local request error:", e instanceof Error ? e.message : String(e));
  }

  console.log("\n-- cloud attempt");
  try {
    const cloudResp = await postJson(cloudUrl, {
      model: opts.cloudModel,
      messages: [{ role: "user", content: "Say only: ok" }],
    });
    console.log("status:", cloudResp.status);
    console.log(cloudResp.text.slice(0, 240));
  } catch (e) {
    console.log("cloud request error:", e instanceof Error ? e.message : String(e));
  }

  console.log("\n-- stats");
  try {
    const stats = await getText(`${base}/stats`);
    console.log("status:", stats.status);
    console.log(stats.text.slice(0, 800));
  } catch (e) {
    console.log("stats error:", e instanceof Error ? e.message : String(e));
  }

  console.log("\n-- recent audit");
  try {
    const audit = await getText(`${base}/audit?limit=10`);
    console.log("status:", audit.status);
    console.log(audit.text.slice(0, 1200));
  } catch (e) {
    console.log("audit error:", e instanceof Error ? e.message : String(e));
  }
}
