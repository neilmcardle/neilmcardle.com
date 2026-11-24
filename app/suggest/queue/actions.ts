"use server";

import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { monthSpend } from "@/lib/suggest/budget";
import { runToken } from "@/lib/suggest/buildState";
import { transitionSuggestion } from "@/lib/suggest/transition";
import {
  isOwner,
  OWNER_COOKIE,
  OWNER_COOKIE_MAX_AGE,
  ownerToken,
  passwordMatches,
} from "@/lib/suggest/owner";
import { hit } from "@/lib/rateLimit";

const QUEUE = "/suggest/queue";
const REPO = "neilmcardle/neilmcardle.com";
const WORKFLOW = "suggest-build.yml";

const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const MAX_ATTEMPTS_PER_DAY = 30;

export async function unlock(formData: FormData) {
  const list = await headers();
  const ip =
    list.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    list.get("x-real-ip") ||
    "unknown";
  const [perIp, daily] = await Promise.all([
    hit(`suggest-unlock:${ip}`, MAX_ATTEMPTS, ATTEMPT_WINDOW_MS),
    hit("suggest-unlock:day", MAX_ATTEMPTS_PER_DAY, 24 * 60 * 60 * 1000),
  ]);
  if (!perIp.allowed || !daily.allowed) {
    redirect(`${QUEUE}?error=wait`);
  }
  const submitted = formData.get("password");
  const token = await ownerToken();
  if (
    !token ||
    typeof submitted !== "string" ||
    !(await passwordMatches(submitted))
  ) {
    redirect(`${QUEUE}?error=1`);
  }
  (await cookies()).set(OWNER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: OWNER_COOKIE_MAX_AGE,
    path: "/suggest",
  });
  redirect(QUEUE);
}

export async function lock() {
  (await cookies()).delete({ name: OWNER_COOKIE, path: "/suggest" });
  redirect(QUEUE);
}

async function requireOwner() {
  if (!(await isOwner())) redirect(QUEUE);
}

async function dispatch(
  id: string,
  request: string,
  started: string,
): Promise<string | null> {
  const token = process.env.SUGGEST_GITHUB_TOKEN;
  if (!token) return "SUGGEST_GITHUB_TOKEN is not set.";
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/actions/workflows/${WORKFLOW}/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({
        ref: "main",
        inputs: { id, request, started },
      }),
    },
  );
  if (res.ok) return null;
  return `GitHub refused the build (${res.status}).`;
}

export async function build(id: string) {
  await requireOwner();

  const budget = await monthSpend();
  if (!budget.canBuild) {
    redirect(`${QUEUE}?cap=1`);
  }

  const row = await transitionSuggestion(id, "build", {
    buildStartedAt: new Date(),
    note: null,
    prUrl: null,
  });

  if (row) {
    const error = await dispatch(
      row.id,
      row.request,
      runToken(row.buildStartedAt),
    );
    if (error) {
      await transitionSuggestion(row.id, "dispatch_failed", { note: error });
    }
  }
  revalidatePath(QUEUE);
}

export async function reject(id: string) {
  await requireOwner();
  await transitionSuggestion(id, "reject");
  revalidatePath(QUEUE);
}

export async function markLive(id: string) {
  await requireOwner();
  await transitionSuggestion(id, "go_live", { liveAt: new Date() });
  revalidatePath(QUEUE);
  revalidatePath("/suggest");
}

export async function stop(id: string) {
  await requireOwner();
  await transitionSuggestion(id, "stop", { note: "Stopped by hand." });
  revalidatePath(QUEUE);
}
