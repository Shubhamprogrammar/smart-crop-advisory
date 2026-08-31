import { request, app, connectTestDB, closeTestDB, clearDB, registerFarmer, createFarm } from "./helpers";

describe("WEATHER", () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await clearDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  describe("GET /api/weather", () => {
    it("requires authentication", async () => {
      const res = await request(app).get("/api/weather?latitude=18.52&longitude=73.86");
      expect(res.status).toBe(401);
    });

    it("rejects a request without coordinates", async () => {
      const farmer = await registerFarmer({ email: "wx-noloc@test.com", phone: "9666666661" });
      const res = await request(app)
        .get("/api/weather")
        .set("Authorization", `Bearer ${farmer.token}`);
      expect(res.status).toBe(400);
    });

    it("fetches live weather for valid coordinates", async () => {
      const farmer = await registerFarmer({ email: "wx-live@test.com", phone: "9666666662" });

      const res = await request(app)
        .get("/api/weather?latitude=18.52&longitude=73.86")
        .set("Authorization", `Bearer ${farmer.token}`);

      expect(res.status).toBe(200);
      const r = res.body.data;
      expect(typeof r.snapshot.current.temperature).toBe("number");
      expect(r.snapshot.current).toHaveProperty("humidity");
      expect(r.snapshot.current).toHaveProperty("condition");
    });
  });

  describe("GET /api/weather/farm/:farmId", () => {
    it("fetches weather for an owned farm", async () => {
      const farmer = await registerFarmer({ email: "wx-farm@test.com", phone: "9666666663" });
      const farmId = await createFarm(farmer.token);

      const res = await request(app)
        .get(`/api/weather/farm/${farmId}`)
        .set("Authorization", `Bearer ${farmer.token}`);

      expect(res.status).toBe(200);
      expect(typeof res.body.data.snapshot.current.temperature).toBe("number");
    });

    it("rejects weather for another user's farm", async () => {
      const farmerA = await registerFarmer({ email: "wx-a@test.com", phone: "9666666664" });
      const farmerB = await registerFarmer({ email: "wx-b@test.com", phone: "9666666665" });
      const farmId = await createFarm(farmerA.token);

      const res = await request(app)
        .get(`/api/weather/farm/${farmId}`)
        .set("Authorization", `Bearer ${farmerB.token}`);
      expect(res.status).toBe(404);
    });
  });
});
