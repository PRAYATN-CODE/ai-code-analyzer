import { useRef, useCallback } from "react";
import { useDispatch } from "react-redux";
import { analysisApi } from "@/api/analysisApi";
import { setJobStatus, fetchReport } from "@/store/slices/analysisSlice";
import toast from "react-hot-toast";

const POLL_INTERVAL = 4000; // 4s
const MAX_POLLS = 75;       // max 5 min

export default function useJobPoller() {
  const dispatch = useDispatch();
  const timerRef = useRef(null);
  const pollCountRef = useRef(0);

  const stopPolling = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    pollCountRef.current = 0;
  }, []);

  const startPolling = useCallback((jobId, onComplete) => {
    stopPolling();
    pollCountRef.current = 0;

    timerRef.current = setInterval(async () => {
      pollCountRef.current += 1;

      if (pollCountRef.current >= MAX_POLLS) {
        stopPolling();
        dispatch(setJobStatus("failed"));
        toast.error("Analysis timed out. Please try again.");
        return;
      }

      try {
        const res = await analysisApi.getStatus(jobId);
        const { status } = res.data.data;
        dispatch(setJobStatus(status));

        if (status === "completed") {
          stopPolling();
          await dispatch(fetchReport(jobId));
          toast.success("Analysis complete!");
          onComplete?.(jobId);
        } else if (status === "failed") {
          stopPolling();
          toast.error("Analysis failed. Please try again.");
        }
      } catch {
        // Network hiccup — keep polling
      }
    }, POLL_INTERVAL);
  }, [dispatch, stopPolling]);

  return { startPolling, stopPolling };
}
