
const BASE = (import.meta.env.VITE_AI_REPORT_URL || "").replace(/\/+$/, "");

const qs = (obj) => new URLSearchParams(obj).toString();

// small helper to throw nice errors
async function jsonOrThrow(res) {
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`AI Report HTTP ${res.status}: ${text || res.statusText}`);
  }
  try { return JSON.parse(text); } catch { return text; }
}

// // Legacy endpoints (keeping for backward compatibility)
// export function getFullReport(userId, { signal } = {}) {
//   if (!userId) throw new Error("userId is required");
//   return fetch(`${BASE}/fullreport/${encodeURIComponent(userId)}`, { signal, credentials: "omit" })
//     .then(jsonOrThrow);
// }

// export function getModuleReport(userId, moduleName, { signal } = {}) {
//   if (!userId || !moduleName) throw new Error("userId & moduleName are required");
//   return fetch(`${BASE}/modulereport/${encodeURIComponent(userId)}/${encodeURIComponent(moduleName)}`,  
//     { signal, credentials: "omit" }
//   ).then(jsonOrThrow);
// }

// New Stats Endpoints - Fast loading
export function getFullReportStats(userId, { signal } = {}) {
  if (!userId) throw new Error("userId is required");
  return fetch(`${BASE}/full_report/stats?${qs({ user_id: userId })}`, {
    signal, credentials: "omit"
  }).then(jsonOrThrow);
}

export function getModuleReportStats(userId, moduleName, { signal } = {}) {
  if (!userId || !moduleName) throw new Error("userId & moduleName are required");
  return fetch(`${BASE}/module_report/stats?${qs({ user_id: userId, module_name: moduleName })}`, {
    signal, credentials: "omit"
  }).then(jsonOrThrow);
}


// New Feedback JSON Endpoints - Fallback for streaming
export function getFullReportFeedbackJson(userId, { signal } = {}) {
  if (!userId) throw new Error("userId is required");
  return fetch(`${BASE}/full_report/feedback_json?${qs({ user_id: userId })}`, {
    signal, credentials: "omit"
  }).then(jsonOrThrow);
}

export function getModuleReportFeedbackJson(userId, moduleName, { signal } = {}) {
  if (!userId || !moduleName) throw new Error("userId & moduleName are required");
  return fetch(`${BASE}/module_report/feedback_json?${qs({ user_id: userId, module_name: moduleName })}`, {
    signal, credentials: "omit"
  }).then(jsonOrThrow);
}


// Streaming Feedback Functions
export async function streamFullReportFeedback(userId, onChunk, { signal } = {}) {
  if (!userId) throw new Error("userId is required");
  if (typeof onChunk !== "function") throw new Error("onChunk callback is required");

  const res = await fetch(`${BASE}/full_report/feedback_stream?${qs({ user_id: userId })}`, {
    signal, credentials: "omit"
  });
  if (!res.ok) throw new Error(`AI Report HTTP ${res.status}: ${res.statusText}`);
  const reader = res.body?.getReader();
  if (!reader) throw new Error("Response body is not available for streaming");

  const decoder = new TextDecoder();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      console.log("chunk:", chunk);   
      if (chunk) onChunk(chunk);
    }
  } finally {
    reader.releaseLock();
  }
}

export async function streamModuleReportFeedback(userId, moduleName, onChunk, { signal } = {}) {
  if (!userId || !moduleName) throw new Error("userId & moduleName are required");
  if (typeof onChunk !== "function") throw new Error("onChunk callback is required");

  const res = await fetch(`${BASE}/module_report/feedback_stream?${qs({ user_id: userId, module_name: moduleName })}`, {
    signal, credentials: "omit"
  });
  if (!res.ok) throw new Error(`AI Report HTTP ${res.status}: ${res.statusText}`);
  const reader = res.body?.getReader();
  if (!reader) throw new Error("Response body is not available for streaming");

  const decoder = new TextDecoder();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      if (chunk) onChunk(chunk);
    }
  } finally {
    reader.releaseLock();
  }
}


// Enhanced helper function to get complete report data with streaming
export async function getCompleteReport(userId, options = {}) {
  const { signal, onFeedbackChunk, useStreaming = true } = options;

  try {
    const stats = await getFullReportStats(userId, { signal });

    // Start streaming (fast feedback) OR fallback to JSON
    if (useStreaming && onFeedbackChunk) {
      try {
        await streamFullReportFeedback(userId, onFeedbackChunk, { signal });
        // return immediately with stats; UI streaming karegi
        return { ...stats, feedback: null };
      } catch (e) {
        if (signal?.aborted) throw e; // user cancelled — don't fallback
        // fallback to non-streaming
        const fb = await getFullReportFeedbackJson(userId, { signal });
        return { ...stats, feedback: fb?.feedback || "" };
      }
    } else {
      const fb = await getFullReportFeedbackJson(userId, { signal });
      return { ...stats, feedback: fb?.feedback || "" };
    }
  } catch (error) {
    // Abort hua to legacy pe mat jao
    if (error.name === "AbortError" || /aborted/i.test(error.message)) throw error;

    // Sirf genuine failure pe legacy
    console.warn("New endpoints failed, falling back to legacy:", error.message);
    // return await getFullReport(userId, { signal });
  }
}

export async function getCompleteModuleReport(userId, moduleName, options = {}) {
  const { signal, onFeedbackChunk, useStreaming = true } = options;

  try {
    const stats = await getModuleReportStats(userId, moduleName, { signal });

    if (useStreaming && onFeedbackChunk) {
      try {
        await streamModuleReportFeedback(userId, moduleName, onFeedbackChunk, { signal });
        return { ...stats, feedback: null };
      } catch (e) {
        if (signal?.aborted) throw e;
        const fb = await getModuleReportFeedbackJson(userId, moduleName, { signal });
        return { ...stats, feedback: fb?.feedback || "" };
      }
    } else {
      const fb = await getModuleReportFeedbackJson(userId, moduleName, { signal });
      return { ...stats, feedback: fb?.feedback || "" };
    }
  } catch (error) {
    if (error.name === "AbortError" || /aborted/i.test(error.message)) throw error;
    console.warn("New endpoints failed, falling back to legacy:", error.message);
    // return await getModuleReport(userId, moduleName, { signal });
  }
}


/* Optional: normalize snake_case | camelCase keys safely */
export function normalizeReport(r = {}) {
  const pick = (...keys) => keys.find(k => r?.[k] !== undefined) ? r[keys.find(k => r?.[k] !== undefined)] : undefined;

  return {
    totalGames:       pick("totalGamesPlayed","total_games_played","gamesPlayed"),
    completedGames:   pick("completedGamesCount","completed_games","completed"),
    averageScore:     pick("averageScorePerGame","average_score","avgScore"),
    accuracy:         pick("accuracy","accuracy_percent"),
    avgResponseTimeS: pick("avgResponseTimeSec","avg_response_time_sec","avg_response_time"),
    studyTimeMin:     pick("studyTimeMinutes","study_time_minutes"),
    activeDays:       pick("daysActiveCount","active_days"),
    strongest:        pick("strongestTopics","strongest_modules","strongest_topics") || [],
    weakest:          pick("weakestTopics","weakest_modules","weakest_topics") || [],
    teacherFeedback:  pick("teacher_feedback","overall_feedback","teacherFeedback"),
    // if API ships module list / topic-wise array
    topicPerformance: pick("topicPerformance","topic_performance","modules") || []
  };
}