import { request, app, connectTestDB, closeTestDB, clearDB, registerFarmer } from "./helpers";

describe("PROFIT", () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await clearDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  const validInput = {
    landAreaAcres: 5,
    seedCost: 1000,
    fertilizerCost: 2000,
    pesticideCost: 1500,
    labourCost: 3000,
    irrigationCost: 1000,
    otherCosts: 500,
    expectedYield: 100,
    yieldUnit: "quintal",
    marketPrice: 2500,
  };

  describe("POST /api/profit/calculate", () => {
    it("requires authentication", async () => {
      const res = await request(app).post("/api/profit/calculate").send(validInput);
      expect(res.status).toBe(401);
    });

    it("calculates profit correctly for a farmer", async () => {
      const farmer = await registerFarmer({ email: "profit@test.com", phone: "9222222221" });

      const res = await request(app)
        .post("/api/profit/calculate")
        .set("Authorization", `Bearer ${farmer.token}`)
        .send(validInput);

      expect(res.status).toBe(200);
      const result = res.body.data.result;
      // totalCost = 1000+2000+1500+3000+1000+500 = 9000
      expect(result.totalCost).toBe(9000);
      // revenue = 100 * 2500 = 250000
      expect(result.expectedRevenue).toBe(250000);
      // profit = 250000 - 9000 = 241000
      expect(result.expectedProfit).toBe(241000);
      // ROI = 241000 / 9000 * 100
      expect(result.roiPercent).toBe(Math.round((241000 / 9000) * 10000) / 100);
      // per-acre values using 5 acres
      expect(result.costPerAcre).toBe(1800);
      expect(result.profitPerAcre).toBe(48200);
      expect(result.isEstimate).toBe(true);
      expect(result.disclaimer).toBeTruthy();
    });

    it("rejects invalid input (negative cost)", async () => {
      const farmer = await registerFarmer({ email: "profit-bad@test.com", phone: "9222222222" });

      const res = await request(app)
        .post("/api/profit/calculate")
        .set("Authorization", `Bearer ${farmer.token}`)
        .send({ ...validInput, seedCost: -100 });

      expect(res.status).toBe(400);
    });

    it("returns null per-acre fields when no land area is provided", async () => {
      const farmer = await registerFarmer({ email: "profit-noarea@test.com", phone: "9222222223" });
      const { landAreaAcres, ...noArea } = validInput;

      const res = await request(app)
        .post("/api/profit/calculate")
        .set("Authorization", `Bearer ${farmer.token}`)
        .send(noArea);

      expect(res.status).toBe(200);
      expect(res.body.data.result.costPerAcre).toBeNull();
      expect(res.body.data.result.profitPerAcre).toBeNull();
      expect(res.body.data.result.roiPercent).not.toBeNull();
    });
  });
});
