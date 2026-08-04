# NeuroDyne mobile store submission

Policy audit date: 4 August 2026. Re-check the linked policies immediately before each submission.

## Product classification

- Product: authenticated client portal for NeuroDyne consulting and software-delivery engagements.
- Audience: adults and business users; not designed for children.
- Ads: none.
- Tracking: none.
- User-generated content: private project messages between a client and the NeuroDyne delivery team; not a public social network.
- Payments: invoices are for professional services consumed outside the app. Payment opens the secure client portal; no digital content or in-app feature is unlocked by payment.
- Authentication: email/password only. There is no Google, Facebook, or other third-party social login, so Sign in with Apple is not applicable.
- Native permissions: none requested by the app. Push notifications are not enabled in this release.

## Store listing copy

### Shared

Name: `NeuroDyne Corp`

Subtitle / short description: `Your project delivery workspace`

Description:

> Keep your NeuroDyne engagement within reach. Review projects and delivery progress, access project documents, follow invoices, exchange private messages with your delivery team, and keep up with account notifications from one secure client workspace.
>
> NeuroDyne Corp is built for existing clients and invited project stakeholders. Sign in with your client portal account, or create an account through the NeuroDyne client portal.
>
> Privacy controls are built in: request a copy of your data or initiate permanent account deletion directly from your profile.

Apple keywords (under 100 characters): `projects,client portal,delivery,documents,invoices,messages,consulting,software`

Support URL: `https://neurodyne.dev/help`

Marketing URL: `https://neurodyne.dev`

Privacy policy URL: `https://neurodyne.dev/privacy`

Privacy choices / account deletion URL: `https://neurodyne.dev/account-deletion`

## App review access

Both stores require a dedicated, non-production-personal review account because all useful functionality is behind login. Before submission:

1. Create `appreview@neurodyne.dev` as an active client with representative projects, documents, invoices, messages, and notifications.
2. Keep the API and its dependencies available throughout review.
3. Put the review email, password, and these instructions in App Store Connect **App Review Information** and Google Play Console **App access**. Never commit the password.
4. Explain that invoice payments cover bespoke professional services delivered outside the app and open the HTTPS client portal.

Suggested review note:

> NeuroDyne Corp is a client portal for professional software and consulting engagements. Sign in with the review credentials provided. The seeded account contains a representative project, invoice, document, message thread, and notifications. Invoice payments relate only to services performed outside the app and open our secure web billing portal; they do not unlock digital app content. Account deletion is available under Profile > Request account deletion.

## Apple App Privacy answers

Declare the following as collected, linked to the user, not used for tracking, and used only for app functionality:

- Contact Info: Name, Email Address.
- Identifiers: User ID.
- User Content: Emails or Text Messages, Other User Content.

Do not declare advertising, analytics, precise/coarse location, contacts, photos, audio, health, or diagnostics unless a later release actually adds collection. Confirm third-party SDK manifests in the generated Xcode privacy report before uploading.

The app config includes a first-party privacy manifest and declares no tracking. Standard HTTPS encryption is marked exempt from export-compliance documentation with `usesNonExemptEncryption: false`.

## Google Play Data safety answers

- Data collected: name, email address, user IDs, and private messages/other user content.
- Purpose: app functionality and account management.
- Data sharing: no sale or sharing with advertisers. Re-check operational subprocessors against the public subprocessor list before answering.
- Data encrypted in transit: yes, production endpoints are HTTPS/WSS.
- Account deletion: yes, in app and at `https://neurodyne.dev/account-deletion`.
- Independent security review: answer only if a qualifying assessment has actually been completed.

Complete these Play Console declarations manually: Data safety, App access, Ads (No), Target audience (18+ / business users), Content rating questionnaire, Privacy policy, Account deletion URL, and Financial features (the app is not a financial-services product).

## Release procedure

1. Confirm `https://api.neurodyne.dev/health`, privacy, terms, help, registration, password reset, billing, and account-deletion URLs are live.
2. Run `pnpm --filter @neurodyne/mobile exec expo install --check`, typecheck, lint, and `pnpm dlx expo-doctor apps/mobile`.
3. Run a clean native prebuild and inspect the generated Android manifest and iOS privacy report for unexpected permissions/data collection.
4. Test login, session restoration, logout, expired-session behavior, project lists, messages, invoices, legal links, data export, and deletion on physical iOS and Android devices.
5. Initialize the EAS project if needed, then run `eas build --platform all --profile production`. EAS remotely increments build numbers.
6. Upload first to TestFlight and Google Play internal testing. Resolve automated privacy/SDK warnings before external testing.
7. Capture current phone and tablet screenshots with no placeholder or private customer data.
8. Submit with the review account and note above; keep the backend live until review completes.

## Console/signing items that cannot be committed

- Active Apple Developer Program and Google Play Console accounts.
- App Store Connect app record, agreements, tax/banking details, category, age rating, territories, and screenshots.
- Apple distribution certificate/profile and Android Play App Signing key.
- EAS project ID and store credential association.
- Dedicated reviewer account password.
- Final legal approval of privacy/terms wording and confirmation of every production subprocessor/data flow.

## Authoritative references

- Apple App Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Apple account deletion: https://developer.apple.com/support/offering-account-deletion-in-your-app/
- Apple app privacy details: https://developer.apple.com/app-store/app-privacy-details/
- Apple privacy manifests: https://developer.apple.com/documentation/bundleresources/privacy-manifest-files
- Google Play User Data policy: https://support.google.com/googleplay/android-developer/answer/10144311
- Google Play account deletion: https://support.google.com/googleplay/android-developer/answer/13327111
- Google Play Data safety: https://support.google.com/googleplay/android-developer/answer/10787469
- Google Play target API requirements: https://developer.android.com/google/play/requirements/target-sdk
