import { memo } from "react";

import NewsCard from "@/components/feed/NewsCard";

function FeedContainer({
  articles,
  getCachedResult,
  getLoadingAction,
  isBookmarked,
  canStoreOnChain,
  onToggleBookmark,
  onOpen,
  onVerify,
  onVerifyAndStore
}) {
  return (
    <section className="feed-scroll h-[calc(100vh-5.5rem)] overflow-y-auto">
      {articles.map((article) => (
        <NewsCard
          key={article.id}
          article={article}
          cachedResult={getCachedResult(article)}
          loadingAction={getLoadingAction(article)}
          isBookmarked={isBookmarked(article)}
          canStoreOnChain={canStoreOnChain}
          onToggleBookmark={onToggleBookmark}
          onOpen={onOpen}
          onVerify={onVerify}
          onVerifyAndStore={onVerifyAndStore}
        />
      ))}
    </section>
  );
}

export default memo(FeedContainer);
