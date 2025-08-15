import { useState, useEffect, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function useGameProgress(userId) {
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);

  const normalizeKey = (s = '') =>
    String(s)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');

  const slugify = (s = '') =>
    String(s)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const fetchProgress = useCallback(async () => {
    if (!userId) {
      setProgressMap({});
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/performance/${userId}`);
      if (res.ok) {
        const json = await res.json();
        const data = json.progress || {};
        // normalize keys to allow matching by module key or name
        const normalized = {};
        const addVariants = (key, value) => {
          if (!key) return;
          const original = String(key);
          const lower = original.toLowerCase();
          const alnum = normalizeKey(original);
          const slug = slugify(original);
          const nospace = original.replace(/\s+/g, '').toLowerCase();

          normalized[original] = value;
          normalized[lower] = value;
          normalized[alnum] = value;
          normalized[slug] = value;
          normalized[nospace] = value;
        };

        Object.entries(data).forEach(([k, v]) => addVariants(k, v));
        setProgressMap(normalized);
  try { localStorage.setItem(`progress_${userId}`, JSON.stringify(normalized)); } catch (err) { void err; }
        // notify other listeners (other hook instances/pages)
        if (typeof window !== 'undefined') {
          try {
            window.dispatchEvent(new CustomEvent('progressUpdated', { detail: { userId, progress: normalized } }));
          } catch (err) { void err; }
        }
      } else {
        // fallback to localStorage
        const local = localStorage.getItem(`progress_${userId}`);
        setProgressMap(local ? JSON.parse(local) : {});
      }
  } catch {
      const local = localStorage.getItem(`progress_${userId}`);
      setProgressMap(local ? JSON.parse(local) : {});
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Listen for cross-tab/component progress updates so multiple hook instances stay synced
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (e) => {
      try {
        const detail = e?.detail || {};
        if (!detail) return;
        if (detail.userId && detail.userId === userId && detail.progress) {
          setProgressMap(detail.progress);
        }
  } catch (err) { void err; }
    };
    window.addEventListener('progressUpdated', handler);
    return () => window.removeEventListener('progressUpdated', handler);
  }, [userId]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // compute a percent from backend record
  const percentFromRecord = (rec) => {
    if (!rec) return 0;
    if (typeof rec.averageScorePerGame === 'number' && rec.averageScorePerGame > 0) return Math.round(rec.averageScorePerGame);
    const played = rec.totalGamesPlayed || 0;
    const completed = rec.completedGamesCount || 0;
    if (played > 0) return Math.round((completed / played) * 100);
    return 0;
  };

  // set progress: optimistic update + persist to server
  const setProgress = async (moduleName, percent, extras = {}) => {
    if (!userId) return;

    // optimistic
    setProgressMap((prev) => {
      const next = { ...prev };
      const value = { ...(prev[moduleName] || {}), averageScorePerGame: percent, ...extras };

      // add multiple key variants for robust lookup
      const original = String(moduleName);
      const lower = original.toLowerCase();
      const alnum = normalizeKey(original);
      const slug = slugify(original);
      const nospace = original.replace(/\s+/g, '').toLowerCase();

      next[original] = value;
      next[lower] = value;
      next[alnum] = value;
      next[slug] = value;
      next[nospace] = value;

      // also notify other hook instances immediately
      if (typeof window !== 'undefined') {
        try {
          window.dispatchEvent(new CustomEvent('progressUpdated', { detail: { userId, progress: next } }));
        } catch (err) { void err; }
      }

      return next;
    });

    try {
      const body = {
        userId,
        moduleName,
        score: percent,
        completed: extras.completed || false,
        accuracy: extras.accuracy,
        avgResponseTimeSec: extras.avgResponseTimeSec,
        studyTimeMinutes: extras.studyTimeMinutes,
      };

      const res = await fetch(`${API_BASE}/performance/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        // refresh canonical server state
        await fetchProgress();
      } else {
        // persist optimistic to localStorage
        localStorage.setItem(`progress_${userId}`, JSON.stringify({ ...progressMap, [moduleName]: { averageScorePerGame: percent } }));
      }
  } catch {
      localStorage.setItem(`progress_${userId}`, JSON.stringify({ ...progressMap, [moduleName]: { averageScorePerGame: percent } }));
    }
  };

  return { progressMap, loading, fetchProgress, setProgress, percentFromRecord, normalizeKey };
}
