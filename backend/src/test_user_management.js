import mongoose from "mongoose";
import app from "./app.js";
import User from "./models/User.js";
import PredefinedAdmin from "./models/PredefinedAdmin.js";
import { connectDatabase } from "./config/db.js";

async function runUserManagementTests() {
  console.log("🚀 Starting User Management System Integration Tests...");

  await connectDatabase();

  const PORT = 5005;
  const server = app.listen(PORT, () => {
    console.log(`📡 Test Server running on port ${PORT}`);
  });

  const baseUrl = `http://localhost:${PORT}/api`;

  try {
    const adminEmail = "admin@example.com";
    const userEmail = "suspend-test@example.com";

    // Ensure predefined admin exists
    await PredefinedAdmin.findOneAndUpdate(
      { email: adminEmail },
      { email: adminEmail },
      { upsert: true }
    );

    // Clean old test users
    await User.deleteMany({ email: { $in: [userEmail] } });

    // Seed admin
    let adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      adminUser = await User.create({
        name: "Admin Manager",
        email: adminEmail,
        password: "Password123!",
        role: "admin"
      });
    }

    // Seed standard user
    const testUser = await User.create({
      name: "Suspendable User",
      email: userEmail,
      password: "Password123!",
      role: "visitor"
    });

    // Login Admin
    const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: adminEmail, password: "Password123!" })
    });
    const adminLoginData = await adminLoginRes.json();
    const adminToken = adminLoginData.token;
    console.log("✅ Admin authorized");

    // Login user initially
    let userLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail, password: "Password123!" })
    });
    let userLoginData = await userLoginRes.json();
    let userToken = userLoginData.token;
    console.log("✅ User logged in initially");

    // --- TEST 1: Admin Reset User Password ---
    console.log("\n--- Test 1: Admin Resets User Password ---");
    const resetRes = await fetch(`${baseUrl}/admin/users/${testUser._id}/reset-password`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`
      },
      body: JSON.stringify({ password: "NewPassword123!" })
    });
    const resetData = await resetRes.json();
    if (!resetRes.ok) {
      throw new Error(`Reset password failed: ${JSON.stringify(resetData)}`);
    }
    console.log("✅ Admin successfully reset user's password to 'NewPassword123!'");

    // --- TEST 2: User tries login with OLD password (should fail) ---
    console.log("\n--- Test 2: User login with old password ---");
    userLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail, password: "Password123!" })
    });
    userLoginData = await userLoginRes.json();
    if (userLoginRes.ok) {
      throw new Error("User was able to log in with OLD password after reset");
    }
    console.log("✅ Correctly rejected login with old password. Message:", userLoginData.message);

    // --- TEST 3: User logs in with NEW password (should succeed) ---
    console.log("\n--- Test 3: User login with new password ---");
    userLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail, password: "NewPassword123!" })
    });
    userLoginData = await userLoginRes.json();
    if (!userLoginRes.ok) {
      throw new Error(`User failed to log in with new password: ${JSON.stringify(userLoginData)}`);
    }
    userToken = userLoginData.token;
    console.log("✅ User successfully logged in with new password");

    // --- TEST 4: Admin suspends user with a reason ---
    console.log("\n--- Test 4: Admin Suspends User ---");
    const suspendRes = await fetch(`${baseUrl}/admin/users/${testUser._id}/suspend`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`
      },
      body: JSON.stringify({ suspend: true, reason: "Spam behavior detected." })
    });
    const suspendData = await suspendRes.json();
    if (!suspendRes.ok || !suspendData.data.isSuspended) {
      throw new Error(`Failed to suspend user: ${JSON.stringify(suspendData)}`);
    }
    console.log("✅ User suspended. Reason:", suspendData.data.suspensionReason);

    // --- TEST 5: User tries to log in while suspended (should fail with 403) ---
    console.log("\n--- Test 5: Suspended user logs in ---");
    userLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail, password: "NewPassword123!" })
    });
    userLoginData = await userLoginRes.json();
    if (userLoginRes.ok) {
      throw new Error("Suspended user was able to log in");
    }
    console.log("✅ Correctly blocked suspended user login. Status:", userLoginRes.status, "Msg:", userLoginData.message);

    // --- TEST 6: User tries to access protected endpoint using active token (should fail with 403) ---
    console.log("\n--- Test 6: Accessing API using active token while suspended ---");
    const profileRes = await fetch(`${baseUrl}/verification/my`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${userToken}` }
    });
    const profileData = await profileRes.json();
    if (profileRes.ok) {
      throw new Error("Suspended user token successfully authenticated");
    }
    console.log("✅ Correctly rejected suspended token. Status:", profileRes.status, "Msg:", profileData.message);

    // --- TEST 7: Admin unsuspends user ---
    console.log("\n--- Test 7: Admin Unsuspends User ---");
    const unsuspendRes = await fetch(`${baseUrl}/admin/users/${testUser._id}/suspend`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`
      },
      body: JSON.stringify({ suspend: false })
    });
    const unsuspendData = await unsuspendRes.json();
    if (!unsuspendRes.ok || unsuspendData.data.isSuspended) {
      throw new Error(`Failed to unsuspend user: ${JSON.stringify(unsuspendData)}`);
    }
    console.log("✅ User unsuspended successfully");

    // --- TEST 8: User accesses protected endpoint (should succeed now) ---
    console.log("\n--- Test 8: Login and access after unsuspend ---");
    userLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail, password: "NewPassword123!" })
    });
    userLoginData = await userLoginRes.json();
    if (!userLoginRes.ok) {
      throw new Error("Failed to log in after unsuspend");
    }
    console.log("✅ User logged in and accessed protected app after unsuspend");

    // --- TEST 9: Admin blocks user ---
    console.log("\n--- Test 9: Admin Blocks User ---");
    const blockRes = await fetch(`${baseUrl}/admin/users/${testUser._id}/block`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`
      },
      body: JSON.stringify({ block: true, reason: "Terms of service violation." })
    });
    const blockData = await blockRes.json();
    if (!blockRes.ok || !blockData.data.isBlocked) {
      throw new Error(`Failed to block user: ${JSON.stringify(blockData)}`);
    }
    console.log("✅ User blocked. Reason:", blockData.data.blockReason);

    // --- TEST 10: User tries to log in while blocked (should fail) ---
    console.log("\n--- Test 10: Blocked user logs in ---");
    userLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail, password: "NewPassword123!" })
    });
    userLoginData = await userLoginRes.json();
    if (userLoginRes.ok) {
      throw new Error("Blocked user was able to log in");
    }
    console.log("✅ Correctly blocked user login. Status:", userLoginRes.status, "Msg:", userLoginData.message);

    console.log("\n🎉 ALL USER MANAGEMENT SYSTEM TESTS PASSED SUCCESSFULLY!");
  } catch (error) {
    console.error("\n❌ TEST FAILED:", error.message);
    process.exit(1);
  } finally {
    server.close();
    await mongoose.disconnect();
    process.exit(0);
  }
}

runUserManagementTests();
