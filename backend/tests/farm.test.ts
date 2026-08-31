import { request, app, connectTestDB, closeTestDB, clearDB, registerFarmer, createFarm } from "./helpers";

describe("FARM", () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await clearDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  describe("authorization", () => {
    it("rejects farm routes without a token", async () => {
      const res = await request(app).post("/api/farms").send({
        name: "No Auth Farm",
        landAreaAcres: 2,
        location: { latitude: 18.52, longitude: 73.86 },
      });
      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/farms", () => {
    it("creates a farm", async () => {
      const farmer = await registerFarmer({ email: "farm-create@test.com", phone: "9111111111" });

      const res = await request(app)
        .post("/api/farms")
        .set("Authorization", `Bearer ${farmer.token}`)
        .send({
          name: "Sugarcane Fields",
          landAreaAcres: 12.5,
          location: { latitude: 18.52, longitude: 73.86 },
          soilType: "black",
          irrigationType: "drip",
        });

      expect(res.status).toBe(201);
      expect(res.body.data.farm).toMatchObject({
        name: "Sugarcane Fields",
        landAreaAcres: 12.5,
        soilType: "black",
        irrigationType: "drip",
        status: "active",
        location: { latitude: 18.52, longitude: 73.86 },
      });
      expect(res.body.data.farm.id).toBeDefined();
    });

    it("rejects invalid payloads (negative area)", async () => {
      const farmer = await registerFarmer({ email: "bad-area@test.com", phone: "9111111112" });

      const res = await request(app)
        .post("/api/farms")
        .set("Authorization", `Bearer ${farmer.token}`)
        .send({
          name: "Bad Farm",
          landAreaAcres: -5,
          location: { latitude: 18.52, longitude: 73.86 },
        });
      expect(res.status).toBe(400);
    });

    it("rejects invalid location (longitude out of range)", async () => {
      const farmer = await registerFarmer({ email: "bad-loc@test.com", phone: "9111111113" });

      const res = await request(app)
        .post("/api/farms")
        .set("Authorization", `Bearer ${farmer.token}`)
        .send({
          name: "Bad Loc Farm",
          landAreaAcres: 5,
          location: { latitude: 18.52, longitude: 200 },
        });
      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/farms", () => {
    it("lists only the authenticated farmer's farms", async () => {
      const farmerA = await registerFarmer({ email: "list-a@test.com", phone: "9111111121" });
      const farmerB = await registerFarmer({ email: "list-b@test.com", phone: "9111111122" });

      await createFarm(farmerA.token, { name: "Farm A" });
      await createFarm(farmerB.token, { name: "Farm B" });

      const res = await request(app)
        .get("/api/farms")
        .set("Authorization", `Bearer ${farmerA.token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.farms).toHaveLength(1);
      expect(res.body.data.farms[0].name).toBe("Farm A");
    });
  });

  describe("GET /api/farms/:id", () => {
    it("fetches an owned farm", async () => {
      const farmer = await registerFarmer({ email: "get-one@test.com", phone: "9111111123" });
      const farmId = await createFarm(farmer.token);

      const res = await request(app)
        .get(`/api/farms/${farmId}`)
        .set("Authorization", `Bearer ${farmer.token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.farm.id).toBe(farmId);
    });

    it("returns 404 for another user's farm (isolation)", async () => {
      const farmerA = await registerFarmer({ email: "iso-a@test.com", phone: "9111111124" });
      const farmerB = await registerFarmer({ email: "iso-b@test.com", phone: "9111111125" });
      const farmId = await createFarm(farmerA.token);

      const res = await request(app)
        .get(`/api/farms/${farmId}`)
        .set("Authorization", `Bearer ${farmerB.token}`);
      expect(res.status).toBe(404);
    });

    it("returns 404 for a non-existent farm", async () => {
      const farmer = await registerFarmer({ email: "missing@test.com", phone: "9111111126" });
      const res = await request(app)
        .get("/api/farms/605c72efd7631234567890ab")
        .set("Authorization", `Bearer ${farmer.token}`);
      expect(res.status).toBe(404);
    });
  });

  describe("PATCH /api/farms/:id", () => {
    it("updates an owned farm", async () => {
      const farmer = await registerFarmer({ email: "upd@test.com", phone: "9111111127" });
      const farmId = await createFarm(farmer.token);

      const res = await request(app)
        .patch(`/api/farms/${farmId}`)
        .set("Authorization", `Bearer ${farmer.token}`)
        .send({ name: "Renamed Farm", landAreaAcres: 20 });
      expect(res.status).toBe(200);
      expect(res.body.data.farm.name).toBe("Renamed Farm");
      expect(res.body.data.farm.landAreaAcres).toBe(20);
    });

    it("allows deactivating a farm via status", async () => {
      const farmer = await registerFarmer({ email: "deact@test.com", phone: "9111111128" });
      const farmId = await createFarm(farmer.token);

      const res = await request(app)
        .patch(`/api/farms/${farmId}`)
        .set("Authorization", `Bearer ${farmer.token}`)
        .send({ status: "inactive" });
      expect(res.status).toBe(200);
      expect(res.body.data.farm.status).toBe("inactive");
    });

    it("cannot update another user's farm", async () => {
      const farmerA = await registerFarmer({ email: "upd-a@test.com", phone: "9111111129" });
      const farmerB = await registerFarmer({ email: "upd-b@test.com", phone: "9111111130" });
      const farmId = await createFarm(farmerA.token);

      const res = await request(app)
        .patch(`/api/farms/${farmId}`)
        .set("Authorization", `Bearer ${farmerB.token}`)
        .send({ name: "Hacked" });
      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /api/farms/:id", () => {
    it("deletes an owned farm", async () => {
      const farmer = await registerFarmer({ email: "del@test.com", phone: "9111111131" });
      const farmId = await createFarm(farmer.token);

      const res = await request(app)
        .delete(`/api/farms/${farmId}`)
        .set("Authorization", `Bearer ${farmer.token}`);
      expect(res.status).toBe(200);

      const after = await request(app)
        .get(`/api/farms/${farmId}`)
        .set("Authorization", `Bearer ${farmer.token}`);
      expect(after.status).toBe(404);
    });

    it("cannot delete another user's farm", async () => {
      const farmerA = await registerFarmer({ email: "del-a@test.com", phone: "9111111132" });
      const farmerB = await registerFarmer({ email: "del-b@test.com", phone: "9111111133" });
      const farmId = await createFarm(farmerA.token);

      const res = await request(app)
        .delete(`/api/farms/${farmId}`)
        .set("Authorization", `Bearer ${farmerB.token}`);
      expect(res.status).toBe(404);
    });
  });
});
