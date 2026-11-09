// Keep the administrator's scene layout and interaction scripts while updating
// the superseded name in an uploaded copy of the scene 1-4 HTML.
export function renameCheongyakHome(html) {
  return html
    .replace(/<span class="sub-tag">\s*CHEONGYAK NURI\s*<\/span>/gi, "")
    .replace(/한빛주택[ \t]*/g, "")
    .replace(/청약\s*누리/g, "청약홈")
    .replace(/CHEONGYAK\s+NURI/gi, "")
    .replace(/(?:Copyright\s*©\s*)?HANBIT HOUSING(?: AGENCY)?\.?\s*/gi, "");
}
