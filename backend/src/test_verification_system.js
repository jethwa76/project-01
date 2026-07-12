import mongoose from "mongoose";
import app from "./app.js";
import User from "./models/User.js";
import VerificationDocument from "./models/VerificationDocument.js";
import Notification from "./models/Notification.js";
import PredefinedAdmin from "./models/PredefinedAdmin.js";
import { connectDatabase } from "./config/db.js";

async function runVerificationTests() {
  console.log("🚀 Starting User Verification System Integration Tests...");

  await connectDatabase();

  const PORT = 5004;
  const server = app.listen(PORT, () => {
    console.log(`📡 Test Server running on port ${PORT}`);
  });

  const baseUrl = `http://localhost:${PORT}/api`;

  try {
    // Ensure predefined admin exists
    const adminEmail = "admin@example.com";
    await PredefinedAdmin.findOneAndUpdate(
      { email: adminEmail },
      { email: adminEmail },
      { upsert: true }
    );

    // Clean old test users and documents
    await User.deleteMany({ email: { $in: ["user-verify-test@example.com"] } });
    await VerificationDocument.deleteMany({});
    await Notification.deleteMany({});

    // 1. Create and authenticate Admin
    let adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      adminUser = await User.create({
        name: "Admin Reviewer",
        email: adminEmail,
        password: "Password123!",
        role: "admin"
      });
    }

    const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: adminEmail, password: "Password123!" })
    });
    const adminLoginData = await adminLoginRes.json();
    const adminToken = adminLoginData.token;
    console.log("✅ Admin logged in and authorized");

    // 2. Create and authenticate a regular user
    const testUser = await User.create({
      name: "Verify Tester",
      email: "user-verify-test@example.com",
      password: "Password123!",
      role: "visitor"
    });

    const userLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "user-verify-test@example.com", password: "Password123!" })
    });
    const userLoginData = await userLoginRes.json();
    const userToken = userLoginData.token;
    console.log("✅ Regular user logged in");

    // 3. User Submits Verification Document
    console.log("\n--- Test 3: Submit Verification Document ---");
    const formData = new FormData();
    formData.append("documentType", "Student ID");
    // Attach a dummy file buffer
    const blob = new Blob(["dummy content"], { type: "image/png" });
    formData.append("file", blob, "student_id.png");

    const submitRes = await fetch(`${baseUrl}/verification`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${userToken}`
      },
      body: formData
    });

    const submitData = await submitRes.json();
    if (!submitRes.ok || !submitData.success) {
      throw new Error(`Submission failed: ${JSON.stringify(submitData)}`);
    }
    console.log("✅ Verification document submitted. Status:", submitData.data.status);
    const docId = submitData.data._id;

    // 4. User Views Own Verification List
    console.log("\n--- Test 4: Retrieve Own Verification History ---");
    const getMyRes = await fetch(`${baseUrl}/verification/my`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${userToken}` }
    });
    const getMyData = await getMyRes.json();
    if (!getMyRes.ok || getMyData.data.length === 0) {
      throw new Error(`Failed to retrieve own verification list: ${JSON.stringify(getMyData)}`);
    }
    console.log("✅ Successfully retrieved own verification list (count:", getMyData.data.length, ")");

    // 5. Admin Lists All Submissions
    console.log("\n--- Test 5: Admin Retrieve All Submissions ---");
    const adminGetRes = await fetch(`${baseUrl}/verification`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${adminToken}` }
    });
    const adminGetData = await adminGetRes.json();
    if (!adminGetRes.ok || adminGetData.data.length === 0) {
      throw new Error(`Admin failed to get verifications: ${JSON.stringify(adminGetData)}`);
    }
    console.log("✅ Admin successfully listed all submissions (count:", adminGetData.data.length, ")");

    // 6. Admin Reviews Submission (Approved with Remarks)
    console.log("\n--- Test 6: Admin Approves Submission ---");
    const reviewRes = await fetch(`${baseUrl}/verification/${docId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        status: "approved",
        remarks: "Valid Student ID card matched."
      })
    });
    const reviewData = await reviewRes.json();
    if (!reviewRes.ok || reviewData.data.status !== "approved") {
      throw new Error(`Admin review update failed: ${JSON.stringify(reviewData)}`);
    }
    console.log("✅ Admin approved the document. Remarks:", reviewData.data.remarks);

    // 7. Verify User Received In-App Notification
    console.log("\n--- Test 7: Verify Notification Dispatch ---");
    const notifications = await Notification.find({ user: testUser._id });
    if (notifications.length === 0) {
      throw new Error("No notification was generated for the user");
    }
    console.log("✅ User received verification status notification: Title:", notifications[0].title);
    console.log("   Body:", notifications[0].body);

    console.log("\n🎉 ALL USER VERIFICATION SYSTEM TESTS PASSED SUCCESSFULLY!");
  } catch (error) {
    console.error("\n❌ TEST FAILED:", error.message);
    process.exit(1);
  } finally {
    server.close();
    await mongoose.disconnect();
    process.exit(0);
  }
}

runVerificationTests();
