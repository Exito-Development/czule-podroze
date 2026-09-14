"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import Button from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { Alert } from "@/components/ui/Feedback";
import { ApiError } from "@/lib/api/client";

export default function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [problem, setProblem] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setProblem(null);
    setBusy(true);
    try {
      await signIn(email.trim(), password);
    } catch (exception) {
      setProblem(
        exception instanceof ApiError
          ? exception.message
          : "Nie udało się połączyć z serwerem. Sprawdź, czy API działa."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-serif text-2xl uppercase tracking-[0.2em]">Czuła</p>
          <p className="text-xs uppercase tracking-[0.3em] text-sage-dark">
            Panel organizatorek
          </p>
        </div>

        <form
          onSubmit={submit}
          className="space-y-4 rounded-2xl bg-surface p-6 ring-1 ring-ink/8"
        >
          {problem && <Alert>{problem}</Alert>}

          <TextField
            label="E-mail"
            type="email"
            value={email}
            onChange={setEmail}
            required
          />
          <TextField
            label="Hasło"
            type="password"
            value={password}
            onChange={setPassword}
            required
          />
          <Button type="submit" loading={busy} className="w-full">
            Zaloguj się
          </Button>
        </form>
      </div>
    </main>
  );
}
