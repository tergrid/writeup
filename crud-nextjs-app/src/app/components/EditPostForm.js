"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePost } from "../api/posts";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const postSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  body: z.string().min(1, { message: "Body is required" }),
});

export default function EditPostForm({ post, onCancel }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: post.title,
      body: post.body,
    },
    resolver: zodResolver(postSchema),
  });
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data) => updatePost(post.id, data),
    onSuccess: (updatedPost) => {
      // Manually update the cached posts to reflect the updated data
      queryClient.setQueryData(["posts"], (oldPosts) =>
        oldPosts.map((p) =>
          p.id === updatedPost.id ? { ...p, ...updatedPost } : p
        )
      );
      onCancel();
    },
    onError: (error) => {
      console.error("Update failed", error);
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-4 card bg-white text-black dark:bg-neutral dark:text-white"
    >
      <input
        {...register("title")}
        placeholder="Title"
        className="input input-bordered bg-slate-100 w-full mb-2 text-black dark:bg-neutral dark:text-white"
      />
      {errors.title && (
        <p className="text-error mb-2">{errors.title.message}</p>
      )}

      <textarea
        {...register("body")}
        placeholder="Body"
        className="textarea textarea-bordered w-full mb-2 bg-slate-100 text-black dark:bg-neutral dark:text-white"
      ></textarea>
      {errors.body && <p className="text-error mb-2">{errors.body.message}</p>}

      <div className="flex justify-end gap-2 ml-auto">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-sm btn-outline rounded-full"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-sm btn-accent btn-outline rounded-full"
          disabled={mutation.isLoading}
        >
          {mutation.isLoading ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
