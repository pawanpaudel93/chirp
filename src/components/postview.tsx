import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";
import { type RouterOutputs } from "~/utils/api";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["posts"]["getAll"][number];
export const PostView = ({ post, author }: PostWithUser) => {
  return (
    <div className="flex gap-3 border-b border-slate-400 p-4">
      <Image
        src={author.imageUrl}
        alt={`@${author.username}'s profile picture`}
        className="rounded-full"
        width={48}
        height={48}
      />
      <div className="flex flex-col">
        <div className="flex gap-1 text-slate-300">
          <Link href={`/@${author.username}`}>
            <span>{`@${author.username}`}</span>
          </Link>
          <Link href={`/post/${post.id}`}>
            <span>·</span>
            <span className="font-thin">{dayjs(post.createdAt).fromNow()}</span>
          </Link>
        </div>
        <span className="text-md">{post.content}</span>
      </div>
    </div>
  );
};
