import { createContext, startTransition, useCallback, useEffect, useMemo, useState } from "react";

import { seededNews } from "@/data/newsSeed";
import { analyticsApi, authApi, blockchainApi, predictionApi } from "@/services/api";
import {
  BOOKMARKS_KEY,
  CACHE_KEY,
  CUSTOM_NEWS_KEY,
  HISTORY_KEY,
  TOKEN_KEY,
  USER_KEY,
  decodeToken,
  readJSON,
  writeJSON,
} from "@/utils/storage";
import { applyTheme, getStoredTheme } from "@/utils/theme";

export const AuthContext = createContext(null);

function summarizeText(text, aiAnalysis) {
  if (aiAnalysis?.summary && !/currently unavailable/i.test(aiAnalysis.summary)) {
    return aiAnalysis.summary.trim();
  }

  const normalized = String(text || "").replace(/\s+/g, " ").trim();
  if (!normalized) {
    return "No summary available.";
  }

  const sentenceMatches = normalized.match(/[^.!?]+[.!?]?/g) || [];
  const summary = sentenceMatches.slice(0, 2).join(" ").trim();
  return summary.length > 220 ? `${summary.slice(0, 217).trim()}...` : summary;
}

function normalizeAxiosError(error, fallback) {
  if (error?.code === "ECONNABORTED" || String(error?.message || "").includes("timeout")) {
    return "Verification is taking longer than expected. Please try again in a few seconds.";
  }
  return (
    error?.response?.data?.detail ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => readJSON(USER_KEY, null));
  const [history, setHistory] = useState(() => readJSON(HISTORY_KEY, []));
  const [customNews, setCustomNews] = useState(() => readJSON(CUSTOM_NEWS_KEY, []));
  const [predictionCache, setPredictionCache] = useState(() => readJSON(CACHE_KEY, {}));
  const [bookmarks, setBookmarks] = useState(() => readJSON(BOOKMARKS_KEY, []));
  const [bootstrapping, setBootstrapping] = useState(true);
  const [toast, setToast] = useState(null);
  const [theme, setTheme] = useState(() => getStoredTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (!token) {
      setBootstrapping(false);
      return;
    }

    const decoded = decodeToken(token);
    if (!decoded?.sub) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setToken(null);
      setUser(null);
      setBootstrapping(false);
      return;
    }

    const hydratedUser = {
      username: decoded.sub,
      role: decoded.role || "user"
    };

    setUser((currentUser) => currentUser || hydratedUser);
    writeJSON(USER_KEY, hydratedUser);
    setBootstrapping(false);
  }, [token]);

  useEffect(() => {
    writeJSON(HISTORY_KEY, history);
  }, [history]);

  useEffect(() => {
    writeJSON(CUSTOM_NEWS_KEY, customNews);
  }, [customNews]);

  useEffect(() => {
    writeJSON(CACHE_KEY, predictionCache);
  }, [predictionCache]);

  useEffect(() => {
    writeJSON(BOOKMARKS_KEY, bookmarks);
  }, [bookmarks]);

  const pushToast = useCallback((message, type = "info") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToast({ id, message, type });
    window.clearTimeout(pushToast.timeoutId);
    pushToast.timeoutId = window.setTimeout(() => setToast(null), 3200);
  }, []);

  const persistSession = useCallback((accessToken) => {
    const decoded = decodeToken(accessToken);
    const nextUser = {
      username: decoded?.sub || "unknown",
      role: decoded?.role || "user"
    };

    localStorage.setItem(TOKEN_KEY, accessToken);
    writeJSON(USER_KEY, nextUser);
    setToken(accessToken);
    setUser(nextUser);
    return nextUser;
  }, []);

  const signup = useCallback(async (payload) => {
    const response = await authApi.signup(payload);
    persistSession(response.data.access_token);
    pushToast("Account created successfully.", "success");
  }, [persistSession, pushToast]);

  const login = useCallback(async (payload) => {
    const response = await authApi.login(payload);
    persistSession(response.data.access_token);
    pushToast("Welcome back.", "success");
  }, [persistSession, pushToast]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    pushToast("You have been signed out.", "info");
  }, [pushToast]);

  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  }, []);

  const getPredictionKey = (text) => text.trim().toLowerCase();

  const recordHistory = useCallback((entry) => {
    startTransition(() => {
      setHistory((currentHistory) => [
        {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          createdAt: new Date().toISOString(),
          ...entry
        },
        ...currentHistory
      ]);
    });
  }, []);

  const saveCustomNews = useCallback((article) => {
    const item = {
      id: `custom-${Date.now()}`,
      headline: article.headline.trim(),
      content: article.content.trim(),
      source: "Submitted by you",
      category: "Custom"
    };
    startTransition(() => {
      setCustomNews((currentItems) => [item, ...currentItems]);
    });
    return item;
  }, []);

  const isBookmarked = useCallback((article) => {
    if (!article?.content) {
      return false;
    }
    const key = getPredictionKey(article.content);
    return bookmarks.some((item) => item.key === key);
  }, [bookmarks]);

  const toggleBookmark = useCallback((article, result = null) => {
    if (!article?.content) {
      return false;
    }

    const key = getPredictionKey(article.content);
    const nextSummary = summarizeText(article.content, result?.ai_analysis);
    const alreadyBookmarked = bookmarks.some((item) => item.key === key);

    startTransition(() => {
      setBookmarks((currentBookmarks) => {
        const existingIndex = currentBookmarks.findIndex((item) => item.key === key);
        if (existingIndex >= 0) {
          return currentBookmarks.filter((item) => item.key !== key);
        }

        return [
          {
            key,
            headline: article.headline || article.text?.slice(0, 80) || "Saved article",
            content: article.content || article.text || "",
            source: article.source || "Saved from verification",
            category: article.category || "Saved",
            savedAt: new Date().toISOString(),
            label: result?.label || article.label || null,
            confidence: result?.confidence ?? article.confidence ?? null,
            summary: nextSummary,
            txHash: result?.txHash || article.txHash || null,
            verificationId: result?.hash || article.hash || null
          },
          ...currentBookmarks
        ];
      });
    });

    pushToast(alreadyBookmarked ? "Removed from saved items." : "Saved for later.", "success");
    return !alreadyBookmarked;
  }, [bookmarks, pushToast]);

  const requestPrediction = useCallback(async (text, options = { store: false, headline: "" }) => {
    const key = getPredictionKey(text);
    if (!options.store && predictionCache[key]) {
      return { ...predictionCache[key], cached: true };
    }

    try {
      const response = options.store
        ? await predictionApi.predictAndStore({ text })
        : await predictionApi.predict({ text });

      const result = response.data;
      const summary = summarizeText(text, result.ai_analysis);
      const cacheableResult = {
        ...result,
        text,
        headline: options.headline,
        summary
      };

      startTransition(() => {
        setPredictionCache((currentCache) => ({
          ...currentCache,
          [key]: cacheableResult
        }));
      });

      recordHistory({
        headline: options.headline || text.slice(0, 60),
        text,
        summary,
        label: result.label,
        confidence: result.confidence,
        txHash: result.txHash || null,
        verificationId: result.hash || null,
        blockNumber: result.blockNumber ?? null,
        blockchainStatus: options.store
          ? (result.blockNumber == null ? "pending" : "confirmed")
          : "prediction"
      });

      return {
        ...result,
        summary
      };
    } catch (error) {
      const message = normalizeAxiosError(error, "Request failed. Please try again.");
      pushToast(message, "error");
      throw new Error(message);
    }
  }, [predictionCache, pushToast, recordHistory]);

  const refreshProfile = useCallback(async () => {
    if (!token) {
      return null;
    }

    try {
      const response = await authApi.profile();
      const nextUser = {
        username: response.data.username || user?.username,
        role: response.data.role || user?.role || "user"
      };
      setUser(nextUser);
      writeJSON(USER_KEY, nextUser);
      return response.data;
    } catch {
      return {
        username: user?.username,
        role: user?.role || "user",
        history
      };
    }
  }, [history, token, user?.role, user?.username]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await analyticsApi.summary();
      return response.data;
    } catch (error) {
      const message = normalizeAxiosError(error, "Unable to load analytics.");
      pushToast(message, "error");
      throw new Error(message);
    }
  }, [pushToast]);

  const verifyHash = useCallback(async (hash) => {
    try {
      const response = await blockchainApi.verify(hash.trim());
      return response.data;
    } catch (error) {
      const message = normalizeAxiosError(error, "Verification record not found.");
      pushToast(message, "error");
      throw new Error(message);
    }
  }, [pushToast]);

  const feedItems = useMemo(() => [...customNews, ...seededNews], [customNews]);

  const value = useMemo(
    () => ({
      token,
      user,
      history,
      customNews,
      feedItems,
      predictionCache,
      bookmarks,
      bootstrapping,
      toast,
      theme,
      isAuthenticated: Boolean(token),
      signup,
      login,
      logout,
      toggleTheme,
      pushToast,
      requestPrediction,
      saveCustomNews,
      toggleBookmark,
      isBookmarked,
      refreshProfile,
      fetchAnalytics,
      verifyHash,
    }),
    [token, user, history, customNews, feedItems, predictionCache, bookmarks, bootstrapping, toast, theme, isBookmarked, toggleBookmark]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
