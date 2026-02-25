"use client";

import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import SidebarItem from "./sidebar-item";
import { cn } from "@/lib/utils";
import { FileIcon } from "lucide-react";

interface NotesListProps {
  parentNoteId?: Id<"notes">;
  level?: number;
  data?: Doc<"notes">[];
}

export const NotesList = ({
  parentNoteId,
  level = 0,
  data,
}: NotesListProps) => {
  const params = useParams();
  const router = useRouter();

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const onExpand = (noteId: string) => {
    setExpanded((prev) => ({
      ...prev,
      [noteId]: !prev[noteId],
    }));
  };

  const notes = useQuery(api.notes.getSidebar, {
    parentNote: parentNoteId,
  });

  const onRedirect = (noteId: string) => {
    router.push(`/notes/${noteId}`);
  };

  if (notes === undefined) {
    return (
      <>
        <SidebarItem.Skeleton level={level} />
        {level === 0 && (
          <div className="space-y-2">
            <SidebarItem.Skeleton level={level} />
            <SidebarItem.Skeleton level={level} />
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <p
        style={{ paddingLeft: level ? `${level * 12 + 25}px` : undefined }}
        className={cn(
          "hidden text-sm text-muted-foreground/80 font-medium",
          expanded && "last:block",
          level === 0 && "hidden",
        )}
      >
        No pages inside
      </p>
      {notes.map((note) => (
        <div key={note._id}>
          <SidebarItem
            onClick={() => onRedirect(note._id)}
            id={note._id}
            label={note.title}
            icon={FileIcon}
            documentIcon={note.icon}
            active={params.noteId === note._id}
            level={level}
            onExpand={() => onExpand(note._id)}
            expanded={expanded[note._id]}
          />
          {expanded[note._id] && (
            <NotesList
              parentNoteId={note._id}
              level={level + 1}
            />
          )}
        </div>
      ))}
    </>
  );
};
