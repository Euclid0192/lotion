"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import ToolBar from "@/components/toolbar";
import { useParams } from "next/navigation";
import CoverImage from "@/components/cover";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";
import { useMemo } from "react";

const NoteIdPage = () => {
  /// Making sure Editor is not rendered on server side. Recommended for BlockNote
  const Editor = useMemo(
    () => dynamic(() => import("@/components/editor"), { ssr: false }),
    [],
  );
  const params = useParams();
  const note = useQuery(api.notes.getNoteById, {
    id: params.noteId as Id<"notes">,
  });
  const updateNote = useMutation(api.notes.updateNote);

  const onContentChange = (content: string) => {
    updateNote({
      id: params.noteId as Id<"notes">,
      content,
    });
  };

  if (note === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <CoverImage.Skeleton />
        <div className="md:max-w-3xl lg:max-w-4xl mx-auto mt-10">
          <Skeleton className="h-14 w-[50%]" />
          <Skeleton className="h-4 w-[80%]" />
          <Skeleton className="h-4 w-[40%]" />
          <Skeleton className="h-4 w-[60%]" />
        </div>
      </div>
    );
  }

  if (note === null) {
    return <div>Note not found</div>;
  }

  return (
    <div className="pb-40">
      <CoverImage url={note.coverImage} />
      <div className="md:max-w-3xl lg:max-w-4xl mx-auto">
        <ToolBar initialData={note} />
        <Editor onChange={onContentChange} initialContent={note.content} />
      </div>
    </div>
  );
};

export default NoteIdPage;
