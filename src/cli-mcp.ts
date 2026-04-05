import { createServer } from "net";

export interface McpConfig {
  socketPath?: string;
}

export async function startMcpServer(config: McpConfig = {}): Promise<void> {
  const socketPath = config.socketPath ?? "/tmp/localbydefault-mcp.sock";

  const server = createServer((socket) => {
    let buffer = "";

    socket.on("data", async (data) => {
      buffer += data.toString();

      // Process complete JSON-RPC messages
      const messages = buffer.split("\n").filter((m) => m.trim());
      buffer = "";

      for (const msgStr of messages) {
        try {
          const msg = JSON.parse(msgStr);

          if (msg.method === "initialize") {
            socket.write(
              JSON.stringify({
                jsonrpc: "2.0",
                id: msg.id,
                result: {
                  protocolVersion: "2024-11-05",
                  capabilities: {
                    tools: true,
                    resources: true,
                  },
                  serverInfo: {
                    name: "localbydefault",
                    version: "0.5.0",
                  },
                },
              }) + "\n"
            );
          } else if (msg.method === "tools/list") {
            socket.write(
              JSON.stringify({
                jsonrpc: "2.0",
                id: msg.id,
                result: {
                  tools: [
                    {
                      name: "route",
                      description: "Get routing decision for a prompt",
                      inputSchema: {
                        type: "object",
                        properties: {
                          prompt: { type: "string", description: "The prompt to route" },
                          modality: {
                            type: "string",
                            enum: ["text", "vision"],
                            description: "Task modality",
                          },
                          quality: {
                            type: "string",
                            enum: ["fast", "balanced", "best"],
                            description: "Quality hint",
                          },
                        },
                        required: ["prompt"],
                      },
                    },
                    {
                      name: "execute",
                      description: "Route and execute a prompt",
                      inputSchema: {
                        type: "object",
                        properties: {
                          prompt: { type: "string", description: "The prompt to execute" },
                          modality: { type: "string", enum: ["text", "vision"] },
                          quality: { type: "string", enum: ["fast", "balanced", "best"] },
                        },
                        required: ["prompt"],
                      },
                    },
                    {
                      name: "health",
                      description: "Check provider health",
                      inputSchema: { type: "object", properties: {} },
                    },
                    {
                      name: "list_providers",
                      description: "List available providers",
                      inputSchema: { type: "object", properties: {} },
                    },
                  ],
                },
              }) + "\n"
            );
          } else if (msg.method === "tools/call") {
            const { name, arguments: args } = msg.params;
            const { createOrchestrator } = await import("./core/orchestrator.js");

            const orchestrator = createOrchestrator();

            if (name === "route") {
              const task = {
                prompt: args.prompt,
                modality: args.modality ?? "text",
                hints: args.quality ? { quality: args.quality } : undefined,
              };
              const decision = await orchestrator.route(task);
              socket.write(
                JSON.stringify({
                  jsonrpc: "2.0",
                  id: msg.id,
                  result: {
                    content: [
                      {
                        type: "text",
                        text: JSON.stringify(decision, null, 2),
                      },
                    ],
                  },
                }) + "\n"
              );
            } else if (name === "execute") {
              const task = {
                prompt: args.prompt,
                modality: args.modality ?? "text",
                hints: args.quality ? { quality: args.quality } : undefined,
              };
              const result = await orchestrator.execute(task);
              socket.write(
                JSON.stringify({
                  jsonrpc: "2.0",
                  id: msg.id,
                  result: {
                    content: [
                      {
                        type: "text",
                        text: result.response,
                      },
                    ],
                  },
                }) + "\n"
              );
            } else if (name === "health") {
              const statuses = await orchestrator.healthCheck();
              socket.write(
                JSON.stringify({
                  jsonrpc: "2.0",
                  id: msg.id,
                  result: {
                    content: [
                      {
                        type: "text",
                        text: JSON.stringify(statuses, null, 2),
                      },
                    ],
                  },
                }) + "\n"
              );
            } else if (name === "list_providers") {
              const providers = orchestrator.listProviders();
              socket.write(
                JSON.stringify({
                  jsonrpc: "2.0",
                  id: msg.id,
                  result: {
                    content: [
                      {
                        type: "text",
                        text: JSON.stringify(providers, null, 2),
                      },
                    ],
                  },
                }) + "\n"
              );
            }
          }
        } catch (error) {
          console.error("MCP error:", error);
        }
      }
    });

    socket.on("error", (err) => {
      console.error("Socket error:", err.message);
    });
  });

  server.listen(socketPath, () => {
    console.log(`🔌 localbydefault MCP server listening on ${socketPath}`);
    console.log("");
    console.log("Tools available:");
    console.log("  route          - Get routing decision");
    console.log("  execute        - Route and execute");
    console.log("  health         - Check providers");
    console.log("  list_providers - List providers");
  });

  server.on("error", (err) => {
    console.error("MCP server error:", err.message);
    process.exit(1);
  });
}
