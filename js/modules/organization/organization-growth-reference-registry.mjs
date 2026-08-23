export const ORGANIZATION_GROWTH_REFERENCES = Object.freeze([
  {
    id: "OPENSTAX-ORG-DESIGN",
    name: "OpenStax Principles of Management — Organizational Designs and Structures",
    url: "https://openstax.org/books/principles-management/pages/4-3-organizational-designs-and-structures",
    publisher: "OpenStax",
    reuseStatus: "Open educational source; verify the current page licence and attribution requirements before production publication.",
    supports: ["mechanistic-organic", "functional", "divisional", "matrix", "environmental-complexity"],
    note: "Used as a public organizational-design reference, not as a rule that prescribes one structure for every company."
  },
  {
    id: "OPENSTAX-SPAN",
    name: "OpenStax Introduction to Business — Degree of Centralization",
    url: "https://openstax.org/books/introduction-business-2e/pages/7-5-degree-of-centralization",
    publisher: "OpenStax",
    reuseStatus: "Open educational source; verify the current page licence and attribution requirements before production publication.",
    supports: ["span-context", "task-complexity", "worker-location", "delegation", "interaction", "capability"],
    note: "Supports contextual interpretation of management span instead of one universal ratio."
  },
  {
    id: "BASE100",
    name: "BASE-100 business maturity framework",
    url: "https://www.base100.org/",
    publisher: "BASE-100",
    reuseStatus: "Publicly available framework. Confirm the current licence and required attribution before production reuse.",
    supports: ["small-company-maturity", "multi-role-ownership", "responsibility-domains", "scaling"],
    note: "Useful for treating multiple-hat ownership as a maturity/context question rather than automatically classifying it as a defect."
  },
  {
    id: "GITLAB-SPAN",
    name: "GitLab Handbook — Organizational Structure",
    url: "https://handbook.gitlab.com/handbook/company/structure/",
    publisher: "GitLab",
    reuseStatus: "Public company handbook reference. Treat published numbers as company-specific reference points, not universal benchmarks.",
    supports: ["span-reference", "management-capacity"],
    note: "GitLab publicly describes a typical management span around seven, with a 4–10 range. GrowWithHR must show this only as an external reference point and never apply it mechanically."
  },
  {
    id: "TEAM-TOPOLOGIES",
    name: "Team Topologies — public concepts",
    url: "https://teamtopologies.com/key-concepts-content",
    publisher: "Team Topologies",
    reuseStatus: "Reference concepts only. Do not reproduce proprietary book content or diagrams without permission.",
    supports: ["stream-aligned-teams", "platform-teams", "enabling-teams", "cognitive-load", "product-flow"],
    note: "Relevant when product/technology complexity suggests value-stream or platform-oriented team patterns."
  },
  {
    id: "GREINER",
    name: "Greiner growth model — Evolution and Revolution as Organizations Grow",
    url: "https://hbr.org/1998/05/evolution-and-revolution-as-organizations-grow",
    publisher: "Harvard Business Review",
    reuseStatus: "Reference concept only. The article is not an open-licence source; do not reproduce protected content.",
    supports: ["growth-stage-transition", "delegation", "coordination", "leadership-evolution"],
    note: "Used only to inform the idea that structures and leadership patterns often need to evolve as organizations grow."
  }
]);

export function referencesFor(tags = []) {
  const wanted = new Set(tags);
  return ORGANIZATION_GROWTH_REFERENCES.filter((reference) => reference.supports.some((tag) => wanted.has(tag)));
}
