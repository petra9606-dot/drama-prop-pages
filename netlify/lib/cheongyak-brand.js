// Keep the administrator's scene layout and interaction scripts while removing
// obsolete agency-specific labels from an uploaded copy of the scene 1-4 HTML.
export function renameCheongyakHome(html) {
  return html
    .replace(/<span class="sub-tag">\s*CHEONGYAK NURI\s*<\/span>/gi, "")
    .replace(/한빛주택[ \t]*/g, "")
    .replace(/CHEONGYAK\s+NURI/gi, "")
    .replace(/(?:Copyright\s*©\s*)?HANBIT HOUSING(?: AGENCY)?\.?\s*/gi, "");
}
