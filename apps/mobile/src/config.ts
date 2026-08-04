const DEFAULT_API_URL = "https://api.neurodyne.dev";

export const API_URL = (process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL).replace(/\/$/, "");
export const WEBSITE_URL = "https://neurodyne.dev";
export const PRIVACY_URL = `${WEBSITE_URL}/privacy`;
export const TERMS_URL = `${WEBSITE_URL}/terms`;
export const ACCOUNT_DELETION_URL = `${WEBSITE_URL}/account-deletion`;
export const SUPPORT_URL = `${WEBSITE_URL}/help`;
export const REGISTER_URL = "https://client.neurodyne.dev/register";
export const BILLING_URL = "https://client.neurodyne.dev/billing";
