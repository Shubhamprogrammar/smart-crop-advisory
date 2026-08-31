import { request, app, connectTestDB, closeTestDB, clearDB, registerFarmer, registerAndUpgrade } from "./helpers";

describe("ADMIN PERMISSIONS", () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await clearDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  describe("role-based access control", () => {
    it("rejects admin routes without any token", async () => {
      const res = await request(app).get("/api/admin/stats");
      expect(res.status).toBe(401);
    });

    it("forbids a farmer from admin routes (403)", async () => {
      const farmer = await registerFarmer({ email: "farmer-noadmin@test.com", phone: "9444444441" });
      const res = await request(app)
        .get("/api/admin/stats")
        .set("Authorization", `Bearer ${farmer.token}`);
      expect(res.status).toBe(403);
    });

    it("forbids an expert from admin user-management (403)", async () => {
      const expert = await registerAndUpgrade("expert", { email: "expert-noadmin@test.com", phone: "9444444442" });
      const res = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${expert.token}`);
      expect(res.status).toBe(403);
    });

    it("allows an admin to view stats", async () => {
      const admin = await registerAndUpgrade("admin", { email: "admin-ok@test.com", phone: "9444444443" });
      const res = await request(app)
        .get("/api/admin/stats")
        .set("Authorization", `Bearer ${admin.token}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("allows an admin to list users and see the farmer role", async () => {
      const admin = await registerAndUpgrade("admin", { email: "admin-list@test.com", phone: "9444444444" });
      await registerFarmer({ email: "target-user@test.com", phone: "9444444445" });

      const res = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${admin.token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.users)).toBe(true);
      const roles = res.body.data.users.map((u: { role: string }) => u.role);
      expect(roles).toContain("farmer");
    });

    it("forbids a farmer from mutating other farms via the soil route (404 isolation) vs admin", async () => {
      // Guards that admin/expert can't slide into farmer-only shared routes
      // incorrectly: an admin attempting the farmer manual-soil entry route
      // should be rejected because that route is farmer-only.
      const admin = await registerAndUpgrade("admin", { email: "admin-soil@test.com", phone: "9444444446" });
      const res = await request(app)
        .post("/api/soil/605c72efd7631234567890ab")
        .set("Authorization", `Bearer ${admin.token}`)
        .send({ nitrogen: 100 });
      // Not authorized to use the farmer-only manual soil route
      expect(res.status).toBe(403);
    });
  });
});
