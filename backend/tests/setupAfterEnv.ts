// Runs before test files are collected (jest config setupFilesAfterEnv).
// The auth/ai/global rate limiters use a Redis-backed store shared across
// tests (and persist window state in a real Redis), which would return 429
// spuriously after only a handful of requests in a single test run. For a
// deterministic, flake-free test DB/Redis, replace them with permissive
// no-op limiters.
jest.mock("../src/middlewares/rateLimiter", () => {
  const noop = (_req: unknown, _res: unknown, next: () => void) => next();
  noop.default = noop;
  return {
    __esModule: true,
    authLimiter: noop,
    aiLimiter: noop,
    globalApiLimiter: noop,
  };
});
