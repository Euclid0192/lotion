"use client";

import ConfirmModal from "@/components/modals/confirm-modal";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface BannerProps {
  noteId: Id<"notes">;
}

const Banner = ({ noteId }: BannerProps) => {
  const router = useRouter();
  const deleteNote = useMutation(api.notes.deleteNote);
  const restoreNote = useMutation(api.notes.restoreNote);

  const onDelete = () => {
    const promise = deleteNote({ id: noteId });

    toast.promise(promise, {
      loading: "Deleting note...",
      success: "Note deleted",
      error: "Failed to delete note",
    });

    router.push("/notes");
  };

  const onRestore = () => {
    const promise = restoreNote({ id: noteId });

    toast.promise(promise, {
      loading: "Restoring note...",
      success: "Note restored",
      error: "Failed to delete note",
    });
  };

  return (
    <div className="w-full bg-rose-500 text-center text-sm p-2 text-whtie flex items-center gap-x-2 justify-center">
      <p>This note is in the Trash</p>
      <Button
        onClick={onRestore}
        variant="outline"
        size="sm"
        className="border-white bg-transparent hover:bg-primary/5 text-white hover:text-white p-1 px-2 h-auto font-normal"
      >
        Restore
      </Button>
      <ConfirmModal onConfirm={onDelete}>
        <Button
          variant="outline"
          size="sm"
          className="border-white bg-transparent hover:bg-primary/5 text-white hover:text-white p-1 px-2 h-auto font-normal"
        >
          Delete forever
        </Button>
      </ConfirmModal>
    </div>
  );
};

export default Banner;
