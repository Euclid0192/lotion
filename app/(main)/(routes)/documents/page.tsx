"use client";

import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const DocumentsPage = () => {
  const { user } = useUser();
  if (!user) {
    return redirect("/");
  }

  return (
    <div className="h-full flex flex-col items-center justify-center space-y-4">
      <Image
        src="/empty.jpg"
        alt="Empty"
        width="300"
        height="300"
        className="dark:hidden"
      />
      <Image
        src="/paper-dark.png"
        alt="Empty"
        width="300"
        height="300"
        className="hidden dark:block"
      />
      <h2 className="text-lg font-medium">
        Welcome to {user.firstName}&apos;s Lotion!
      </h2>
      <Button>
        <PlusCircle className="h-4 w-4 mr-2" />
        Create your first note
      </Button>
    </div>
  );
};

export default DocumentsPage;
