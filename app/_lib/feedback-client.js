/**
 * Kirim feedback relevansi bug (like / dislike)
 * @param {object} params
 * @param {string} params.organization
 * @param {string} params.project
 * @param {string} params.bug_id
 * @param {string} params.topic_id
 * @param {string} params.query
 * @param {boolean} params.is_relevant
 */
export async function sendBugFeedback({
  organization,
  project,
  bug_id,
  topic_id,
  query,
  is_relevant,
}) {
  const res = await fetch("/api/feedback/bug", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      organization,
      project,
      bug_id,
      topic_id,
      query,
      is_relevant,
    }),
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      json?.message ||
      json?.detail ||
      json?.error ||
      "Failed to submit feedback";
    throw new Error(msg);
  }

  return json;
}
