import request from "supertest";
import { app, connectTestDB, closeTestDB, clearDB } from "./helpers";

const REGISTER_BODY = {
  name: "Login User",
  email: "login@test.com",
  password: "SecurePass123",
  phone: "9000000005",
};

describe("AUTH", () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await clearDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  describe("POST /api/auth/register", () => {
    it("registers a new farmer and returns a token", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Farmer One",
        email: "farmer@test.com",
        password: "SecurePass123",
        phone: "9000000001",
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toMatchObject({
        name: "Farmer One",
        email: "farmer@test.com",
        role: "farmer",
        preferredLanguage: "en",
      });
      expect(res.body.data.user).not.toHaveProperty("passwordHash");
      expect(typeof res.body.data.token).toBe("string");
    });

    it("rejects a duplicate email", async () => {
      await request(app).post("/api/auth/register").send({
        name: "Farmer A",
        email: "dup@test.com",
        password: "SecurePass123",
        phone: "9000000002",
      });

      const res = await request(app).post("/api/auth/register").send({
        name: "Farmer B",
        email: "dup@test.com",
        password: "SecurePass123",
        phone: "9000000003",
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it("rejects invalid payloads (missing email and phone)", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "No Contact",
        password: "SecurePass123",
      });
      expect(res.status).toBe(400);
    });

    it("rejects a short password", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Weak Pass",
        email: "weak@test.com",
        password: "short",
        phone: "9000000004",
      });
      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/auth/login", () => {
    it("logs in with valid email credentials", async () => {
      await request(app).post("/api/auth/register").send(REGISTER_BODY);

      const res = await request(app).post("/api/auth/login").send({
        identifier: "login@test.com",
        password: "SecurePass123",
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe("login@test.com");
      expect(typeof res.body.data.token).toBe("string");
    });

    it("logs in with a valid phone number", async () => {
      await request(app).post("/api/auth/register").send(REGISTER_BODY);

      const res = await request(app).post("/api/auth/login").send({
        identifier: "9000000005",
        password: "SecurePass123",
      });
      expect(res.status).toBe(200);
      expect(res.body.data.user.phone).toBe("9000000005");
    });

    it("rejects an invalid password", async () => {
      await request(app).post("/api/auth/register").send(REGISTER_BODY);

      const res = await request(app).post("/api/auth/login").send({
        identifier: "login@test.com",
        password: "WrongPass",
      });
      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/invalid\s+credentials/i);
    });

    it("rejects an unknown user", async () => {
      const res = await request(app).post("/api/auth/login").send({
        identifier: "nobody@test.com",
        password: "SecurePass123",
      });
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/auth/me", () => {
    it("returns the current user with a valid token", async () => {
      const reg = await request(app).post("/api/auth/register").send({
        name: "Me User",
        email: "me@test.com",
        password: "SecurePass123",
      });
      const token = reg.body.data.token;

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe("me@test.com");
    });

    it("rejects a request without a token", async () => {
      const res = await request(app).get("/api/auth/me");
      expect(res.status).toBe(401);
    });

    it("rejects a malformed token", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer not-a-real-token");
      expect(res.status).toBe(401);
    });
  });
});
