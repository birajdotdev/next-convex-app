"use client";

import { PropsWithChildren } from "react";

import { ClerkLoaded, ClerkLoading } from "@clerk/nextjs";

import { Spinner } from "@/components/ui/spinner";

export function ClerkAuthShell({ children }: PropsWithChildren) {
  return (
    <>
      <ClerkLoading>
        <div className="bg-muted flex w-full flex-1 items-center justify-center">
          <Spinner className="text-primary size-10" />
        </div>
      </ClerkLoading>
      <ClerkLoaded>{children}</ClerkLoaded>
    </>
  );
}
