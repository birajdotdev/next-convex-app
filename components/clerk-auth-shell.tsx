"use client";

import { Spinner } from "@/components/ui/spinner";
import { ClerkLoaded, ClerkLoading } from "@clerk/nextjs";
import { PropsWithChildren } from "react";

export function ClerkAuthShell({ children }: PropsWithChildren) {
  return (
    <>
      <ClerkLoading>
        <div className="bg-muted flex w-full flex-1 items-center justify-center">
          <Spinner className="size-10 text-primary" />
        </div>
      </ClerkLoading>
      <ClerkLoaded>{children}</ClerkLoaded>
    </>
  );
}
