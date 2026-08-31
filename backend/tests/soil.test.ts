import { request, app, connectTestDB, closeTestDB, clearDB, registerFarmer, createFarm } from "./helpers";

describe("SOIL", () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await clearDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  describe("POST /api/soil/:farmId (manual entry)", () => {
    it("creates a manual soil report with a computed health score", async () => {
      const farmer = await registerFarmer({ email: "soil@test.com", phone: "9333333331" });
      const farmId = await createFarm(farmer.token);

      const res = await request(app)
        .post(`/api/soil/${farmId}`)
        .set("Authorization", `Bearer ${farmer.token}`)
        .send({
          nitrogen: 300,
          phosphorus: 15,
          potassium: 200,
          ph: 6.8,
          organicCarbon: 0.6,
          moisture: 30,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.report.source).toBe("manual");
      expect(res.body.data.report.nitrogen).toBe(300);
      expect(res.body.data.report.healthScore).toBeDefined();
      expect(res.body.data.report.interpretation).toBeTruthy();
      expect(res.body.data.report.fertilizerRecommendation).toBeTruthy();
    });

    it("rejects an empty soil entry (no parameters)", async () => {
      const farmer = await registerFarmer({ email: "soil-empty@test.com", phone: "9333333332" });
      const farmId = await createFarm(farmer.token);

      const res = await request(app)
        .post(`/api/soil/${farmId}`)
        .set("Authorization", `Bearer ${farmer.token}`)
        .send({});
      expect(res.status).toBe(400);
    });

    it("rejects an out-of-range pH", async () => {
      const farmer = await registerFarmer({ email: "soil-ph@test.com", phone: "9333333333" });
      const farmId = await createFarm(farmer.token);

      const res = await request(app)
        .post(`/api/soil/${farmId}`)
        .set("Authorization", `Bearer ${farmer.token}`)
        .send({ ph: 20 });
      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/soil/:farmId and /latest", () => {
    it("lists reports for a farm", async () => {
      const farmer = await registerFarmer({ email: "soil-list@test.com", phone: "9333333334" });
      const farmId = await createFarm(farmer.token);

      await request(app)
        .post(`/api/soil/${farmId}`)
        .set("Authorization", `Bearer ${farmer.token}`)
        .send({ nitrogen: 300 });
      await request(app)
        .post(`/api/soil/${farmId}`)
        .set("Authorization", `Bearer ${farmer.token}`)
        .send({ phosphorus: 20 });

      const res = await request(app)
        .get(`/api/soil/${farmId}`)
        .set("Authorization", `Bearer ${farmer.token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.reports).toHaveLength(2);
    });

    it("returns the latest report", async () => {
      const farmer = await registerFarmer({ email: "soil-latest@test.com", phone: "9333333335" });
      const farmId = await createFarm(farmer.token);

      await request(app)
        .post(`/api/soil/${farmId}`)
        .set("Authorization", `Bearer ${farmer.token}`)
        .send({ nitrogen: 300 });

      const res = await request(app)
        .get(`/api/soil/${farmId}/latest`)
        .set("Authorization", `Bearer ${farmer.token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.report.farm).toBe(farmId);
    });

    it("cannot list another user's farm reports (isolation)", async () => {
      const farmerA = await registerFarmer({ email: "soil-a@test.com", phone: "9333333336" });
      const farmerB = await registerFarmer({ email: "soil-b@test.com", phone: "9333333337" });
      const farmId = await createFarm(farmerA.token);

      const res = await request(app)
        .get(`/api/soil/${farmId}`)
        .set("Authorization", `Bearer ${farmerB.token}`);
      expect(res.status).toBe(404);
    });
  });
});
