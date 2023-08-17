import { SignInButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import { api } from "~/utils/api";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { useState } from "react";
import toast from "react-hot-toast";
import { PageLayout } from "~/components/layout";
import { PostView } from "~/components/postview";

const CreatePostWizard = () => {
  const { user } = useUser();

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage?.[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to post! Please try again later.");
      }
    },
  });

  const [input, setInput] = useState("");

  if (!user) return null;

  return (
    <div className="flex w-full gap-3 ">
      <Image
        src={user.imageUrl}
        alt="Profile Image"
        className="rounded-full"
        width={48}
        height={48}
      />
      <input
        placeholder="Type some emoji"
        className="grow bg-transparent outline-none"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isPosting}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (input !== "") {
              mutate({ content: input });
            }
          }
        }}
      />
      {input !== "" && !isPosting && (
        <button disabled={isPosting} onClick={() => mutate({ content: input })}>
          Post
        </button>
      )}
      {isPosting && (
        <div className="flex items-center justify-center">
          <LoadingSpinner size={20} />
        </div>
      )}
    </div>
  );
};

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if (postsLoading) return <LoadingPage />;

  if (!data) <div>Some went wrong</div>;

  return (
    <div className="flex flex-col">
      {data?.map((fullPost) => (
        <PostView key={fullPost.post.id} {...fullPost} />
      ))}
    </div>
  );
};

export default function Home() {
  const { isSignedIn, isLoaded: userLoaded } = useUser();

  // start fetching early
  api.posts.getAll.useQuery();

  // Return empty div if both aren't loaded since user tends to load faster.
  if (!userLoaded) return <div />;

  return (
    <PageLayout>
      <div className="border-b border-slate-400 p-4">
        <div className="flex justify-center">
          {isSignedIn ? (
            <>
              {/* <SignOutButton /> */}
              <CreatePostWizard />
            </>
          ) : (
            <SignInButton mode="modal" />
          )}
        </div>
      </div>
      <Feed />
    </PageLayout>
  );
}
