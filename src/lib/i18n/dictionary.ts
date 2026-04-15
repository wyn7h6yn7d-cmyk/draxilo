import type { Locale } from "./types";

export type Dictionary = {
  app: { name: string };
  nav: {
    login: string;
    signup: string;
    signout: string;
    dashboard: string;
    leads: string;
    campaigns: string;
    jobs: string;
    settings: string;
  };
  marketing: {
    headline: string;
    subheadline: string;
    primaryCta: string;
    secondaryCta: string;
    sections: {
      howItWorks: {
        title: string;
        steps: {
          find: { title: string; text: string };
          enrich: { title: string; text: string };
          write: { title: string; text: string };
          send: { title: string; text: string };
        };
      };
      features: {
        title: string;
        items: {
          sources: { title: string; text: string };
          dedupe: { title: string; text: string };
          enrichment: { title: string; text: string };
          messages: { title: string; text: string };
          campaigns: { title: string; text: string };
          tracking: { title: string; text: string };
        };
      };
      multilingual: {
        title: string;
        text: string;
        bullets: { ui: string; outreach: string; defaults: string };
      };
      faq: {
        title: string;
        items: {
          dataSources: { q: string; a: string };
          deliverability: { q: string; a: string };
          languages: { q: string; a: string };
          security: { q: string; a: string };
          pricing: { q: string; a: string };
        };
      };
      footerCta: {
        title: string;
        text: string;
        primary: string;
        secondary: string;
      };
    };
  };
  auth: {
    login: { title: string; subtitle: string; action: string; noAccount: string; forgot: string };
    signup: { title: string; subtitle: string; action: string; haveAccount: string };
    forgot: {
      title: string;
      subtitle: string;
      action: string;
      backToLogin: string;
      sent: string;
    };
    fields: { email: string; password: string };
  };
  onboarding: {
    title: string;
    subtitle: string;
    steps: {
      basics: { title: string; subtitle: string };
      targeting: { title: string; subtitle: string };
      advanced: { title: string; subtitle: string };
    };
    fields: {
      businessName: string;
      websiteUrl: string;
      whatYouSell: string;
      targetCustomerDescription: string;
      industries: string;
      countries: string;
      languagesToUse: string;
      offerType: string;
      callToAction: string;
      tonePreference: string;
      preferredOutreachLanguage: string;
      targetCompanySize: string;
      targetRoles: string;
      avoidIndustries: string;
      idealCustomerExamples: string;
    };
    placeholders: {
      businessName: string;
      websiteUrl: string;
      whatYouSell: string;
      targetCustomerDescription: string;
      industries: string;
      countries: string;
      offerType: string;
      callToAction: string;
      tonePreference: string;
      preferredOutreachLanguage: string;
      targetCompanySize: string;
      targetRoles: string;
      avoidIndustries: string;
      idealCustomerExamples: string;
    };
    actions: { next: string; back: string; skip: string; finish: string };
  };
  dashboard: {
    title: string;
    subtitle: string;
    onboarding: { title: string; subtitle: string; cta: string };
    kpis: {
      totalLeads: string;
      enrichedLeads: string;
      activeCampaigns: string;
      sentEmails: string;
      replies: string;
      replyRate: string;
    };
    ctas: {
      title: string;
      subtitle: string;
      leadSearch: { title: string; subtitle: string; action: string };
      csvImport: { title: string; subtitle: string; action: string };
      createCampaign: { title: string; subtitle: string; action: string };
    };
    topIndustries: { title: string; subtitle: string; empty: string };
    topCountries: { title: string; subtitle: string; empty: string };
    recentLeads: {
      title: string;
      subtitle: string;
      empty: string;
      columns: { company: string; email: string; enrichment: string };
    };
    recentCampaigns: { title: string; subtitle: string; empty: string; leadsCount: string };
    recentActivity: { title: string; subtitle: string; empty: string };
  };
  leads: {
    title: string;
    empty: { title: string; description: string; primaryCta: string; secondaryCta: string };
    csvImport: {
      title: string;
      pageTitle: string;
      pageSubtitle: string;
      downloadSample: string;
      steps: { upload: string; mapping: string; preview: string };
      upload: { title: string; subtitle: string; dropHere: string; utf8Hint: string; chooseFile: string };
      mapping: { title: string; subtitle: string; skip: string };
      preview: { title: string; subtitle: string };
      actions: { back: string; preview: string; import: string };
      errors: { parseFailed: string; noHeaders: string; mappingRequired: string };
      fields: {
        company_name: string;
        domain: string;
        website: string;
        email: string;
        country: string;
        city: string;
        notes: string;
        first_name: string;
        last_name: string;
        role: string;
      };
    };
    table: {
      name: string;
      email: string;
      company: string;
      domain: string;
      status: string;
      source: string;
      updated: string;
    };
    search: {
      title: string;
      subtitle: string;
      tabs: { publicWeb: string; csv: string };
      providerNotConfigured: string;
      form: {
        keyword: string;
        industry: string;
        country: string;
        cityOrRegion: string;
        companySize: string;
        language: string;
        mustHaveWords: string;
        excludeWords: string;
      };
      placeholders: {
        keyword: string;
        industry: string;
        country: string;
        cityOrRegion: string;
        companySize: string;
        mustHaveWords: string;
        excludeWords: string;
      };
      actions: { search: string; saveSelected: string; next: string; prev: string };
      results: {
        title: string;
        selectedCount: string;
        empty: string;
        columns: {
          company: string;
          domain: string;
          location: string;
          snippet: string;
          confidence: string;
        };
      };
      csv: {
        title: string;
        subtitle: string;
        upload: string;
        hint: string;
      };
    };
  };
  campaigns: {
    title: string;
    empty: { title: string; description: string; primaryCta: string };
    table: { name: string; status: string; leads: string; sent: string; replies: string; updated: string };
  };
  settings: {
    title: string;
    subtitle: string;
    tabs: {
      profile: string;
      workspace: string;
      localization: string;
      emailSending: string;
      ai: string;
      dataPrivacy: string;
    };
    profile: {
      title: string;
      subtitle: string;
      name: string;
      locale: string;
      timezone: string;
    };
    workspace: {
      title: string;
      subtitle: string;
      workspaceName: string;
      website: string;
      offerSummary: string;
      callToAction: string;
      targetCustomerProfile: string;
      allowedOutreachLanguages: string;
      allowedOutreachHint: string;
    };
    localization: {
      title: string;
      subtitle: string;
      uiLanguage: string;
      uiLanguageHint: string;
      defaultOutreachLanguage: string;
    };
    email: {
      domainStatusTitle: string;
      domainStatusSubtitle: string;
      domainStatusPlaceholder: string;
      providerStatusTitle: string;
      providerStatusSubtitle: string;
      providerConfigured: string;
      providerMissing: string;
    };
    ai: {
      title: string;
      subtitle: string;
      defaultTone: string;
      defaultLength: string;
      lengthUnset: string;
      lengthShort: string;
      lengthMedium: string;
      extraInstruction: string;
      extraInstructionPlaceholder: string;
    };
    privacy: {
      exportTitle: string;
      exportSubtitle: string;
      exportPlaceholder: string;
      deleteTitle: string;
      deleteSubtitle: string;
      deletePlaceholder: string;
    };
  };
  common: { save: string; cancel: string; close: string; loading: string };
  errors: { generic: string; unauthorized: string };
  emptyStates: { comingSoon: string };
  toasts: { saved: string; updated: string; error: string };
  theme: { light: string; dark: string; system: string };
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  switch (locale) {
    case "en":
      return (await import("./dictionaries/en")).en;
    case "ru":
      return (await import("./dictionaries/ru")).ru;
    case "et":
    default:
      return (await import("./dictionaries/et")).et;
  }
}

