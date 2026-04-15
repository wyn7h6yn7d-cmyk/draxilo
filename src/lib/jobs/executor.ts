import { JobStatus, JobType } from "@prisma/client";
import { createHash } from "crypto";

import { prisma } from "@/lib/db";

export type JobRunHandler<TPayload, TResult> = (ctx: { jobRunId: string; payload: TPayload }) => Promise<TResult>;

function hashPayload(payload: unknown) {
  const json = JSON.stringify(payload ?? null);
  return createHash("sha256").update(json).digest("hex").slice(0, 32);
}

export async function runJob<TPayload extends object, TResult>(params: {
  workspaceId: string;
  triggeredById?: string | null;
  type: JobType;
  payload: TPayload;
  dedupeKey?: string;
  maxAttempts?: number;
  link?: { leadSearchId?: string; csvImportId?: string; campaignId?: string; providerConfigId?: string };
  handler: JobRunHandler<TPayload, TResult>;
}) {
  const dedupeKey = params.dedupeKey ?? `${params.type}:${hashPayload(params.payload)}`;
  const maxAttempts = params.maxAttempts ?? 3;

  // Create or fetch existing job (idempotent by unique key).
  const job =
    (await prisma.jobRun
      .create({
        data: {
          workspaceId: params.workspaceId,
          type: params.type,
          status: JobStatus.PENDING,
          triggeredById: params.triggeredById ?? null,
          dedupeKey,
          attempts: 0,
          maxAttempts,
          payload: params.payload as any,
          ...params.link,
        },
      })
      .catch(async (e) => {
        // Unique violation: fetch existing job
        const existing = await prisma.jobRun.findFirst({
          where: { workspaceId: params.workspaceId, type: params.type, dedupeKey },
        });
        if (!existing) throw e;
        return existing;
      })) ?? null;

  if (!job) throw new Error("Failed to create job");

  // Prevent duplicate runs: only one caller may transition to RUNNING.
  // If it's already RUNNING or COMPLETE, return it.
  if (job.status === JobStatus.RUNNING || job.status === JobStatus.COMPLETE) {
    return { ok: true as const, jobRunId: job.id, status: job.status, result: job.result as TResult | null };
  }

  const claimed = await prisma.jobRun.updateMany({
    where: {
      id: job.id,
      workspaceId: params.workspaceId,
      status: { in: [JobStatus.PENDING, JobStatus.FAILED] },
      attempts: { lt: maxAttempts },
    },
    data: {
      status: JobStatus.RUNNING,
      attempts: { increment: 1 },
      maxAttempts,
      startedAt: new Date(),
      error: null,
      payload: params.payload as any,
    },
  });

  if (claimed.count === 0) {
    const fresh = await prisma.jobRun.findUnique({ where: { id: job.id } });
    return {
      ok: true as const,
      jobRunId: job.id,
      status: fresh?.status ?? job.status,
      result: (fresh?.result ?? null) as TResult | null,
      error: fresh?.error ?? null,
    };
  }

  try {
    const result = await params.handler({ jobRunId: job.id, payload: params.payload });
    await prisma.jobRun.update({
      where: { id: job.id },
      data: {
        status: JobStatus.COMPLETE,
        finishedAt: new Date(),
        result: result as any,
        error: null,
      },
    });
    return { ok: true as const, jobRunId: job.id, status: JobStatus.COMPLETE, result };
  } catch (e: any) {
    await prisma.jobRun.update({
      where: { id: job.id },
      data: {
        status: JobStatus.FAILED,
        finishedAt: new Date(),
        error: e?.message ?? "Job failed",
      },
    });
    return { ok: false as const, jobRunId: job.id, status: JobStatus.FAILED, error: e?.message ?? "Job failed" };
  }
}

