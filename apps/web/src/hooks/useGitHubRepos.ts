import { useEffect, useState } from "react";

/**
 * Live repository data for the Open Source page.
 *
 * Repository statistics must never be hand-entered — a hardcoded star count is
 * a fabricated metric that rots the moment anyone checks. So the numbers come
 * from GitHub and the page shows nothing rather than something invented when
 * the call fails.
 *
 * What is shown is a CURATED ALLOWLIST, not "every public repo". The account
 * has ~250 public repositories, including working repos for products that are
 * not open source and for client work that must not appear on this site at all.
 * Listing everything would publish things nobody decided to publish. Adding a
 * repo here is therefore an editorial act: name it explicitly.
 */

export interface Repo {
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  url: string;
  homepage: string | null;
  license: string | null;
  updatedAt: string;
  topics: string[];
}

type State =
  | { status: "loading"; repos: [] }
  | { status: "ready"; repos: Repo[] }
  | { status: "unavailable"; repos: [] };

const CACHE_KEY = "neurodyne:gh-repos:v2";
const GH_USER = "stanleyHayes";

/**
 * Repositories published as Neurodyne open-source work, in display order.
 *
 * These are the Digital Ghana digital-public-infrastructure set — the open
 * component of the Digital Public Infrastructure pillar. `digitalghana` is the
 * umbrella; the rest are the individual registries and libraries.
 *
 * To feature a repo, add its exact name here. To stop featuring it, remove it.
 */
const FEATURED = [
  "digitalghana",
  "ghanagov",
  "ghanadatasets",
  "ghanacodes",
  "ghanaschools",
  "ghanavalidate",
  "ghanadata",
  "ghanacalendar",
  "ghanaessential",
];

/**
 * Defence in depth. Even if one of these is ever added to FEATURED by mistake,
 * it will not render: product source repos are not open source, and the three
 * removed projects must never appear on this site under any name.
 */
const DENY = /terios|24h|24-?hour|health-?platform|fastcare|nhis|jdplus|userentos|ubuntufund|back2u|bak2me|auraedu|ujimora/i;

interface GitHubRepoResponse {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  html_url: string;
  homepage: string | null;
  license: { spdx_id?: string; name?: string } | null;
  updated_at: string;
  topics?: string[];
  fork: boolean;
  archived: boolean;
  private: boolean;
}

function readCache(): Repo[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as Repo[]) : null;
  } catch {
    // Private mode or blocked storage — just skip the cache.
    return null;
  }
}

function writeCache(repos: Repo[]) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(repos));
  } catch {
    /* non-fatal */
  }
}

export function useGitHubRepos(): State {
  const [state, setState] = useState<State>({ status: "loading", repos: [] });

  useEffect(() => {
    const cached = readCache();
    if (cached) {
      setState({ status: "ready", repos: cached });
      return;
    }

    const controller = new AbortController();

    // Three list requests cover ~300 repos and cost far less rate limit than
    // fetching each featured repo individually (60/hour, unauthenticated, per
    // IP — and a shared IP burns through that fast).
    const pages = [1, 2, 3].map((page) =>
      fetch(`https://api.github.com/users/${GH_USER}/repos?per_page=100&page=${page}`, {
        signal: controller.signal,
        headers: { Accept: "application/vnd.github+json" },
      }).then((res) => {
        if (!res.ok) throw new Error(`GitHub responded ${res.status}`);
        return res.json() as Promise<GitHubRepoResponse[]>;
      }),
    );

    Promise.all(pages)
      .then((results) => {
        const all = results.flat();
        const order = new Map(FEATURED.map((name, i) => [name.toLowerCase(), i]));

        const repos: Repo[] = all
          .filter((r) => !r.fork && !r.archived && !r.private)
          .filter((r) => order.has(r.name.toLowerCase()))
          .filter((r) => !DENY.test(r.name))
          .map((r) => ({
            name: r.name,
            description: r.description,
            language: r.language,
            stars: r.stargazers_count,
            url: r.html_url,
            homepage: r.homepage,
            // GitHub reports a licence it cannot identify as "NOASSERTION";
            // showing that verbatim reads like a licence name.
            license:
              r.license?.spdx_id && r.license.spdx_id !== "NOASSERTION"
                ? r.license.spdx_id
                : null,
            updatedAt: r.updated_at,
            topics: r.topics ?? [],
          }))
          .sort(
            (a, b) =>
              (order.get(a.name.toLowerCase()) ?? 999) - (order.get(b.name.toLowerCase()) ?? 999),
          );

        writeCache(repos);
        setState({ status: "ready", repos });
      })
      .catch((err) => {
        if (err instanceof Error && err.name === "AbortError") return;
        // Rate limited, offline, or GitHub down. The page degrades to its
        // honest static content rather than showing zeros.
        setState({ status: "unavailable", repos: [] });
      });

    return () => controller.abort();
  }, []);

  return state;
}

export { GH_USER, FEATURED };
