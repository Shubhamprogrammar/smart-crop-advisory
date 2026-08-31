import { request, app, connectTestDB, closeTestDB, clearDB, registerFarmer, seedCrops, createFarm } from "./helpers";

describe("MARKET", () => {
  beforeAll(async () => {
    await connectTestDB();
    await clearDB();
    await seedCrops();
  });

  beforeEach(async () => {
    // seedCrops is idempotent; re-run to guarantee crops exist for each case
    // (in case another suite's DB state affects this file's process).
    await seedCrops();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  describe("GET /api/market/price/:cropName", () => {
    it("requires authentication", async () => {
      const res = await request(app).get("/api/market/price/tomato");
      expect(res.status).toBe(401);
    });

    it("returns a simulated, clearly-labeled price for a known crop", async () => {
      const farmer = await registerFarmer({ email: "mkt@test.com", phone: "9555555551" });

      const res = await request(app)
        .get("/api/market/price/tomato")
        .set("Authorization", `Bearer ${farmer.token}`);

      expect(res.status).toBe(200);
      const result = res.body.data;
      expect(result).toMatchObject({
        crop: "tomato",
        unit: "quintal",
        source: "simulated_demo",
        isSimulated: true,
      });
      expect(typeof result.modalPrice).toBe("number");
      expect(result.modalPrice).toBeGreaterThan(0);
      expect(result.disclaimer).toMatch(/simulated/i);
    });

    it("rejects an unknown crop with a clear error", async () => {
      const farmer = await registerFarmer({ email: "mkt-unk@test.com", phone: "9555555552" });

      const res = await request(app)
        .get("/api/market/price/dragonfruit")
        .set("Authorization", `Bearer ${farmer.token}`);
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/unknown\s+crop/i);
    });
  });

  describe("GET /api/market/history/:cropName", () => {
    it("returns a deterministic historical series", async () => {
      const farmer = await registerFarmer({ email: "mkt-hist@test.com", phone: "9555555553" });

      const res = await request(app)
        .get("/api/market/history/tomato?days=7")
        .set("Authorization", `Bearer ${farmer.token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.history).toHaveLength(7);
      expect(res.body.data.isSimulated).toBe(true);
    });
  });

  describe("GET /api/market/trend/:cropName", () => {
    it("computes a trend direction", async () => {
      const farmer = await registerFarmer({ email: "mkt-trend@test.com", phone: "9555555554" });

      const res = await request(app)
        .get("/api/market/trend/tomato")
        .set("Authorization", `Bearer ${farmer.token}`);

      expect(res.status).toBe(200);
      const prediction = res.body.data.prediction;
      expect(["rising", "falling", "stable"]).toContain(prediction.direction);
      expect(res.body.data.source).toBe("ai_prediction");
      expect(res.body.data.isSimulated).toBe(true);
    });
  });

  describe("GET /api/market/nearby/:farmId", () => {
    it("returns nearest mandis for an owned farm", async () => {
      const farmer = await registerFarmer({ email: "mkt-mandi@test.com", phone: "9555555555" });
      const farmId = await createFarm(farmer.token);

      const res = await request(app)
        .get(`/api/market/nearby/${farmId}`)
        .set("Authorization", `Bearer ${farmer.token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.mandis.length).toBeGreaterThan(0);
      expect(res.body.data.mandis[0]).toHaveProperty("distanceKm");
    });

    it("rejects nearby mandis for another user's farm", async () => {
      const farmerA = await registerFarmer({ email: "mkt-a@test.com", phone: "9555555556" });
      const farmerB = await registerFarmer({ email: "mkt-b@test.com", phone: "9555555557" });
      const farmId = await createFarm(farmerA.token);

      const res = await request(app)
        .get(`/api/market/nearby/${farmId}`)
        .set("Authorization", `Bearer ${farmerB.token}`);
      expect(res.status).toBe(404);
    });
  });

  describe("GET /api/market/recommendation/:cropName", () => {
    it("produces a selling recommendation with a clear disclaimer", async () => {
      const farmer = await registerFarmer({ email: "mkt-rec@test.com", phone: "9555555558" });
      const farmId = await createFarm(farmer.token);

      const res = await request(app)
        .get(`/api/market/recommendation/tomato?farmId=${farmId}`)
        .set("Authorization", `Bearer ${farmer.token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.recommendation).toBeTruthy();
      expect(res.body.data).toHaveProperty("isSimulated");
    });
  });
});
