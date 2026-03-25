"use client";

import { useCoverImage } from "@/hooks/use-cover-image";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { SingleImageDropzone } from "@/components/upload/single-image";
import { useCallback, useState } from "react";
import { useEdgeStore } from "@/lib/edgestore";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { type UploadFn, UploaderProvider } from "../upload/uploader-provider";

const CoverImageModal = () => {
  const { isOpen, onClose: onCloseCoverImage, url } = useCoverImage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { edgestore } = useEdgeStore();
  const updateNote = useMutation(api.notes.updateNote);
  const params = useParams();

  const onClose = () => {
    setIsSubmitting(false);
    onCloseCoverImage();
  };

  const uploadFn: UploadFn = useCallback(
    async ({ file, onProgressChange, signal }) => {
      setIsSubmitting(true);

      const res = await edgestore.publicFiles.upload({
        file,
        signal,
        onProgressChange,
        options: { replaceTargetUrl: url },
      });

      await updateNote({
        id: params.noteId as Id<"notes">,
        coverImage: res.url,
      });

      onClose();
      return res;
    },
    [edgestore, params.noteId, updateNote, url],
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <h2 className="text-center text-lg font-semibold">Cover Image</h2>
        </DialogHeader>
        <UploaderProvider uploadFn={uploadFn} autoUpload>
          <SingleImageDropzone
            className="w-full outline-none"
            disabled={isSubmitting}
            width={200}
            height={200}
          />
        </UploaderProvider>
      </DialogContent>
    </Dialog>
  );
};

export default CoverImageModal;
