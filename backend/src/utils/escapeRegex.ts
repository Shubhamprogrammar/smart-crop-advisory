/**
 * Escapes regex metacharacters so user-supplied search text can't be
 * used as a regex pattern (spec §9 "Input sanitization") — without this,
 * a search field built with `new RegExp(userInput)` is both a ReDoS
 * vector (catastrophic backtracking patterns like "(a+)+$") and lets the
 * "search" match far more than intended (e.g. "." matching any farmer
 * whose name has more than 0 characters).
 */
export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
