"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useConvexAuth } from "convex/react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/loader";
import { SignInButton } from "@clerk/clerk-react";

const Heading = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-3xl md:text-6xl sm:text-5xl font-bold">
        Your Ideas, Documents, & Plans. Unified. Welcome to{" "}
        <span className="underline">Lotion</span>
      </h1>
      <h3 className="text-base sm:text-xl md:text-2xl font-medium">
        Lotion is the connected workspace where <br /> better, faster work
        happens.
      </h3>
      {isLoading && (
        <div className="w-full flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      )}
      {isAuthenticated && !isLoading && (
        <Button asChild>
          <Link href="/documents">
            Enter Lotion
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      )}
      {!isAuthenticated && !isLoading && (
        <SignInButton mode="modal">
          <Button>
            Get Lotion free
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </SignInButton>
      )}
    </div>
  );
};

export default Heading;
