import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Submission, QueueItem } from "./MasterShared";

const POLL_INTERVAL_MS = 30_000; // 30 seconds

export function useMasterDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"priority" | "premium" | "inbox" | "queue">("priority");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newCount, setNewCount] = useState(0); // count of new submissions since last load
  const prevIdsRef = useRef<Set<string>>(new Set());

  // Publication queue state
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [queueLoading, setQueueLoading] = useState(false);
  const [publishModalId, setPublishModalId] = useState<string | null>(null);
  const [publishModalType, setPublishModalType] = useState<"regular" | "interview" | "article">("regular");
  const [publicationUrl, setPublicationUrl] = useState("");
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  // Review form state
  const [rating, setRating] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");
  const [selectedPlacements, setSelectedPlacements] = useState<string[]>([]);
  const [selectedPremium, setSelectedPremium] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState<"accept" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmissions = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/master/submissions");
      if (res.ok) {
        const data: Submission[] = await res.json();
        setSubmissions(data);
        // Detect new arrivals on silent polls
        if (silent && prevIdsRef.current.size > 0) {
          const incoming = data.filter((s) => !prevIdsRef.current.has(s.id));
          if (incoming.length > 0) setNewCount((prev) => prev + incoming.length);
        }
        prevIdsRef.current = new Set(data.map((s) => s.id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  const fetchQueue = useCallback(async () => {
    setQueueLoading(true);
    try {
      const res = await fetch("/api/master/publications");
      if (res.ok) setQueue(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setQueueLoading(false);
    }
  }, []);

  // Initial load + auto-poll every 30 seconds, but only when the tab is visible
  useEffect(() => {
    fetchSubmissions();
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const startPolling = () => {
      if (!intervalId) {
        intervalId = setInterval(() => fetchSubmissions(true), POLL_INTERVAL_MS);
      }
    };

    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchSubmissions(true); // immediate refresh when coming back
        startPolling();
      } else {
        stopPolling();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    startPolling();

    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchSubmissions]);

  useEffect(() => {
    if (activeTab === "queue") fetchQueue();
  }, [activeTab, fetchQueue]);

  // Track which submission id we've already pre-filled so that silent
  // poll updates (which refresh `submissions`) don't overwrite edits.
  const prefilledIdRef = useRef<string | null>(null);

  // Reset form whenever the curator picks a DIFFERENT submission
  useEffect(() => {
    if (prefilledIdRef.current === selectedId) return; // same sub, don't reset
    prefilledIdRef.current = selectedId;

    const sub = submissions.find((s) => s.id === selectedId);
    setRating(sub?.curatorRating || 0);
    setNotes(sub?.curatorNotes || "");
    setSelectedPlacements([]);
    setSelectedPremium([]);
    setError(null);
  // NOTE: intentionally omitting `submissions` so that background polls
  // don't trigger a reset while the curator is typing.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const handlePublish = async () => {
    if (!publishModalId || !publicationUrl) return;
    setPublishLoading(true);
    setPublishError(null);
    try {
      const res = await fetch(`/api/master/submissions/${publishModalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "publish", publicationUrl, publishType: publishModalType }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to publish");
      }

      setQueue((prev) =>
        prev
          .map((q) => {
            if (q.id !== publishModalId) return q;

            const updated = { ...q };
            if (publishModalType === "interview") updated.interviewUrl = publicationUrl;
            else if (publishModalType === "article") updated.articleUrl = publicationUrl;
            else updated.publicationUrl = publicationUrl;

            const regularDone = !!updated.publicationUrl;
            const interviewDone = !updated.assignedPremiumServices?.includes("INTERVIEW") || !!updated.interviewUrl;
            const articleDone = !updated.assignedPremiumServices?.includes("ARTICLE") || !!updated.articleUrl;

            return regularDone && interviewDone && articleDone ? null : updated;
          })
          .filter(Boolean) as QueueItem[]
      );

      setPublishModalId(null);
      setPublicationUrl("");
      router.refresh();
    } catch (err: any) {
      setPublishError(err.message);
    } finally {
      setPublishLoading(false);
    }
  };

  const handleAction = async (action: "accept" | "reject") => {
    const selectedSub = submissions.find((s) => s.id === selectedId);
    if (!selectedSub) return;

    if (rating === 0) {
      setError("Please provide a rating from 1 to 5 stars.");
      return;
    }

    if (selectedSub.reviewRequested && notes.trim().length < 50) {
      setError("A detailed written review (at least 50 characters) is required for this paid review submission.");
      return;
    }

    if (action === "accept" && selectedPlacements.length === 0) {
      setError("Please select at least one placement to accept.");
      return;
    }

    setActionLoading(action);
    setError(null);

    try {
      const res = await fetch(`/api/master/submissions/${selectedSub.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          notes,
          rating,
          placements: selectedPlacements,
          assignedPremiumServices: selectedPremium,
          status: action === "accept" ? "ACCEPTED" : "REJECTED",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to process action");
      }

      setSubmissions((prev) => prev.filter((s) => s.id !== selectedSub.id));
      setSelectedId(null);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return {
    activeTab,
    setActiveTab,
    submissions,
    loading,
    selectedId,
    setSelectedId,
    newCount,
    setNewCount,
    queue,
    queueLoading,
    publishModalId,
    setPublishModalId,
    publishModalType,
    setPublishModalType,
    publicationUrl,
    setPublicationUrl,
    publishLoading,
    publishError,
    setPublishError,
    rating,
    setRating,
    notes,
    setNotes,
    selectedPlacements,
    setSelectedPlacements,
    selectedPremium,
    setSelectedPremium,
    actionLoading,
    error,
    handlePublish,
    handleAction,
  };
}
