import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { Reveal } from "../components/Reveal";
import { SectionTitle } from "../components/SectionTitle";

type VoteState = {
  destinationVotes: Record<string, string>;
  budgetVotes: Record<string, number>;
  activityVotes: Record<string, string>;
  participants: Array<{ id: string; name: string; joinedAt: number }>;
  finalized?: {
    destination: string;
    averageBudget: number;
    activities: string[];
    createdAt: number;
  };
};

const DESTINATIONS = [
  "Marrakech",
  "Fes",
  "Chefchaouen",
  "Agadir",
  "Tangier",
  "Essaouira",
  "Ouarzazate",
  "Rabat",
  "Casablanca",
  "Ifrane",
  "Dakhla",
  "Tetouan",
  "Nador",
  "El Jadida",
  "Meknes",
];

const ACTIVITIES = [
  "Food & Drink",
  "Medina & Culture",
  "Desert & Camping",
  "Beach & Relax",
  "Hiking & Nature",
  "Shopping & Souks",
  "Photography",
  "Family Friendly",
];

function roomKey(roomId: string) {
  return `sm-friends-room:${roomId}`;
}

function getSelfId() {
  const key = "sm-friends-self-id";
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;
  const id = Math.random().toString(36).slice(2, 10);
  sessionStorage.setItem(key, id);
  return id;
}

function getDefaultName() {
  const key = "sm-friends-self-name";
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;
  const name = `Traveler ${Math.floor(100 + Math.random() * 900)}`;
  sessionStorage.setItem(key, name);
  return name;
}

function safeParse(raw: string | null): VoteState | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as VoteState;
  } catch {
    return null;
  }
}

function initialState(): VoteState {
  return { destinationVotes: {}, budgetVotes: {}, activityVotes: {}, participants: [] };
}

function computeAverage(votes: Record<string, number>) {
  const entries = Object.entries(votes);
  if (!entries.length) return 0;
  const sum = entries.reduce((acc, [, v]) => acc + Number(v), 0);
  return Math.round(sum / entries.length);
}

function topDestination(votes: Record<string, string>, fallback: string) {
  const counts: Record<string, number> = {};
  Object.values(votes).forEach((d) => {
    counts[d] = (counts[d] ?? 0) + 1;
  });
  const entries = Object.entries(counts);
  if (!entries.length) return fallback;
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0]?.[0] ?? fallback;
}

