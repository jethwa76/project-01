import mongoose from "mongoose";
import app from "./app.js";
import User from "./models/User.js";
import Session from "./models/Session.js";
import PredefinedAdmin from "./models/PredefinedAdmin.js";
import Visitor from "./models/Visitor.js";
import { connectDatabase } from "./config/db.js";

async function runPredefinedAdminTests() {
  console.log("🚀 Starting Predefined Admin & Visitor Tracking Tests...");

  await connectDatabase();

  const PORT = 5003;
  const server = app.listen(PORT, () => {
    console.log(`📡 Test Server running on port ${PORT}`);
  });

  const baseUrl = `http://localhost:${PORT}/api`;

  try {
    // 1. Check if predefined admin is seeded
    console.log("\n--- Test 1: Seed verification ---");
    const predefined = await PredefinedAdmin.findOne({ email: "admin@example.com" });
    if (!predefined) {
      throw new Error("Seed failed: admin@example.com not found in PredefinedAdmin");
    }
    console.log("✅ admin@example.com exists in PredefinedAdmin");

    // Clean old test users
    await User.deleteMany({ email: { $in: ["admin-test@example.com", "not-admin-test@example.com"] } });
    await Visitor.deleteMany({});

    // Check if admin user already exists (seeded by db.js), otherwise create it
    let adminUser = await User.findOne({ email: "admin@example.com" });
    if (!adminUser) {
      adminUser = await User.create({
        name: "Default Admin",
        email: "admin@example.com",
        password: "Password123!",
        role: "admin"
      });
    }

    const standardUser = await User.create({
      name: "Not Admin",
      email: "not-admin-test@example.com",
      password: "Password123!",
      role: "visitor"
    });

    // Login as admin to get token
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@example.com", password: "Password123!" })
    });
    const loginData = await loginRes.json();
    if (!loginData.success) {
      throw new Error(`Admin login failed: ${JSON.stringify(loginData)}`);
    }
    const adminToken = loginData.token;
    console.log("✅ Logged in as seeded admin");

    // Try to update standardUser to admin
    const promoteRes = await fetch(`${baseUrl}/admin/users/${standardUser._id}/role`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`
      },
      body: JSON.stringify({ role: "admin" })
    });

    const promoteData = await promoteRes.json();
    if (promoteRes.status === 403) {
      console.log("✅ Correctly rejected promotion of non-predefined email to admin. Status: 403, Message:", promoteData.message);
    } else {
      throw new Error(`Promotion should have failed but succeeded: ${JSON.stringify(promoteData)}`);
    }

    // 3. Try to log in as a user with role admin whose email is NOT predefined
    console.log("\n--- Test 3: Log in as non-predefined admin (should fail) ---");
    // Manually force standardUser role to admin in DB to simulate bypass
    standardUser.role = "admin";
    await standardUser.save();

    const badLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "not-admin-test@example.com", password: "Password123!" })
    });

    const badLoginData = await badLoginRes.json();
    if (badLoginRes.status === 403) {
      console.log("✅ Correctly blocked login of non-predefined admin. Status: 403, Message:", badLoginData.message);
    } else {
      throw new Error(`Login should have failed but succeeded: ${JSON.stringify(badLoginData)}`);
    }

    // 4. Visitor Tracking
    console.log("\n--- Test 4: Visitor Tracking and Analytics ---");
    // Fetch a public endpoint to simulate page load and trigger visitor tracking
    const publicRes = await fetch(`${baseUrl}/projects`);
    const publicData = await publicRes.json();
    if (!publicRes.ok) {
      throw new Error(`Public endpoint fetch failed: ${JSON.stringify(publicData)}`);
    }
    console.log("✅ Public endpoint fetched successfully");

    // Check if visitor was registered in DB
    const visitors = await Visitor.find({});
    if (visitors.length === 0) {
      throw new Error("Visitor tracking did not record a visitor in DB");
    }
    console.log(`✅ Visitor tracked in database. IP: ${visitors[0].ip}, Browser: ${visitors[0].browser}`);

    // Verify /api/admin/overview contains visitors metric and trend
    const overviewRes = await fetch(`${baseUrl}/admin/overview`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${adminToken}` }
    });
    const overviewData = await overviewRes.json();
    if (!overviewData.success) {
      throw new Error(`Overview fetch failed: ${JSON.stringify(overviewData)}`);
    }
    console.log("✅ Overview metrics retrieved");
    console.log("   - Total visitors:", overviewData.metrics.visitors);
    console.log("   - Visitors 7-day trend count:", overviewData.trends.visitors.length);

    if (overviewData.metrics.visitors !== 1) {
      throw new Error(`Expected exactly 1 visitor, got ${overviewData.metrics.visitors}`);
    }
    console.log("✅ Visitor count matches expected unique visitors");

    console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY! FEATURE 1 IS FULLY FUNCTIONAL AND SECURE.");
  } catch (error) {
    console.error("\n❌ TEST FAILED:", error.message);
    process.exit(1);
  } finally {
    server.close();
    await mongoose.disconnect();
    process.exit(0);
  }
}

runPredefinedAdminTests();
