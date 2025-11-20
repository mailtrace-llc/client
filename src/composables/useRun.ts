// src/composables/useRun.ts
import { nextTick, ref } from "vue";
import { useLoader } from "@/stores/loader";
import {
  getRunStatus,
  startRun,
  type RunStatus,
  type StartRunResponse,
} from "@/api/runs";

type WireStatus = NonNullable<RunStatus["status"]>;

export type BackendRunError = {
  kind: "backend";
  status?: number;
  data?: any;
  message?: string;
};

/**
 * Normalize anything thrown by our API layer (which uses http.ts)
 * or our own explicit throws into a BackendRunError.
 *
 * http.ts guarantees axios errors are turned into:
 *   Error & { status?: number; data?: any }
 */
function toBackendError(e: any): BackendRunError {
  if (e && typeof e === "object" && (e as any).kind === "backend") {
    return e as BackendRunError;
  }

  const status = (e as any).status;
  const data = (e as any).data;
  const message = e?.message;

  return {
    kind: "backend",
    status: typeof status === "number" ? status : status,
    data,
    message,
  };
}

export function useRun() {
  const loader = useLoader();
  const running = ref(false);

  async function kickOffAndPoll(
    runId: string,
    onNeedsMapping: (missing: Record<string, string[]>) => void
  ) {
    running.value = true;

    loader.show({ progress: 3, message: "Starting…" });
    await nextTick();

    let started = false;

    try {
      console.debug("[run] ▶ START", { runId });
      const res: StartRunResponse = await startRun(runId);
      console.debug("[run] startRun ⇦", res);

      // 1) Backend says we need mapping before we can proceed
      if (res.kind === "needs-mapping") {
        console.debug(
          "[run] needs-mapping → handoff to mapper (hide loader)"
        );
        loader.hide(true);
        running.value = false;
        onNeedsMapping(res.missing);
        return;
      }

      // 2) Backend startRun error (may be 4xx/5xx, including 402)
      if (res.kind === "error") {
        console.error("[run] startRun error", res);
        throw toBackendError({
          status: res.status,
          data: res,
          message: res.message ?? "Run failed to start",
        });
      }

      // 3) startRun OK → begin polling
      started = true;
      loader.setMessage("Analyzing…");

      console.debug("[run] polling status…");
      for (let i = 0; i < 240; i++) {
        const s: RunStatus = await getRunStatus(runId);
        console.debug("[run] status tick", s);

        if (typeof s.pct === "number") {
          loader.setProgress(Math.max(0, Math.min(100, s.pct)));
        }

        if (s.step || s.message) {
          loader.setMessage(String(s.step || s.message));
        }

        const status = (s.status || "").toLowerCase() as WireStatus;
        const step = (s.step || "").toLowerCase();

        if (status === "failed" || step === "failed") {
          throw toBackendError({
            status: 500,
            data: s,
            message: s.message ?? "Matching failed",
          });
        }

        if (status === "done" || step === "done" || s.pct === 100) {
          break;
        }

        await new Promise((r) => setTimeout(r, 1000));
      }

      loader.setProgress(100);
      loader.setMessage("Run complete");
      window.dispatchEvent(
        new CustomEvent("mt:run-completed", { detail: { run_id: runId } })
      );
      console.debug("[run] ✓ COMPLETED");
    } catch (e: any) {
      const backendErr = toBackendError(e);
      console.error("[run] ✗ FAILED", backendErr);

      loader.setProgress(100);
      loader.setMessage(
        backendErr.message || e?.message || "Run failed"
      );

      // IMPORTANT: rethrow so UploadCard can open paywalls based on
      // backendErr.status + backendErr.data.error
      throw backendErr;
    } finally {
      running.value = false;
      console.debug(
        "[run] ⎋ cleanup: running=false; started=%s (loader left open)",
        started
      );
    }
  }

  return { running, kickOffAndPoll };
}