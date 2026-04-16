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
    demo: string;
  };
  demo: {
    metaTitle: string;
    metaDescription: string;
    badge: string;
    headline: string;
    subheadline: string;
    disclaimer: string;
    form: {
      companyName: string;
      companyPlaceholder: string;
      website: string;
      websitePlaceholder: string;
      sell: string;
      sellPlaceholder: string;
      language: string;
      tone: string;
      toneFriendly: string;
      toneDirect: string;
      toneSharp: string;
      langEt: string;
      langEn: string;
      langRu: string;
      presetsTitle: string;
      presetEnergy: string;
      presetAgency: string;
      presetSaas: string;
      presetLocal: string;
      presetIndustrial: string;
      presetSupplier: string;
      scenario: string;
      scenarioHint: string;
      scenarioClear: string;
      run: string;
      running: string;
    };
    processing: {
      title: string;
      badge: string;
      step1: string;
      step2: string;
      step3: string;
      step4: string;
      step5: string;
      step6: string;
    };
    results: {
      snapshot: string;
      industry: string;
      summary: string;
      detectedLang: string;
      region: string;
      confidence: string;
      pain: string;
      web: string;
      opportunities: string;
      whyFit: string;
      angle: string;
      email: string;
      subject: string;
      body: string;
      regenerate: string;
      tryTone: string;
      score: string;
      scoreNote: string;
      campaign: string;
      campStatus: string;
      campLang: string;
      campType: string;
      campReady: string;
      workflow: string;
      stageAnalyze: string;
      stageEnrich: string;
      stageCompose: string;
      stageApprove: string;
      stageSend: string;
    };
    empty: {
      title: string;
      text: string;
    };
    error: {
      title: string;
      text: string;
      retry: string;
      /** Shown when AI service is not configured/available. */
      aiUnavailable: string;
      aiFailed: string;
    };
    cta: {
      title: string;
      text: string;
      primary: string;
      secondary: string;
    };
  };
  marketing: {
    headline: string;
    subheadline: string;
    primaryCta: string;
    secondaryCta: string;
    ui: {
      badge: string;
      heroCtaHint: string;
      /** Hero button prefix, e.g. "Start · Demo" / "Launch · Demo" */
      heroLaunchVerb: string;
      /** Short hero microcopy under CTAs */
      heroMicrocopy: string;
      featuresSubtitle: string;
      featureCardKicker: string;
      heroSurfaceTitle: string;
      heroSurfaceFlowShort: string;
      heroCoreTitle: string;
      heroCoreRule: string;
      heroConfidenceGate: string;
      heroCoreLegendMeta: string;
      heroCoreLegendHint: string;
      heroSignalsTitle: string;
      heroEnrichmentTitle: string;
      heroOutreachTitle: string;
      heroSubjectLabel: string;
      heroCtaLabel: string;
      heroCtaValue: string;
      heroSignalsToDraft: string;
      heroSignalProvenance: string;
      heroSignalRouting: string;
      heroContextLabel: string;
      heroMessageLabel: string;
      heroVerifiedLabel: string;
      heroFlagshipWorkflow: string;
      heroOutputPreview: string;
      heroFlagshipAccess: string;
      heroSignalBackedOutput: string;
      heroWorkflowLabel: string;
      heroWorkflowChain: string;
      modulesKicker: string;
      modulesBadge: string;
      modulesSelectTitle: string;
      modulesActiveLabel: string;
      modulesOutputTitle: string;
      modulesVerifiedPath: string;
      modulesLiveLabel: string;
      modulesConfidence: string;
      modulesPersonalizationDepth: string;
      modulesRisk: string;
      modulesTimeToDraft: string;
      modulesHigh: string;
      modulesLow: string;
      productPreview: {
        windowTitle: string;
        tabLeads: string;
        tabEnrich: string;
        tabCompose: string;
        tabCampaign: string;
        tableCompany: string;
        tableDomain: string;
        tableMatch: string;
        tableStatus: string;
        row1Name: string;
        row1Domain: string;
        row1Score: string;
        row1Status: string;
        row2Name: string;
        row2Domain: string;
        row2Score: string;
        row2Status: string;
        enrichPanelTitle: string;
        enrichLabelIndustry: string;
        enrichLabelIcp: string;
        enrichLabelAngle: string;
        enrichValueIndustry: string;
        enrichValueIcp: string;
        enrichValueAngle: string;
        enrichConfidence: string;
        composePanelTitle: string;
        generating: string;
        subjectLine: string;
        bodySample: string;
        campaignPanelTitle: string;
        campaignName: string;
        campaignState: string;
        campaignProgress: string;
      };
      trust: {
        title: string;
        subtitle: string;
        stat1Label: string;
        stat1Value: string;
        stat2Label: string;
        stat2Value: string;
        stat3Label: string;
        stat3Value: string;
        badge1: string;
        badge2: string;
        badge3: string;
      };
      opsStrip: {
        title: string;
        subtitle: string;
        activity1: string;
        activity2: string;
        activity3: string;
      };
      dashboard: {
        title: string;
        live: string;
        kpis: { leads: string; enriched: string; replyRate: string };
        pipeline: string;
        last7Days: string;
      };
      signals: { leadVelocity: string; enrichmentMatch: string; replyLift: string };
      footerTagline: string;
    };
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
    details: {
      enrichmentTitle: string;
      statusLabel: string;
      scoreAction: string;
      enrichAction: string;
      leadScoreTitle: string;
      noScoreYet: string;
      companyProfileTitle: string;
      sourceLabel: string;
      noEnrichmentYet: string;
      relatedCampaignsTitle: string;
      relatedCampaignsSubtitle: string;
      none: string;
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
      actions: { search: string; saveSelected: string; selectAll: string; selectNone: string; next: string; prev: string };
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
  common: {
    save: string;
    cancel: string;
    close: string;
    loading: string;
    copy: string;
    requestId: string;
    selectAll: string;
    selectNone: string;
    filter: string;
    search: string;
    none: string;
  };
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

