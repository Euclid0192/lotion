"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import ToolBar from "@/components/toolbar";
import { useParams } from "next/navigation";
import CoverImage from "@/components/cover";

const NoteIdPage = () => {
  const params = useParams();
  const note = useQuery(api.notes.getNoteById, {
    id: params.noteId as Id<"notes">,
  });

  if (note === undefined) {
    return <div>Loading...</div>;
  }

  if (note === null) {
    return <div>Note not found</div>;
  }

  return (
    <div className="pb-40">
      <CoverImage url={note.coverImage} />
      <div className="md:max-w-3xl lg:max-w-4xl mx-auto">
        <ToolBar initialData={note} />
      </div>
    </div>
  );
};

export default NoteIdPage;
