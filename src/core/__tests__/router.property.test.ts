import { describe, it } from "vitest";
import { Router } from "../router.js";
import fc from "fast-check";

describe("Router Property Tests", () => {
  it("always returns a valid decision", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.boolean(),
        (prompt: string, useFastHint: boolean) => {
          const router = new Router({
            providers: ["ollama"],
            policy: "local-first",
          });

          const decision = router.route({
            prompt,
            modality: "text",
            hints: useFastHint ? { quality: "fast" } : undefined,
          });

          // Should always return valid provider and model
          if (decision.provider === "ollama") {
            expect(decision.modelId).toBeTruthy();
            expect(decision.reason).toBeTruthy();
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  it("fast hint always results in fast reason", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1 }), (prompt: string) => {
        const router = new Router({
          providers: ["ollama"],
          policy: "local-first",
        });

        const decision = router.route({
          prompt,
          modality: "text",
          hints: { quality: "fast" },
        });

        expect(decision.reason.toLowerCase()).toContain("fast");
      }),
      { numRuns: 20 }
    );
  });

  it("alternatives never include selected model", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1 }), (prompt: string) => {
        const router = new Router({
          providers: ["ollama"],
          policy: "local-first",
        });

        const decision = router.route({ prompt, modality: "text" });

        for (const alt of decision.alternatives) {
          expect(alt.modelId).not.toBe(decision.modelId);
        }
      }),
      { numRuns: 20 }
    );
  });
});
