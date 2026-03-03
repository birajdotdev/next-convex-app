import { SignIn } from "@clerk/nextjs";
import { ClerkAuthShell } from "@/components/clerk-auth-shell";

export default function SignInPage() {
  return (
    <ClerkAuthShell>
      <div className="bg-muted flex w-full flex-1 items-center justify-center p-6 md:p-10">
        <SignIn />
      </div>
    </ClerkAuthShell>
  );
}