export function FriendsRoomPage() {
  const { roomId: rawRoomId } = useParams();
  const roomId = decodeURIComponent(rawRoomId ?? "");
  const selfId = useMemo(() => getSelfId(), []);
  const [selfName, setSelfName] = useState(getDefaultName());
  const [state, setState] = useState<VoteState>(() => initialState());
  const [copied, setCopied] = useState(false);
  const channelRef = useRef<BroadcastChannel | null>(null);

  const shareUrl = useMemo(() => `${window.location.origin}/friends/${encodeURIComponent(roomId)}`, [roomId]);

  useEffect(() => {
    if (!roomId) return;
    const stored = safeParse(localStorage.getItem(roomKey(roomId)));
    setState(stored ?? initialState());
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;
    const bc = new BroadcastChannel(roomKey(roomId));
    channelRef.current = bc;
    bc.onmessage = (ev) => {
      const next = ev.data as VoteState | undefined;
      if (!next) return;
      setState(next);
    };
    return () => {
      bc.close();
      channelRef.current = null;
    };
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;
    const onStorage = (e: StorageEvent) => {
      if (e.key !== roomKey(roomId)) return;
      const next = safeParse(e.newValue);
      if (next) setState(next);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;
    setState((prev) => {
      if (prev.participants.some((p) => p.id === selfId)) return prev;
      const next: VoteState = {
        ...prev,
        participants: [...prev.participants, { id: selfId, name: selfName, joinedAt: Date.now() }].slice(0, 24),
      };
      localStorage.setItem(roomKey(roomId), JSON.stringify(next));
      channelRef.current?.postMessage(next);
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, selfId]);

  useEffect(() => {
    sessionStorage.setItem("sm-friends-self-name", selfName);
  }, [selfName]);

  const persist = (updater: (prev: VoteState) => VoteState) => {
    setState((prev) => {
      const next = updater(prev);
      localStorage.setItem(roomKey(roomId), JSON.stringify(next));
      channelRef.current?.postMessage(next);
      return next;
    });
  };

  const averageBudget = useMemo(() => computeAverage(state.budgetVotes), [state.budgetVotes]);
  const winningDestination = useMemo(
    () => topDestination(state.destinationVotes, DESTINATIONS[0]),
    [state.destinationVotes],
  );
  const pickedActivities = useMemo(
    () =>
      Array.from(
        new Set(
          Object.values(state.activityVotes)
            .flatMap((raw) => String(raw).split("|"))
            .map((s) => s.trim())
            .filter(Boolean),
        ),
      ),
    [state.activityVotes],
  );

  const finalize = () => {
    persist((prev) => ({
      ...prev,
      finalized: {
        destination: winningDestination,
        averageBudget,
        activities: pickedActivities.length ? pickedActivities : ["Culture", "Food & Drink"],
        createdAt: Date.now(),
      },
    }));
  };

  const voteDestination = (dest: string) => {
    persist((prev) => ({
      ...prev,
      destinationVotes: { ...prev.destinationVotes, [selfId]: dest },
    }));
  };

  const voteBudget = (value: number) => {
    persist((prev) => ({
      ...prev,
      budgetVotes: { ...prev.budgetVotes, [selfId]: value },
    }));
  };

  const toggleActivity = (activity: string) => {
    persist((prev) => {
      const current = prev.activityVotes[selfId]
        ? new Set(String(prev.activityVotes[selfId]).split("|").filter(Boolean))
        : new Set<string>();
      if (current.has(activity)) current.delete(activity);
      else current.add(activity);
      return { ...prev, activityVotes: { ...prev.activityVotes, [selfId]: Array.from(current).join("|") } };
    });
  };

  const activityForSelf = useMemo(() => {
    const raw = state.activityVotes[selfId];
    if (!raw) return new Set<string>();
    return new Set(String(raw).split("|").filter(Boolean));
  }, [state.activityVotes, selfId]);

  const destinationCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.values(state.destinationVotes).forEach((d) => {
      counts[d] = (counts[d] ?? 0) + 1;
    });
    return counts;
  }, [state.destinationVotes]);

  const maxDestVotes = useMemo(() => Math.max(1, ...Object.values(destinationCounts)), [destinationCounts]);

  const safeRoom = roomId.trim().length > 0;
  if (!safeRoom) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200 transition-all duration-300 dark:bg-slate-900 dark:ring-slate-800">
        <p className="text-2xl">🚪</p>
        <p className="text-slate-700 dark:text-slate-300">Room not found.</p>
        <Link to="/friends" className="mt-3 inline-block text-brand-primary hover:underline">
          Back
        </Link>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <SectionTitle title="Trip Room" subtitle="Vote together — live updates in real time." />

      <Reveal>
        <div className="grid gap-6 lg:grid-cols-3">
          <article className="rounded-2xl bg-white p-5 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200 transition-all duration-300 dark:bg-slate-900 dark:ring-slate-800 lg:col-span-2">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Room</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">{roomId}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(shareUrl);
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 1200);
                  }}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                >
                  {copied ? "Copied" : "Copy link"}
                </button>
                <Link
                  to={`/plan-trip?query=${encodeURIComponent(
                    `${state.finalized?.destination ?? winningDestination} trip with ${state.finalized?.activities?.join(", ") ?? "culture"} under ${(state.finalized?.averageBudget ?? averageBudget) || 3000
                    } MAD`,
                  )}`}
                  className="rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-primary/25 transition-all duration-300 hover:brightness-110"
                >
                  Generate Plan
                </Link>
              </div>
            </div>

            <div className="mt-5 grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Vote: Destination</p>
                <div className="grid gap-2">
                  {DESTINATIONS.map((d) => {
                    const selected = state.destinationVotes[selfId] === d;
                    const count = destinationCounts[d] ?? 0;
                    const pct = Math.round((count / maxDestVotes) * 100);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => voteDestination(d)}
                        className={`relative overflow-hidden rounded-xl border px-4 py-3 text-left transition-all duration-300 ${selected
                            ? "border-brand-primary bg-brand-primary/10"
                            : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/30 dark:hover:bg-slate-950/50"
                          }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">{d}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">{count} votes</span>
                        </div>
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div className="h-full rounded-full bg-brand-accent" style={{ width: `${pct}%` }} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Vote: Budget (MAD)</p>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/30">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-600 dark:text-slate-300">Your budget</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{state.budgetVotes[selfId] ?? 3000} MAD</p>
                  </div>
                  <input
                    type="range"
                    min={1000}
                    max={8000}
                    step={100}
                    value={state.budgetVotes[selfId] ?? 3000}
                    onChange={(e) => voteBudget(Number(e.target.value))}
                    className="mt-4 w-full accent-brand-primary"
                  />
                  <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-950/40 dark:text-slate-300">
                    Average budget: <span className="font-semibold">{averageBudget || 0} MAD</span>
                  </div>
                </div>

                <p className="pt-2 text-sm font-semibold text-slate-900 dark:text-white">Vote: Activities</p>
                <div className="flex flex-wrap gap-2">
                  {ACTIVITIES.map((a) => {
                    const on = activityForSelf.has(a);
                    return (
                      <button
                        key={a}
                        type="button"
                        onClick={() => toggleActivity(a)}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-300 ${on
                            ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/25"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                          }`}
                      >
                        {a}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200 dark:bg-slate-950/40 dark:ring-slate-800 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Current best</p>
                <p className="text-base font-semibold text-slate-900 dark:text-white">
                  {state.finalized?.destination ?? winningDestination} • {(state.finalized?.averageBudget ?? averageBudget) || 3000} MAD
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Activities: {(state.finalized?.activities ?? pickedActivities).slice(0, 4).join(", ") || "No votes yet"}
                </p>
              </div>
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={finalize}
                className="rounded-xl bg-brand-primary px-5 py-3 font-semibold text-white shadow-lg shadow-brand-primary/25 transition-all duration-300 hover:brightness-110"
              >
                Finalize
              </motion.button>
            </div>
          </article>

          <aside className="space-y-4 rounded-2xl bg-white p-5 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200 transition-all duration-300 dark:bg-slate-900 dark:ring-slate-800">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Participants</p>
              <span className="rounded-full bg-brand-accent/15 px-2.5 py-1 text-xs font-semibold text-slate-800 dark:text-slate-100">
                {state.participants.length}
              </span>
            </div>
            <div className="space-y-2">
              {state.participants
                .slice()
                .sort((a, b) => a.joinedAt - b.joinedAt)
                .map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200 dark:bg-slate-950/40 dark:ring-slate-800"
                  >
                    <div className="flex items-center gap-2">
                      <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-primary/10 text-brand-primary ring-1 ring-brand-primary/15">
                        <span className="text-xs font-bold">{p.name.slice(0, 2).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {p.name} {p.id === selfId ? "(you)" : ""}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {state.destinationVotes[p.id] ? `Voted: ${state.destinationVotes[p.id]}` : "No destination vote yet"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200 dark:bg-slate-950/40 dark:ring-slate-800">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Your name</p>
              <input
                value={selfName}
                onChange={(e) => {
                  const name = e.target.value;
                  setSelfName(name);
                  persist((prev) => ({
                    ...prev,
                    participants: prev.participants.map((p) => (p.id === selfId ? { ...p, name } : p)),
                  }));
                }}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-accent dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Share link and vote — updates sync automatically.
              </p>
            </div>
          </aside>
        </div>
      </Reveal>
    </section>
  );
}

