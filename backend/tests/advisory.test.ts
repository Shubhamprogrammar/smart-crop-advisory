import { request, app, connectTestDB, closeTestDB, clearDB, registerFarmer, registerAndUpgrade, createFarm } from "./helpers";

describe("ADVISORY", () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await clearDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  describe("GET /api/advisories/:farmId (list active)", () => {
    it("lists active advisories for an owned farm (empty array)", async () => {
      const farmer = await registerFarmer({ email: "adv-list@test.com", phone: "9999999991" });
      const farmId = await createFarm(farmer.token);

      const res = await request(app)
        .get(`/api/advisories/${farmId}`)
        .set("Authorization", `Bearer ${farmer.token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.advisories).toEqual([]);
    });

    it("returns 404 for another user's farm", async () => {
      const farmerA = await registerFarmer({ email: "adv-a@test.com", phone: "9999999992" });
      const farmerB = await registerFarmer({ email: "adv-b@test.com", phone: "9999999993" });
      const farmId = await createFarm(farmerA.token);

      const res = await request(app)
        .get(`/api/advisories/${farmId}`)
        .set("Authorization", `Bearer ${farmerB.token}`);
      expect(res.status).toBe(404);
    });

    it("requires farmer role (expert forbidden)", async () => {
      const expert = await registerAndUpgrade("expert", { email: "adv-exp@test.com", phone: "9999999994" });
      const res = await request(app)
        .get("/api/advisories/605c72efd7631234567890ab")
        .set("Authorization", `Bearer ${expert.token}`);
      expect(res.status).toBe(403);
    });
  });

  describe("list all and status update authorization", () => {
    it("requires authentication for status updates", async () => {
      const res = await request(app).patch("/api/advisories/605c72efd7631234567890ab/status").send({ status: "done" });
      expect(res.status).toBe(401);
    });

    it("returns 400 for an invalid status value", async () => {
      const farmer = await registerFarmer({ email: "adv-status@test.com", phone: "9999999995" });
      const res = await request(app)
        .patch("/api/advisories/605c72efd7631234567890ab/status")
        .set("Authorization", `Bearer ${farmer.token}`)
        .send({ status: "not-a-status" });
      expect(res.status).toBe(400);
    });
  });
});
