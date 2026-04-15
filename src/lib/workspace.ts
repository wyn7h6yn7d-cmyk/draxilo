import { MembershipStatus } from "@prisma/client";

import { prisma } from "@/lib/db";

export async function getActiveWorkspaceForUser(userId: string) {
  const membership = await prisma.workspaceMember.findFirst({
    where: { userId, status: MembershipStatus.ACTIVE },
    include: { workspace: { include: { settings: true } } },
    orderBy: { createdAt: "asc" },
  });
  return membership?.workspace ?? null;
}

