import { memo } from "react";

import NewsCard from "@/components/feed/NewsCard";

function FeedContainer({
  articles,
  getCachedResult,
  getLoadingAction,
  onOpen,
  onVerify,
  onVerifyAndStore
}) {
  return (
    <section className="feed-scroll h-[calc(100vh-5rem)] overflow-y-auto">
      {articles.map((article) => (
        <NewsCard
          key={article.id}
          article={article}
          cachedResult={getCachedResult(article)}
          loadingAction={getLoadingAction(article)}
          onOpen={onOpen}
          onVerify={onVerify}
          onVerifyAndStore={onVerifyAndStore}
        />
      ))}
    </section>
  );
}

export default memo(FeedContainer);
