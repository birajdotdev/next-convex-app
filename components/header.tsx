"use client";

import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

function AuthButtons({ className }: { className?: string }) {
  const isMobile = useIsMobile();
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <SignedOut>
        <SignInButton>
          <Button variant="ghost" size={isMobile ? "sm" : "default"}>
            Sign In
          </Button>
        </SignInButton>
        <SignUpButton>
          <Button variant="default" size={isMobile ? "sm" : "default"}>
            Sign Up
          </Button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  );
}

export function Header() {
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
