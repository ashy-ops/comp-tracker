const BASE_URL = import.meta.env.DEV ? "/api/cp" : "https://cp-rating-api.vercel.app";

async function fetchCpResource(endpointPath) {
  try {
    const res = await fetch(`${BASE_URL}${endpointPath}`);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (e) {
    console.warn(e);
  }
  return null;
}

export async function fetchCodeforcesStats(username) {
  if (!username) return null;
  const data = await fetchCpResource(
    `/codeforces/${encodeURIComponent(username.trim())}`,
  );
  return data && (data.rating !== undefined || data.handle) ? data : null;
}

export async function fetchLeetCodeStats(username) {
  if (!username) return null;
  const data = await fetchCpResource(
    `/leetcode/${encodeURIComponent(username.trim())}`,
  );
  return data && (data.problemsSolved !== undefined || data.user) ? data : null;
}

export async function fetchCodeChefStats(username) {
  if (!username) return null;
  const data = await fetchCpResource(
    `/codechef/${encodeURIComponent(username.trim())}`,
  );
  return data && (data.rating !== undefined || data.username) ? data : null;
}
