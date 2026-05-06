const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../src/app");
const { connectDb, disconnectDb } = require("../src/db");
const seedTestUser = require("../src/seed");

let mongoServer;
let token;

const validLeadPayload = {
  leadName: "John Doe",
  companyName: "Acme Corp",
  email: "john@acme.com",
  phoneNumber: "+1234567890",
  leadSource: "Website",
  assignedSalesperson: "Alice",
  status: "New",
  estimatedDealValue: 15000,
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await connectDb(mongoServer.getUri());
  await seedTestUser();

  const loginRes = await request(app).post("/api/auth/login").send({
    email: "admin@example.com",
    password: "password123",
  });
  token = loginRes.body.token;
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
  await seedTestUser();
});

afterAll(async () => {
  await disconnectDb();
  await mongoServer.stop();
});

describe("Auth", () => {
  it("logs in with valid credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "admin@example.com",
      password: "password123",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});

describe("Leads and Dashboard", () => {
  it("creates, updates, adds note, and deletes lead", async () => {
    const createRes = await request(app)
      .post("/api/leads")
      .set("Authorization", `Bearer ${token}`)
      .send(validLeadPayload);

    expect(createRes.statusCode).toBe(201);
    const leadId = createRes.body._id;

    const statusRes = await request(app)
      .patch(`/api/leads/${leadId}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "Qualified" });

    expect(statusRes.statusCode).toBe(200);
    expect(statusRes.body.status).toBe("Qualified");

    const noteRes = await request(app)
      .post(`/api/leads/${leadId}/notes`)
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "Spoke with lead, interested in demo." });

    expect(noteRes.statusCode).toBe(201);
    expect(noteRes.body.content).toContain("interested");

    const detailRes = await request(app)
      .get(`/api/leads/${leadId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(detailRes.statusCode).toBe(200);
    expect(detailRes.body.notes).toHaveLength(1);

    const deleteRes = await request(app)
      .delete(`/api/leads/${leadId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(deleteRes.statusCode).toBe(204);
  });

  it("returns dashboard stats and supports filtering/search", async () => {
    const payloads = [
      { ...validLeadPayload, email: "new@acme.com", status: "New", estimatedDealValue: 1000 },
      { ...validLeadPayload, email: "won@acme.com", status: "Won", estimatedDealValue: 2000 },
      { ...validLeadPayload, email: "lost@acme.com", status: "Lost", estimatedDealValue: 3000, leadSource: "Referral" },
    ];

    for (const payload of payloads) {
      // eslint-disable-next-line no-await-in-loop
      await request(app).post("/api/leads").set("Authorization", `Bearer ${token}`).send(payload);
    }

    const dashboardRes = await request(app)
      .get("/api/dashboard")
      .set("Authorization", `Bearer ${token}`);

    expect(dashboardRes.statusCode).toBe(200);
    expect(dashboardRes.body.totalLeads).toBe(3);
    expect(dashboardRes.body.wonLeads).toBe(1);
    expect(dashboardRes.body.totalWonDealValue).toBe(2000);

    const filterRes = await request(app)
      .get("/api/leads")
      .query({ status: "Lost", leadSource: "Referral", search: "lost@" })
      .set("Authorization", `Bearer ${token}`);

    expect(filterRes.statusCode).toBe(200);
    expect(filterRes.body).toHaveLength(1);
  });
});
