import { Skeleton } from "@/components/ui/skeleton";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import {
  Archive,
  ChevronDown,
  ChevronRight,
  LucideIcon,
  MoreHorizontal,
  Plus,
  Trash,
} from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface ItemProps {
  id?: Id<"notes">;
  documentIcon?: string;
  active?: boolean;
  expanded?: boolean;
  isSearch?: boolean;
  level?: number;
  onExpand?: () => void;
  label: string;
  onClick: () => void;
  icon: LucideIcon;
}

const SidebarItem = ({
  label,
  onClick,
  icon: Icon,
  id,
  documentIcon,
  active,
  expanded,
  isSearch,
  level = 0,
  onExpand,
}: ItemProps) => {
  const ChevronIcon = expanded ? ChevronDown : ChevronRight;
  const createNewNote = useMutation(api.notes.createNewNote);
  const { user } = useUser();
  const archiveNote = useMutation(api.notes.archiveNote);
  const deleteNote = useMutation(api.notes.deleteNote);
  const router = useRouter();

  const handleExpand = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    onExpand?.();
  };

  const handleCreate = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    if (!id) return;

    const promise = createNewNote({
      title: "Untitled",
      parentNote: id,
    }).then((noteId) => {
      if (!noteId) return;

      if (!expanded) {
        onExpand?.();
      }

      router.push(`/notes/${noteId}`);
    });

    toast.promise(promise, {
      loading: "Creating new note...",
      success: "Note created successfully",
      error: "Failed to create a new note",
    });
  };

  const handleDelete = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    if (!id) return;

    const promise = deleteNote({ id }).then(() => {
      router.push("/notes");
    });

    toast.promise(promise, {
      loading: "Deleting note...",
      success: "Note deleted successfully",
      error: "Failed to delete note",
    });
  };

  const handleArchive = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    if (!id) return;

    const promise = archiveNote({ id }).then(() => {
      router.push("/notes");
    });

    toast.promise(promise, {
      loading: "Moving to trash...",
      success: "Note moved to trash successfully",
      error: "Failed to archive note!",
    });
  };

  return (
    <div
      onClick={onClick}
      role="button"
      style={{ paddingLeft: `${level * 12 + 12}px` }}
      className={cn(
        "group min-h-[27px] text-sm py-1 pr-3 w-full flex items-center text-muted-foreground font-medium hover:bg-primary/5",
        active && "bg-primary/5 text-primary",
      )}
    >
      {!!id && (
        <div
          role="button"
          className="h-full rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 mr-1"
          onClick={handleExpand}
        >
          <ChevronIcon className="h-4 w-4 shrink-0 text-muted-foreground/50" />
        </div>
      )}
      {documentIcon ? (
        <div className="shrink-0 mr-2 text-[18px]">{documentIcon}</div>
      ) : (
        <Icon className="shrink-0 h-[18px] mr-2 text-muted-foreground" />
      )}
      <span className="truncate">{label}</span>
      {isSearch && (
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">Ctrl +</span>K
        </kbd>
      )}
      {!!id && (
        <div className="ml-auto flex items-center gap-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <div
                role="button"
                className="opacity-0 group-hover:opacity-100 h-full ml-auto rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600"
              >
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-60"
              side="right"
              align="start"
              forceMount
            >
              <DropdownMenuItem onClick={handleDelete}>
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleArchive}>
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="text-xs text-muted-foreground p-2">
                Last edited by: {user?.fullName}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <div
            className="opacity-0 group-hover/sidebar:opacity-100 h-full ml-auto rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600"
            role="button"
            onClick={handleCreate}
          >
            <Plus className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      )}
    </div>
  );
};

SidebarItem.Skeleton = function SidebarItemSkeleton({
  level,
}: {
  level: number;
}) {
  return (
    <div
      style={{
        paddingLeft: level ? `${level * 12 + 25}px` : "12px",
      }}
      className="flex gap-x-2 py-[3px]"
    >
      <Skeleton className="h-4 w-4" />
      <Skeleton className="h-4 w[30%]" />
    </div>
  );
};

export default SidebarItem;
