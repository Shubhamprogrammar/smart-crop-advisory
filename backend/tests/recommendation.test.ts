import { request, app, connectTestDB, closeTestDB, clearDB, registerFarmer, registerAndUpgrade, createFarm } from "./helpers";

const REC_BODY = { rainfall: 800, nitrogen: 200, phosphorus: 40, potassium: 150, ph: 6.5, temperature: 28, humidity: 60, season: "kharif" };

describe("CROP RECOMMENDATION", () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await clearDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  describe("POST /api/recommendations/crop/:farmId", () => {
    it("requires authentication", async () => {
      const res = await request(app)
        .post("/api/recommendations/crop/605c72efd7631234567890ab")
        .send(REC_BODY);
      expect(res.status).toBe(401);
    });

    it("forbids an admin from the farmer-only recommendation route", async () => {
      const admin = await registerAndUpgrade("admin", { email: "adm-rec@test.com", phone: "9888888881" });
      const res = await request(app)
        .post("/api/recommendations/crop/605c72efd7631234567890ab")
        .set("Authorization", `Bearer ${admin.token}`)
        .send(REC_BODY);
      expect(res.status).toBe(403);
    });

    it("rejects an invalid body (negative rainfall)", async () => {
      const farmer = await registerFarmer({ email: "rec-bad@test.com", phone: "9888888882" });
      const res = await request(app)
        .post("/api/recommendations/crop/605c72efd7631234567890ab")
        .set("Authorization", `Bearer ${farmer.token}`)
        .send({ ...REC_BODY, rainfall: -5 });
      expect(res.status).toBe(400);
    });

    it("returns 404 for a non-existent farm", async () => {
      const farmer = await registerFarmer({ email: "rec-nofarm@test.com", phone: "9888888883" });
      const res = await request(app)
        .post("/api/recommendations/crop/605c72efd7631234567890ab")
        .set("Authorization", `Bearer ${farmer.token}`)
        .send(REC_BODY);
      expect(res.status).toBe(404);
    });
  });

  describe("GET /api/recommendations/farm/:farmId", () => {
    it("lists recommendations for an owned farm (empty array)", async () => {
      const farmer = await registerFarmer({ email: "rec-list@test.com", phone: "9888888884" });
      const farmId = await createFarm(farmer.token);

      const res = await request(app)
        .get(`/api/recommendations/farm/${farmId}`)
        .set("Authorization", `Bearer ${farmer.token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.recommendations).toEqual([]);
    });

    it("rejects listing another user's farm recommendations", async () => {
      const farmerA = await registerFarmer({ email: "rec-a@test.com", phone: "9888888885" });
      const farmerB = await registerFarmer({ email: "rec-b@test.com", phone: "9888888886" });
      const farmId = await createFarm(farmerA.token);

      const res = await request(app)
        .get(`/api/recommendations/farm/${farmId}`)
        .set("Authorization", `Bearer ${farmerB.token}`);
      expect(res.status).toBe(404);
    });
  });
});
