"use client";

import Link from "next/link";
import Image from "next/image";
import {
  SignInButton,
  SignUpButton,
  UserButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

function AuthButtons({ className }: { className?: string }) {
  const isMobile = useIsMobile();
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <SignedOut>
        <SignInButton mode="modal">
          <Button variant="ghost" size={isMobile ? "sm" : "default"}>Sign In</Button>
        </SignInButton>
        <SignUpButton mode="modal">
          <Button variant="default" size={isMobile ? "sm" : "default"}>Sign Up</Button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  );
}

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background">
      <nav className="container flex h-14 items-center justify-between px-4 mx-auto max-w-7xl">
        <Link
          href="/"
          className="flex items-center gap-2 font-medium text-foreground hover:text-foreground/80"
        >
          <Image
            src="/convex.svg"
            alt=""
            width={24}
            height={24}
            className="size-6"
          />
          <span className="hidden sm:inline">Next Convex App</span>
        </Link>

        <AuthButtons />
      </nav>
    </header>
  );
}
