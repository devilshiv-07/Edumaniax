const BASE = import.meta.env.VITE_AI_REPORT_URL;

// small helper to throw nice errors
async function jsonOrThrow(res) {
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`AI Report HTTP ${res.status}: ${text || res.statusText}`);
  }
  try { return JSON.parse(text); } catch { return text; }
}

export function getFullReport(userId, { signal } = {}) {
  if (!userId) throw new Error("userId is required");
  return fetch(`${BASE}/fullreport/${encodeURIComponent(userId)}`, { signal, credentials: "omit" })
    .then(jsonOrThrow);
}

export function getModuleReport(userId, moduleName, { signal } = {}) {
  if (!userId || !moduleName) throw new Error("userId & moduleName are required");
  return fetch(`${BASE}/modulereport/${encodeURIComponent(userId)}/${encodeURIComponent(moduleName)}`,
    { signal, credentials: "omit" }
  ).then(jsonOrThrow);
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
