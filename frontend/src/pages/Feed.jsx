import { startTransition, useCallback, useState } from "react";

import FeedContainer from "@/components/feed/FeedContainer";
import BlockchainModal from "@/components/modals/BlockchainModal";
import ResultModal from "@/components/modals/ResultModal";
import { useAuth } from "@/hooks/useAuth";

export default function Feed() {
  const { feedItems, predictionCache, requestPrediction, toggleBookmark, isBookmarked } = useAuth();
  const [activeResult, setActiveResult] = useState(null);
  const [blockchainResult, setBlockchainResult] = useState(null);
  const [loadingArticleId, setLoadingArticleId] = useState(null);
  const [loadingMode, setLoadingMode] = useState(null);

  const handleVerify = useCallback(async (article) => {
    setLoadingArticleId(article.id);
    setLoadingMode("verify");
    try {
      const result = await requestPrediction(article.content, {
        headline: article.headline,
        store: false
      });
      startTransition(() => {
        setActiveResult({ ...result, headline: article.headline, text: article.content });
      });
    } finally {
      setLoadingArticleId(null);
      setLoadingMode(null);
    }
  }, [requestPrediction]);

  const handleOpenArticle = useCallback(async (article) => {
    const cached = predictionCache[article.content.trim().toLowerCase()];
    if (cached) {
      startTransition(() => {
        setActiveResult({ ...cached, headline: article.headline, text: article.content });
      });
      return;
    }
    await handleVerify(article);
  }, [handleVerify, predictionCache]);

  const handleVerifyAndStore = useCallback(async (article) => {
    setLoadingArticleId(article.id);
    setLoadingMode("store");
    try {
      const result = await requestPrediction(article.content, {
        headline: article.headline,
        store: true
      });
      startTransition(() => {
        setBlockchainResult({ ...result, headline: article.headline, text: article.content });
      });
    } finally {
      setLoadingArticleId(null);
      setLoadingMode(null);
    }
  }, [requestPrediction]);

  return (
    <>
      <FeedContainer
        articles={feedItems}
        getCachedResult={(article) => predictionCache[article.content.trim().toLowerCase()]}
        getLoadingAction={(article) =>
          loadingArticleId === article.id ? loadingMode : null
        }
        isBookmarked={isBookmarked}
        onToggleBookmark={toggleBookmark}
        onOpen={handleOpenArticle}
        onVerify={handleVerify}
        onVerifyAndStore={handleVerifyAndStore}
      />
      <ResultModal
        open={Boolean(activeResult)}
        result={activeResult}
        onClose={() => setActiveResult(null)}
      />
      <BlockchainModal
        open={Boolean(blockchainResult)}
        result={blockchainResult}
        onClose={() => setBlockchainResult(null)}
      />
    </>
  );
}
