import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { DEFAULT_LIMIT } from "@/constants";
import { getQueryClient, trpc } from "@/trpc/server";

import { LibraryView } from "@/modules/library/ui/views/library-view";

const Page = async () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchInfiniteQuery(trpc.library.getMany.infiniteQueryOptions({
    limit: DEFAULT_LIMIT,
  }, {
    getNextPageParam: (lastPage) => {
      return lastPage.docs?.length > 0 ? lastPage.nextPage : undefined;
    },
  }));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LibraryView />
    </HydrationBoundary>
  );
};

export default Page;