import { useQuery, useQueryClient } from "@tanstack/react-query";
import { React, useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { getPosts, deletePost } from "../api/posts";
import EditPostForm from "./EditPostForm";

export default function PostList() {
  const queryClient = useQueryClient();
  const [editingPost, setEditingPost] = useState(null);
  const {
    data: posts,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: getPosts,
  });

  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      const previousPosts = queryClient.getQueryData(["posts"]);
      queryClient.setQueryData(["posts"], (old) =>
        old.filter((post) => post.id !== postId)
      );
      return { previousPosts };
    },
    onError: (err, postId, context) => {
      queryClient.setQueryData(["posts"], context.previousPosts);
    },
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="mt-4">
      <h2 className="text-2xl font-bold">Posts</h2>
      {posts.slice(0, 10).map((post) => (
        <div
          key={post.id}
          className="card shadow-md bg-white p-4 mt-2 dark:bg-neutral"
        >
          {editingPost?.id === post.id ? (
            <EditPostForm post={post} onCancel={() => setEditingPost(null)} />
          ) : (
            <>
              <h3 className="text-lg text-black font-semibold dark:text-bgLight">
                {post.title}
              </h3>
              <p className="text-txtBody dark:text-bgLight">{post.body}</p>
              <div className="flex gap-2 mt-2 ml-auto">
                <button
                  onClick={() => deleteMutation.mutate(post.id)}
                  className="btn btn-sm btn-secondary btn-outline rounded-full"
                >
                  Delete
                </button>
                <button
                  onClick={() => setEditingPost(post)}
                  className="btn btn-sm btn-primary btn-outline rounded-full"
                >
                  Edit
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
