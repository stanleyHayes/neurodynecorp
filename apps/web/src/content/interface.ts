export const NEWSLETTER = {
  eyebrow: "Engineering notes",
  title: "One short note. Once a week.",
  description: "Architecture decisions, useful tools and lessons from building Neurodyne.",
  privacy: "No spam. Unsubscribe in one click.",
};
export const PARTNER_INVITATION = {
  eyebrow: "Build with Neurodyne",
  title: "Start a conversation.",
  description: "Explore partnerships, developer collaboration and engineering support.",
  action: "Find your path",
};
export const STANDARDS_AUDIENCES: Record<string, string> = {
  Developers: "Test interfaces against the systems you build.",
  Researchers: "Challenge assumptions and investigate open questions.",
  Universities: "Connect teaching and research with shared standards.",
  Government: "Bring institutional requirements to the design.",
  Companies: "Review the standards against operational needs.",
  Students: "Explore the ideas and learn how the pieces fit.",
};
export const CHANGELOG_COPY = {
  description: "Published release notes, improvements and fixes across Neurodyne.",
  unavailableTitle: "The updates couldn’t load just now.",
  unavailableBody:
    "Try again in a moment. You can also explore the public repositories while the release notes are unavailable.",
  emptyTitle: "Release notes will appear here.",
  emptyBody:
    "There aren’t any published entries yet. Explore the open-source work or get in touch about a specific change.",
};

export const DEVELOPER_PRINCIPLES = [
  {
    k: "Extracted, not invented",
    v: "Nothing here gets published because it would look good on a page. Each library comes out of work a Neurodyne platform already had to do for itself.",
  },
  {
    k: "Documented before announced",
    v: "An interface with no honest description of how it fails is not finished. Documentation ships with the thing, not after it.",
  },
  {
    k: "Versioned and deprecable",
    v: "Infrastructure other people build on has to be safe to depend on and safe to leave. Versioning and deprecation paths are part of the first release, not a later concern.",
  },
];

export const SERVICES_OVERVIEW = {
  title: "Engineering support, shaped around the work.",
  description:
    "Systems architecture, institutional platforms, AI integration and strategic digital engineering — offered directly by Neurodyne.",
  helpTitle: "Not sure where to start?",
  helpBody:
    "Describe the problem, the system you have and what needs to change. Start with a brief and work towards the right engagement.",
};
