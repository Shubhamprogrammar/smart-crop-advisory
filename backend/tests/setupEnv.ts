// Ensure app config env vars are set BEFORE the app modules are imported.
// env.ts reads process.env at import time, so this setup file must run
// first (jest `setupFiles` runs before the test framework and before any
// module under test is imported).

process.env.NODE_ENV = "test";
process.env.PORT = "5000";
process.env.MONGO_URI = process.env.TEST_MONGO_URI || "mongodb://127.0.0.1:27017/smart_crop_test";
process.env.REDIS_URL = process.env.TEST_REDIS_URL || "redis://127.0.0.1:6379";
process.env.JWT_SECRET = process.env.TEST_JWT_SECRET || "test-only-jwt-secret-for-jest-suite";
process.env.JWT_EXPIRES_IN = "7d";
process.env.AI_SERVICE_URL = process.env.TEST_AI_SERVICE_URL || "http://127.0.0.1:8000";
process.env.WEATHER_API_KEY = "";
process.env.MARKET_API_KEY = "";
