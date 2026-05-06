/**
 * useGroupTrip — WebSocket + REST hook for the Group Travel Planner.
 * Includes Presence, Typing indicators, Diff-based syncing, and Security.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

const _envUrl = import.meta.env.VITE_API_BASE_URL;
const API = typeof _envUrl === 'string' ? _envUrl : 'http://localhost:8001';
const WS_BASE = API.replace(/^http/, 'ws');

export interface Activity {
  id: number;
  text: string;
  icon: 'food' | 'transport' | 'hotel' | 'default';
}

export interface DayPlan {
  id: number;
  title: string;
  activities: Activity[];
}

export interface ChatMessage {
  id: string | number;
  text: string;
  user: string;
  avatar: string;
  color: string;
  time: string;
}

export interface GroupTrip {
  id: string;
  title: string;
  owner_id: string;
  members: string[];
  days: DayPlan[];
  version: number;
  created_at: string;
}

function timeNow() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function useGroupTrip(tripId: string | null, userId: string = 'Me') {
  const [trip, setTrip]         = useState<GroupTrip | null>(null);
  const [days, setDays]         = useState<DayPlan[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const typingTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});

  // ── Fetch trip from REST ──────────────────────────────────────────────────
  useEffect(() => {
    if (!tripId) return;
    setLoading(true);
    setError(null);

    Promise.all([
      fetch(`${API}/group-trips/${tripId}`).then(r => r.ok ? r.json() : Promise.reject(r.statusText)),
      fetch(`${API}/group-trips/${tripId}/messages`).then(r => r.ok ? r.json() : []),
    ])
      .then(([tripData, msgs]) => {
        setTrip(tripData);
        setDays(tripData.days ?? []);
        setMessages(
          (msgs as any[]).map(m => ({
            id: m._id ?? m.id ?? Date.now(),
            text: m.text,
            user: m.user,
            avatar: m.avatar ?? '?',
            color: m.color ?? 'bg-slate-500',
            time: m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : timeNow(),
          }))
        );
      })
      .catch(err => setError(String(err)))
      .finally(() => setLoading(false));
  }, [tripId]);

  // ── WebSocket ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!tripId) return;
    
    let retryCount = 0;
    const maxRetries = 5;
    
    const connectWS = () => {
      // Send user_id for Security and Presence
      const ws = new WebSocket(`${WS_BASE}/group-trips/ws/${tripId}?user_id=${encodeURIComponent(userId)}`);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Full sync fallback
          if (data.type === 'activity_updated') {
            if (data.days) setDays(data.days);
          }
          
          // Diff Sync: Activity Added
          if (data.type === 'activity_added') {
            setDays(prev => prev.map(d => d.id === data.dayId ? { ...d, activities: [...d.activities, data.activity] } : d));
          }
          
          // Diff Sync: Activity Removed
          if (data.type === 'activity_removed') {
            setDays(prev => prev.map(d => d.id === data.dayId ? { ...d, activities: d.activities.filter(a => a.id !== data.actId) } : d));
          }
          
          // Diff Sync: Activity Reordered
          if (data.type === 'activity_reordered') {
            setDays(prev => prev.map(d => d.id === data.dayId ? { ...d, activities: data.activities } : d));
          }

          if (data.type === 'message' && data.message) {
            const m = data.message;
            setMessages(prev => [...prev, {
              id: m._id ?? m.id ?? Date.now(),
              text: m.text,
              user: m.user,
              avatar: m.avatar ?? '?',
              color: m.color ?? 'bg-slate-500',
              time: m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : timeNow(),
            }]);
          }
          
          // Typing Indicator
          if (data.type === 'typing' && data.user !== userId) {
            setTypingUsers(prev => prev.includes(data.user) ? prev : [...prev, data.user]);
            if (typingTimeoutRef.current[data.user]) clearTimeout(typingTimeoutRef.current[data.user]);
            typingTimeoutRef.current[data.user] = setTimeout(() => {
              setTypingUsers(prev => prev.filter(u => u !== data.user));
            }, 3000);
          }
          
          // Presence System
          if (data.type === 'presence') {
            if (data.status === 'online') {
              setOnlineUsers(prev => prev.includes(data.user) ? prev : [...prev, data.user]);
            } else {
              setOnlineUsers(prev => prev.filter(u => u !== data.user));
            }
          }
          
        } catch { /* ignore parse errors */ }
      };

      ws.onclose = (e) => {
        if (e.code === 1008) {
          setError("Unauthorized: You don't have access to this trip.");
          return;
        }
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(connectWS, 2000 * retryCount);
        } else {
          setError('WebSocket connection lost after multiple retries. You are viewing offline mode.');
        }
      };
    };

    connectWS();

    return () => { 
      wsRef.current?.close(); 
      wsRef.current = null; 
      Object.values(typingTimeoutRef.current).forEach(clearTimeout);
    };
  }, [tripId, userId]);

  // ── Actions (Diff based) ──────────────────────────────────────────────────
  
  const addActivity = useCallback((dayId: number, text: string, icon: Activity['icon'] = 'default') => {
    const newActivity = { id: Date.now(), text: text.trim(), icon };
    
    // Optimistic local update
    setDays(prev => prev.map(d => d.id === dayId ? { ...d, activities: [...d.activities, newActivity] } : d));

    // Send Diff via WebSocket
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'activity_added', dayId, activity: newActivity }));
    }
  }, []);

  const removeActivity = useCallback((dayId: number, actId: number) => {
    // Optimistic local update
    setDays(prev => prev.map(d => d.id === dayId ? { ...d, activities: d.activities.filter(a => a.id !== actId) } : d));

    // Send Diff via WebSocket
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'activity_removed', dayId, actId }));
    }
  }, []);

  const reorderActivities = useCallback((dayId: number, newActivities: Activity[]) => {
    // Optimistic
    setDays(prev => prev.map(d => d.id === dayId ? { ...d, activities: newActivities } : d));
    
    // Send Diff
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'activity_reordered', dayId, activities: newActivities }));
    }
  }, []);

  const sendTyping = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'typing', user: userId }));
    }
  }, [userId]);

  const sendMessage = useCallback((text: string, user = 'Me', avatar = 'Me', color = 'bg-purple-500') => {
    if (!text.trim() || !tripId) return;

    // Send via WebSocket (backend persists + broadcasts back)
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'message', message: { text: text.trim(), user, avatar, color } }));
    } else {
      // Fallback REST if offline
      const optimistic: ChatMessage = { id: Date.now(), text: text.trim(), user, avatar, color, time: timeNow() };
      setMessages(prev => [...prev, optimistic]);
      
      fetch(`${API}/group-trips/${tripId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim(), user, avatar, color }),
      });
    }
  }, [tripId]);

  const inviteFriend = useCallback(async (email: string): Promise<{success: boolean; link?: string}> => {
    if (!tripId || !email.trim()) return { success: false };
    try {
      const res = await fetch(`${API}/group-trips/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trip_id: tripId, email: email.trim() }),
      });
      if (res.ok) {
         const data = await res.json();
         return { success: true, link: data.link };
      }
      return { success: false };
    } catch {
      return { success: false };
    }
  }, [tripId]);

  return { 
    trip, 
    days, 
    messages, 
    loading, 
    error, 
    typingUsers,
    onlineUsers,
    addActivity, 
    removeActivity, 
    reorderActivities, 
    sendMessage, 
    sendTyping,
    inviteFriend 
  };
}
