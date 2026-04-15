import { PrismaClient, CampaignLeadStatus, LeadSourceType, Locale, MessageVariantPurpose } from '@prisma/client';
import { createHash, randomBytes } from 'node:crypto';

const prisma = new PrismaClient();

function sha256Base64(input: string) {
  return createHash('sha256').update(input).digest('base64');
}

function normalizeEmail(email?: string | null) {
  if (!email) return null;
  return email.trim().toLowerCase();
}

function normalizeDomain(domainOrUrl?: string | null) {
  if (!domainOrUrl) return null;
  const raw = domainOrUrl.trim().toLowerCase();
  // Very small MVP normalizer (no public suffix parsing).
  const withoutProtocol = raw.replace(/^https?:\/\//, '');
  const withoutPath = withoutProtocol.split('/')[0] ?? withoutProtocol;
  return withoutPath.replace(/^www\./, '') || null;
}

async function main() {
  const userEmail = 'demo@leadforge.dev';

  const user = await prisma.user.upsert({
    where: { email: userEmail },
    update: {},
    create: {
      email: userEmail,
      profile: {
        create: {
          locale: Locale.ET,
          fullName: 'Draxion Demo',
          company: 'Draxion',
          title: 'Founder',
        },
      },
    },
  });

  const workspace = await prisma.workspace.upsert({
    where: { slug: 'demo' },
    update: {},
    create: {
      name: 'Demo Workspace',
      slug: 'demo',
      ownerId: user.id,
      members: {
        create: {
          userId: user.id,
          role: 'OWNER',
          status: 'ACTIVE',
        },
      },
    },
  });

  const source = await prisma.leadSource.create({
    data: {
      workspaceId: workspace.id,
      type: LeadSourceType.MANUAL,
      name: 'Seeded demo leads',
      description: 'Seed script demo data',
      input: { seeded: true },
    },
  });

  const company1Domain = normalizeDomain('https://acme.example');
  const company2Domain = normalizeDomain('https://northwind.example');

  const [company1, company2] = await Promise.all([
    prisma.leadCompany.create({
      data: {
        workspaceId: workspace.id,
        name: 'Acme OÜ',
        websiteUrl: 'https://acme.example',
        domain: 'acme.example',
        normalizedDomain: company1Domain,
        industry: 'Manufacturing',
        country: 'EE',
        city: 'Tallinn',
        metadata: { seeded: true },
      },
    }),
    prisma.leadCompany.create({
      data: {
        workspaceId: workspace.id,
        name: 'Northwind AS',
        websiteUrl: 'https://northwind.example',
        domain: 'northwind.example',
        normalizedDomain: company2Domain,
        industry: 'Logistics',
        country: 'EE',
        city: 'Tartu',
        metadata: { seeded: true },
      },
    }),
  ]);

  const contact1Email = 'annika@acme.example';
  const contact2Email = 'ivan@northwind.example';

  const [contact1, contact2] = await Promise.all([
    prisma.leadContact.create({
      data: {
        workspaceId: workspace.id,
        companyId: company1.id,
        firstName: 'Annika',
        lastName: 'Kask',
        title: 'Operations Lead',
        email: contact1Email,
        normalizedEmail: normalizeEmail(contact1Email),
        linkedinUrl: 'https://linkedin.com/in/annika-kask',
        metadata: { seeded: true },
      },
    }),
    prisma.leadContact.create({
      data: {
        workspaceId: workspace.id,
        companyId: company2.id,
        firstName: 'Ivan',
        lastName: 'Petrov',
        title: 'Head of Sales',
        email: contact2Email,
        normalizedEmail: normalizeEmail(contact2Email),
        linkedinUrl: 'https://linkedin.com/in/ivan-petrov',
        metadata: { seeded: true },
      },
    }),
  ]);

  const lead1 = await prisma.lead.create({
    data: {
      workspaceId: workspace.id,
      sourceId: source.id,
      companyId: company1.id,
      contactId: contact1.id,
      displayName: 'Annika Kask',
      email: contact1.email,
      domain: company1.domain,
      normalizedDomain: company1.normalizedDomain,
      normalizedEmail: contact1.normalizedEmail,
      tags: ['demo', 'hot'],
      notes: 'Interested in automating outbound campaigns.',
    },
  });

  const lead2 = await prisma.lead.create({
    data: {
      workspaceId: workspace.id,
      sourceId: source.id,
      companyId: company2.id,
      contactId: contact2.id,
      displayName: 'Ivan Petrov',
      email: contact2.email,
      domain: company2.domain,
      normalizedDomain: company2.normalizedDomain,
      normalizedEmail: contact2.normalizedEmail,
      tags: ['demo'],
      notes: 'Likely responsive to RU outreach.',
    },
  });

  const campaign = await prisma.campaign.create({
    data: {
      workspaceId: workspace.id,
      createdById: user.id,
      name: 'Demo Outreach',
      status: 'DRAFT',
      objective: 'Book 3 discovery calls with EE B2B companies',
      localeDefault: Locale.ET,
      fromName: 'Draxion Demo',
      fromEmail: 'demo@leadforge.dev',
      replyToEmail: 'demo@leadforge.dev',
    },
  });

  const [variantEt, variantRu] = await Promise.all([
    prisma.messageVariant.create({
      data: {
        workspaceId: workspace.id,
        campaignId: campaign.id,
        purpose: MessageVariantPurpose.INITIAL,
        language: Locale.ET,
        subject: 'Kiire küsimus {{company}} kohta',
        bodyText:
          'Tere {{firstName}}!\n\nNägin, et {{company}} tegutseb {{industry}} valdkonnas. Kas oleks mõistlik 15 min kõne, et näidata, kuidas Draxion aitab leide leida ja personaliseeritud outreach’i automatiseerida?\n\nParimat,\n{{fromName}}',
        aiOutput: { seeded: true },
        model: 'gpt-4o-mini',
        prompt: 'seed',
      },
    }),
    prisma.messageVariant.create({
      data: {
        workspaceId: workspace.id,
        campaignId: campaign.id,
        purpose: MessageVariantPurpose.INITIAL,
        language: Locale.RU,
        subject: 'Короткий вопрос про {{company}}',
        bodyText:
          'Здравствуйте, {{firstName}}!\n\nВижу, что {{company}} работает в сфере {{industry}}. Можно ли созвониться на 15 минут, чтобы показать, как Draxion помогает находить лидов и автоматизировать персонализированный outreach?\n\nС уважением,\n{{fromName}}',
        aiOutput: { seeded: true },
        model: 'gpt-4o-mini',
        prompt: 'seed',
      },
    }),
  ]);

  await prisma.campaignLead.createMany({
    data: [
      {
        workspaceId: workspace.id,
        campaignId: campaign.id,
        leadId: lead1.id,
        status: CampaignLeadStatus.READY,
        language: Locale.ET,
        selectedVariantId: variantEt.id,
      },
      {
        workspaceId: workspace.id,
        campaignId: campaign.id,
        leadId: lead2.id,
        status: CampaignLeadStatus.READY,
        language: Locale.RU,
        selectedVariantId: variantRu.id,
      },
    ],
  });

  // API key example (hashed)
  const rawSecret = randomBytes(24).toString('base64url');
  const prefix = rawSecret.slice(0, 8);
  await prisma.apiKey.create({
    data: {
      workspaceId: workspace.id,
      userId: user.id,
      name: 'Demo API key',
      prefix,
      hash: sha256Base64(rawSecret),
    },
  });

  await prisma.activityLog.create({
    data: {
      workspaceId: workspace.id,
      actorUserId: user.id,
      entityType: 'WORKSPACE',
      entityId: workspace.id,
      action: 'seed.created',
      message: 'Seeded demo workspace and records.',
      metadata: { seeded: true },
    },
  });

  // Print something useful for local dev.
  // eslint-disable-next-line no-console
  console.log('Seeded demo data:', {
    userEmail,
    workspaceSlug: workspace.slug,
    campaignId: campaign.id,
    apiKeyPrefix: prefix,
    apiKeySecret_example: `${prefix}... (stored hashed)`,
  });
}

main()
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

