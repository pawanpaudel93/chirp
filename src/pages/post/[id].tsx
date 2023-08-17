import { useUser } from "@clerk/nextjs";
import Head from "next/head";
import { api } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export default function PostPage() {
  const { isLoaded: userLoaded } = useUser();

  // start fetching early
  api.posts.getAll.useQuery();

  // Return empty div if both aren't loaded since user tends to load faster.
  if (!userLoaded) return <div />;

  return (
    <>
      <Head>
        <title>Post</title>
      </Head>
      <main className="flex h-screen justify-center">
        <div>Post View</div>
      </main>
    </>
  );
}
