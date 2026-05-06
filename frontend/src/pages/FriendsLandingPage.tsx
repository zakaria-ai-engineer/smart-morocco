import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Reveal } from "../components/Reveal";
import { SectionTitle } from "../components/SectionTitle";

function makeRoomId() {
  return Math.random().toString(36).slice(2, 8) + "-" + Math.random().toString(36).slice(2, 8);
}

export function FriendsLandingPage() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");
  const suggested = useMemo(() => makeRoomId(), []);

  return (
    <section className="space-y-6">
      <SectionTitle
        title="Plan Trip with Friends"
        subtitle="Create a room, share a link, and vote together on destination, budget, and activities."
      />

      <Reveal>
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl bg-white p-6 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl dark:bg-slate-900 dark:ring-slate-800">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Create a room</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Your room is a lightweight collaboration space with live updates (works great across browser tabs/devices).
            </p>
            <button
              type="button"
              onClick={() => navigate(`/friends/${suggested}`)}
              className="mt-5 w-full rounded-xl bg-brand-primary px-5 py-3 font-semibold text-white shadow-lg shadow-brand-primary/25 transition-all duration-300 hover:brightness-110"
            >
              Create Room
            </button>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Example room id: {suggested}</p>
          </article>

          <article className="rounded-2xl bg-white p-6 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl dark:bg-slate-900 dark:ring-slate-800">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Join a room</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Paste a room id from your friend’s link.
            </p>
            <div className="mt-5 flex gap-2">
              <input
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="e.g. ab12cd-34efgh"
                className="w-full flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-brand-accent dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
              <button
                type="button"
                onClick={() => roomId.trim() && navigate(`/friends/${encodeURIComponent(roomId.trim())}`)}
                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
              >
                Join
              </button>
            </div>
          </article>
        </div>
      </Reveal>
    </section>
  );
}

