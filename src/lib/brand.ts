export const BRAND_NAME = "Draxion" as const;
export const BRAND_DOMAIN = "draxion.eu" as const;
export const BRAND_SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? `https://${BRAND_DOMAIN}`) as string;
export const BRAND_CONTACT_EMAIL = (process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? `hello@${BRAND_DOMAIN}`) as string;

