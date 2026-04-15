import { Locale, MembershipRole, MembershipStatus } from "@prisma/client";

import { prisma } from "@/lib/db";

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 32);
}

function randomSuffix() {
  return Math.random().toString(36).slice(2, 8);
}

async function generateWorkspaceSlug(base: string) {
  const candidateBase = slugify(base) || "workspace";
  for (let i = 0; i < 10; i++) {
    const slug = i === 0 ? candidateBase : `${candidateBase}-${randomSuffix()}`;
    const exists = await prisma.workspace.findUnique({ where: { slug } });
    if (!exists) return slug;
  }
  return `${candidateBase}-${Date.now().toString(36)}`;
}

export async function ensureProvisionedUser(params: {
  supabaseUserId: string;
  email: string;
  preferredLocale?: Locale;
}) {
  const preferredLocale = params.preferredLocale ?? Locale.ET;

  return prisma.$transaction(async (tx) => {
    const user =
      (await tx.user.findUnique({ where: { id: params.supabaseUserId } })) ??
      (await tx.user.create({
        data: {
          id: params.supabaseUserId,
          email: params.email,
        },
      }));

    const profile =
      (await tx.userProfile.findUnique({ where: { userId: user.id } })) ??
      (await tx.userProfile.create({
        data: { userId: user.id, locale: preferredLocale },
      }));

    // If profile exists but locale is nullish/old default, keep as-is (user may have chosen).
    // We only set locale on create to avoid surprising updates.
    const membership = await tx.workspaceMember.findFirst({
      where: {
        userId: user.id,
        status: MembershipStatus.ACTIVE,
      },
      include: { workspace: true },
    });

    if (membership?.workspace) {
      return { user, profile, workspace: membership.workspace };
    }

    const baseName = params.email.split("@")[0] || "Workspace";
    const slug = await generateWorkspaceSlug(baseName);

    const workspace = await tx.workspace.create({
      data: {
        name: `${baseName} Workspace`,
        slug,
        ownerId: user.id,
        members: {
          create: {
            userId: user.id,
            role: MembershipRole.OWNER,
            status: MembershipStatus.ACTIVE,
          },
        },
        settings: {
          create: {
            businessName: baseName,
            languagesToUse: [preferredLocale],
            preferredOutreachLanguage: preferredLocale,
          },
        },
      },
    });

    await tx.activityLog.create({
      data: {
        workspaceId: workspace.id,
        actorUserId: user.id,
        entityType: "WORKSPACE",
        entityId: workspace.id,
        action: "workspace.created",
        metadata: { source: "auto_provision" },
      },
    });

    return { user, profile, workspace };
  });
}

