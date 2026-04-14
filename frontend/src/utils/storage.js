export const TOKEN_KEY = "truthlens_token";
export const USER_KEY = "truthlens_user";
export const HISTORY_KEY = "truthlens_history";
export const CUSTOM_NEWS_KEY = "truthlens_custom_news";
export const CACHE_KEY = "truthlens_prediction_cache";
export const BOOKMARKS_KEY = "truthlens_bookmarks";

export function readJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function decodeToken(token) {
  try {
    const [, payload] = token.split(".");
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}
