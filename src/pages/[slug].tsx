import { type NextPage, type GetStaticPaths, type GetStaticProps } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { createServerSideHelpers } from "@trpc/react-query/server";
import superjson from "superjson";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import { PageLayout } from "~/components/layout";
import Image from "next/image";
import { LoadingPage } from "~/components/loading";
import { PostView } from "~/components/postview";

const ProfileFeed = (props: { userId: string }) => {
  const { data, isLoading } = api.posts.getPostsByUserId.useQuery({
    userId: props.userId,
  });
  if (isLoading) return <LoadingPage />;
  if (!data || data.length === 0) return <div>User has not posted.</div>;
  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView key={fullPost.post.id} {...fullPost} />
      ))}
    </div>
  );
};

const ProfilePage: NextPage<{ username: string }> = ({
  username,
}: {
  username: string;
}) => {
  const { data: user } = api.profile.getUserByUsername.useQuery({
    username,
  });

  if (!user) return <div>404</div>;

  return (
    <>
      <Head>
        <title>{user.username}</title>
      </Head>
      <PageLayout>
        <div className="relative h-36  border-slate-400 bg-slate-600">
          <Image
            src={user.imageUrl}
            alt={`${user.username}'s profile pic`}
            width={128}
            height={128}
            className="absolute bottom-0 left-0 -mb-[64px] ml-4 rounded-full border-2 border-black bg-black"
          />
        </div>
        <div className="h-[64px]"></div>
        <div className="p-4 text-2xl font-bold">{`@${
          user.username ?? ""
        }`}</div>
        <div className="border-b border-slate-400"></div>
        <ProfileFeed userId={user.id} />
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: {
      prisma,
      userId: null,
    },
    transformer: superjson,
  });

  const slug = context.params?.slug;

  if (typeof slug !== "string") throw new Error("No slug specified");

  const username = slug.replace("@", "");

  await ssg.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      trpcState: JSON.parse(JSON.stringify(ssg.dehydrate())),
      username,
    },
  };
};

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export default ProfilePage;
