"use client";

import { useEffect } from "react";
import { CircleAlert, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ConvexError } from "convex/values";
import { ApplicationErrorData } from "@/convex/application_errors";

export default function Error({
  error,
  reset,
}: {
  error: Error & ConvexError<ApplicationErrorData>;
  reset: () => void;
}) {
  useEffect(() => {
    console.error("error getting note", error);
    console.log('error data', error.data)
  }, [error]);

  const router = useRouter();
  const handleGoBack = () => {
    router.push("/notes");
  };

  const errorData = error?.data ? error.data : {
      statusCode: 500,
      message: "Something went wrong",
      data: null,
    };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center gap-6 bg-background px-4 py-12 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <CircleAlert className="size-7" aria-hidden />
      </div>
      <div className="max-w-md space-y-2">
        <h2 className="text-lg font-medium text-foreground">
          {errorData.message}
        </h2>
        <p className="text-sm text-muted-foreground">
          An unexpected error occurred. You can try again, or refresh the page
          if the problem continues.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" onClick={() => reset()}>
          <RefreshCw className="size-4" />
          Try again
        </Button>
        <Button type="button" onClick={handleGoBack}>
          Go back to notes home
        </Button>
      </div>
    </div>
  );
}
