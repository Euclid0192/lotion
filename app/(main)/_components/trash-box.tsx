import { Spinner } from "@/components/loader";
import ConfirmModal from "@/components/modals/confirm-modal";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Search, Trash, Undo } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const TrashBox = () => {
  const router = useRouter();
  const params = useParams();
  const notes = useQuery(api.notes.getTrash);
  const restoreNote = useMutation(api.notes.restoreNote);
  const deleteNote = useMutation(api.notes.deleteNote);

  const [search, setSearch] = useState("");
  const filteredNotes = notes?.filter((note) =>
    note.title.toLowerCase().includes(search.toLowerCase()),
  );

  const onClick = (noteId: string) => {
    router.push(`/notes/${noteId}`);
  };

  const onRestore = (
    e: React.MouseEvent<HTMLDivElement>,
    noteId: Id<"notes">,
  ) => {
    e.stopPropagation();

    const promise = restoreNote({ id: noteId });
    toast.promise(promise, {
      loading: "Restoring note...",
      success: "Note restored",
      error: "Failed to restore note",
    });
  };

  const onDelete = (noteId: Id<"notes">) => {
    const promise = deleteNote({ id: noteId });
    toast.promise(promise, {
      loading: "Deleting note...",
      success: "Note deleted",
      error: "Failed to delete note",
    });

    if (params.noteId === noteId) {
      router.push("/notes");
    }
  };

  if (!notes) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="text-sm">
      <div className="flex items-center gap-x-1 p-2">
        <Search className="h-4 w-4" />
        <Input
          placeholder="Search note by title"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-7 px-2 focus-visible:ring-transparent bg-secondary"
        />
      </div>

      <div className="mt-2 px-1 pb-1">
        <p className="hidden last:block text-xs text-center text-muted-foreground pb-2">
          No note in trash yet.
        </p>

        {filteredNotes?.map((note) => (
          <div
            key={note._id}
            role="button"
            onClick={() => onClick(note._id)}
            className="text-sm rounded-sm w-full hover:bg-primary/5 flex items-center justify-between text-primary"
          >
            <span className="truncate pl-2">{note.title}</span>
            <div className="flex items-center">
              <div
                onClick={(e) => onRestore(e, note._id)}
                role="button"
                className="rounded-sm p-2 hover:bg-neutral-200 dark:hover:bg-neutral-600"
              >
                <Undo className="h-4 w-4 text-muted-foreground" />
              </div>
              <ConfirmModal onConfirm={() => onDelete(note._id)}>
                <div
                  role="button"
                  className="rounded-sm p-2 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                >
                  <Trash className="h-4 w-4 text-muted-foreground" />
                </div>
              </ConfirmModal>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrashBox;
