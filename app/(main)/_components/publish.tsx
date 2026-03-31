import { Doc } from "@/convex/_generated/dataModel";
import { useOrigin } from "@/hooks/use-origin";
import {
  PopoverTrigger,
  PopoverContent,
  Popover,
} from "@/components/ui/popover";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Check, Copy, Globe } from "lucide-react";

interface PublishProps {
  initialData: Doc<"notes">;
}

export const Publish = ({ initialData }: PublishProps) => {
  const origin = useOrigin();
  const updateNote = useMutation(api.notes.updateNote);

  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const url = `${origin}/preview/${initialData._id}`;

  const onPublish = () => {
    setIsSubmitting(true);
    const promise = updateNote({
      id: initialData._id,
      isPublished: true,
    }).finally(() => setIsSubmitting(false));

    toast.promise(promise, {
      loading: "Publishing note...",
      success: "Note published successfully!",
      error: "Failed to publish note!",
    });
  };

  const onUnpublish = () => {
    setIsSubmitting(true);
    const promise = updateNote({
      id: initialData._id,
      isPublished: false,
    }).finally(() => setIsSubmitting(false));

    toast.promise(promise, {
      loading: "Unpublishing note...",
      success: "Note unpublished successfully!",
      error: "Failed to unpublish note!",
    });
  };

  const onCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm">
          Publish
          {initialData.isPublished && (
            <Globe className="h-4 w-4 ml-2 text-sky-500" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end" alignOffset={8} forceMount>
        {initialData.isPublished ? (
          <div className="space-y-4">
            <div className="flex items-center gap-x-2">
              <Globe className="h-4 w-4 text-sky-500 animate-pulse" />
              <p className="text-sm font-medium text-sky-500">
                This note is live
              </p>
            </div>
            <div className="flex items-center">
              <input
                value={url}
                disabled
                className="flex-1 px-2 text-xs border rounded-l-md h-8 bg-muted truncate"
              />
              <Button
                disabled={copied}
                className="h-8 rounded-l-none"
                onClick={onCopy}
                size="sm"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Button
              size="sm"
              className="w-full text-xs"
              disabled={isSubmitting}
              onClick={onUnpublish}
            >
              Unpublish
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <Globe className="h-8 w-8 mb-2 text-muted-foreground" />
            <p className="text-sm font-medium mb-2">Publish this note</p>
            <span className="text-xs text-muted-foreground mb-4">
              Share your note with the world
            </span>
            <Button
              disabled={isSubmitting}
              className="w-full text-xs"
              onClick={onPublish}
              size="sm"
            >
              Publish
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
