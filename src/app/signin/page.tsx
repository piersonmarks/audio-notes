"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";

export default function SignInPage() {
  const { signIn } = useAuthActions();
  const [step, setStep] = useState<"email" | { email: string }>("email");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (step === "email") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-full max-w-sm space-y-6 px-4">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold tracking-tight">Audio Notes</h1>
            <p className="text-sm text-muted-foreground">
              Enter your email to receive a sign-in code.
            </p>
          </div>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setError(null);
              setLoading(true);
              const formData = new FormData(e.currentTarget);
              const email = formData.get("email") as string;
              signIn("resend-otp", formData)
                .then(() => setStep({ email }))
                .catch(() => setError("Failed to send code. Try again."))
                .finally(() => setLoading(false));
            }}
          >
            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />
              {error && <FieldError>{error}</FieldError>}
            </Field>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send code"}
            </Button>
            <Button variant="ghost" className="w-full" asChild>
              <a href="/">Back to home</a>
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 px-4">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
          <p className="text-sm text-muted-foreground">
            We sent a code to {step.email}
          </p>
        </div>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            setLoading(true);
            const formData = new FormData(e.currentTarget);
            signIn("resend-otp", formData)
              .catch(() => setError("Invalid code. Try again."))
              .finally(() => setLoading(false));
          }}
        >
          <input name="email" type="hidden" value={step.email} />
          <input name="redirectTo" type="hidden" value="/app" />
          <Field>
            <FieldLabel>Verification code</FieldLabel>
            <Input
              name="code"
              type="text"
              inputMode="numeric"
              placeholder="Enter 8-digit code"
              required
              autoFocus
              className="text-center tracking-widest"
            />
            {error && <FieldError>{error}</FieldError>}
          </Field>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Verifying..." : "Verify"}
          </Button>
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setError(null);
            }}
            className="w-full text-sm text-muted-foreground hover:underline"
          >
            Use a different email
          </button>
        </form>
      </div>
    </div>
  );
}
