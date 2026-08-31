import { request, app, connectTestDB, closeTestDB, clearDB, registerFarmer, registerAndUpgrade, createFarm } from "./helpers";

describe("DISEASE DETECTION & RISK", () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await clearDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  describe("POST /api/diseases/:farmId (detection)", () => {
    it("requires authentication", async () => {
      const res = await request(app)
        .post("/api/diseases/605c72efd7631234567890ab")
        .attach("image", Buffer.from("not-an-image"), "leaf.png");
      expect(res.status).toBe(401);
    });

    it("forbids an admin from the farmer-only detection upload", async () => {
      const admin = await registerAndUpgrade("admin", { email: "adm-det@test.com", phone: "9777777771" });
      const res = await request(app)
        .post("/api/diseases/605c72efd7631234567890ab")
        .set("Authorization", `Bearer ${admin.token}`)
        .attach("image", Buffer.from("x"), "leaf.png");
      expect(res.status).toBe(403);
    });

    it("returns 400 when no image file is provided", async () => {
      const farmer = await registerFarmer({ email: "det-noimg@test.com", phone: "9777777772" });
      const res = await request(app)
        .post("/api/diseases/605c72efd7631234567890ab")
        .set("Authorization", `Bearer ${farmer.token}`)
        .send({ cropType: "tomato" });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/image file is required/i);
    });

    it("returns 404 for a non-existent farm with a valid image file", async () => {
      const farmer = await registerFarmer({ email: "det-nofarm@test.com", phone: "9777777773" });
      const res = await request(app)
        .post("/api/diseases/605c72efd7631234567890ab")
        .set("Authorization", `Bearer ${farmer.token}`)
        .attach("image", Buffer.from("fake-image-bytes"), "leaf.png")
        .field("cropType", "tomato");
      // Farm lookup precedes the AI call, so a missing farm -> 404
      expect(res.status).toBe(404);
    });
  });

  describe("POST /api/diseases/risk/:farmId (compute risk)", () => {
    it("returns a clear error when the farm has no active crop cycle", async () => {
      const farmer = await registerFarmer({ email: "risk-nocycle@test.com", phone: "9777777774" });
      const farmId = await createFarm(farmer.token);

      const res = await request(app)
        .post(`/api/diseases/risk/${farmId}`)
        .set("Authorization", `Bearer ${farmer.token}`);
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/no active crop cycle/i);
    });
  });

  describe("GET /api/diseases/risk/:farmId/latest", () => {
    it("returns null risk when there is no active crop cycle", async () => {
      const farmer = await registerFarmer({ email: "risk-lat@test.com", phone: "9777777775" });
      const farmId = await createFarm(farmer.token);

      const res = await request(app)
        .get(`/api/diseases/risk/${farmId}/latest`)
        .set("Authorization", `Bearer ${farmer.token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.risk).toBeNull();
    });

    it("rejects risk lookup for another user's farm", async () => {
      const farmerA = await registerFarmer({ email: "risk-a@test.com", phone: "9777777776" });
      const farmerB = await registerFarmer({ email: "risk-b@test.com", phone: "9777777777" });
      const farmId = await createFarm(farmerA.token);

      const res = await request(app)
        .get(`/api/diseases/risk/${farmId}/latest`)
        .set("Authorization", `Bearer ${farmerB.token}`);
      expect(res.status).toBe(404);
    });
  });

  describe("GET /api/diseases/:farmId (list)", () => {
    it("lists existing detections for an owned farm (empty array)", async () => {
      const farmer = await registerFarmer({ email: "det-list@test.com", phone: "9777777778" });
      const farmId = await createFarm(farmer.token);

      const res = await request(app)
        .get(`/api/diseases/${farmId}`)
        .set("Authorization", `Bearer ${farmer.token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.detections).toEqual([]);
    });
  });
});
