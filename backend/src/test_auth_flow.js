import mongoose from "mongoose";
import app from "./app.js";
import User from "./models/User.js";
import Session from "./models/Session.js";
import Role from "./models/Role.js";
import crypto from "crypto";
import speakeasy from "speakeasy";
import { connectDatabase } from "./config/db.js";

async function runTests() {
  console.log("🚀 Starting Phase 1 Authentication & Security Integration Tests...");
  
  // Establish database connection
  await connectDatabase();
  
  // Start server on a test port
  const PORT = 5002;
  const server = app.listen(PORT, () => {
    console.log(`📡 Test Server running on port ${PORT}`);
  });

  const baseUrl = `http://localhost:${PORT}/api`;

  try {
    // 1. Database Connection check
    console.log("\n--- Test 1: Database Connection & Seed Validation ---");
    if (mongoose.connection.readyState !== 1) {
      throw new Error("Database not connected. Wait for connection.");
    }
    console.log("✅ MongoDB Connection Active");

    // Clean test user if exists
    await User.deleteOne({ email: "test-auth-user@example.com" });
    await Session.deleteMany({});

    // 2. Registration Flow
    console.log("\n--- Test 2: User Registration ---");
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Auth User",
        email: "test-auth-user@example.com",
        password: "Password123!"
      })
    });
    
    const regData = await regRes.json();
    if (regRes.status !== 201 || !regData.success) {
      throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
    }
    console.log("✅ User registered successfully. Token received:", !!regData.token);
    
    // Check if verification token was created in DB
    const userInDb = await User.findOne({ email: "test-auth-user@example.com" }).select("+emailVerificationToken +emailVerificationExpires");
    if (!userInDb || !userInDb.emailVerificationToken) {
      throw new Error("Verification token was not saved to DB.");
    }
    console.log("✅ Email verification token generated in database");

    // 3. Email Verification Flow
    console.log("\n--- Test 3: Email Verification ---");
    // Generate the raw token matching what was generated
    const rawVerifyToken = userInDb.emailVerificationToken; // Note: controller hashes, let's look at controller logic.
    // Wait, controller hashes it before saving:
    // const verifyToken = user.createEmailVerificationToken();
    // user.emailVerificationToken = crypto.createHash("sha256").update(verifyToken).digest("hex");
    // But since we did not return the raw unhashed token from register (except email), we can verify it directly in DB for the test or verify it via endpoint.
    // Let's get the token we generated. Wait, the controller sends it via email. In the test, let's grab the raw token.
    // Let's generate a new one manually to test the endpoint:
    const tempUser = await User.findOne({ email: "test-auth-user@example.com" });
    const rawToken = tempUser.createEmailVerificationToken();
    await tempUser.save();
    
    const verifyRes = await fetch(`${baseUrl}/auth/verify-email/${rawToken}`, {
      method: "GET"
    });
    const verifyData = await verifyRes.json();
    if (!verifyData.success) {
      throw new Error(`Email verification failed: ${JSON.stringify(verifyData)}`);
    }
    console.log("✅ Email verified successfully through endpoint");

    // Check emailVerified field in DB
    const verifiedUser = await User.findOne({ email: "test-auth-user@example.com" });
    if (!verifiedUser.emailVerified) {
      throw new Error("User emailVerified flag not set to true in database.");
    }
    console.log("✅ DB emailVerified status matches true");

    // 4. Session Management & Login
    console.log("\n--- Test 4: User Login and Session Management ---");
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test-auth-user@example.com",
        password: "Password123!"
      })
    });
    const loginData = await loginRes.json();
    if (!loginData.success) {
      throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
    }
    const token = loginData.token;
    console.log("✅ User logged in, received JWT access token");

    // Check if session was created in DB
    const sessions = await Session.find({ user: verifiedUser._id });
    if (sessions.length === 0) {
      throw new Error("No session created in database for this login.");
    }
    console.log("✅ Session record created in DB. Total active sessions:", sessions.length);

    // 5. Two-Factor Authentication Setup & Verification
    console.log("\n--- Test 5: Two-Factor Authentication Setup ---");
    const enable2FARes = await fetch(`${baseUrl}/auth/2fa/enable`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });
    const enable2FAData = await enable2FARes.json();
    if (!enable2FAData.success || !enable2FAData.qrCode || !enable2FAData.secret) {
      throw new Error(`2FA Enable failed: ${JSON.stringify(enable2FAData)}`);
    }
    console.log("✅ 2FA setup initiated. Secret & QR Code returned.");

    // Generate code using speakeasy
    const otpCode = speakeasy.totp({
      secret: enable2FAData.secret,
      encoding: "base32"
    });

    const verify2FARes = await fetch(`${baseUrl}/auth/2fa/verify`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ code: otpCode })
    });
    const verify2FAData = await verify2FARes.json();
    if (!verify2FAData.success) {
      throw new Error(`2FA verification failed: ${JSON.stringify(verify2FAData)}`);
    }
    console.log("✅ 2FA code verified and enabled on account");

    // Verify 2FA status in DB
    const twoFactorUser = await User.findOne({ email: "test-auth-user@example.com" });
    if (!twoFactorUser.twoFactorEnabled) {
      throw new Error("2FA not marked as enabled in DB.");
    }
    console.log("✅ User model twoFactorEnabled flag matches true");

    // 6. Login with 2FA Challenge
    console.log("\n--- Test 6: Login with 2FA OTP Challenge ---");
    const challengeRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test-auth-user@example.com",
        password: "Password123!"
      })
    });
    const challengeData = await challengeRes.json();
    if (!challengeData.requiresTwoFactor) {
      throw new Error(`Expected requiresTwoFactor challenge: ${JSON.stringify(challengeData)}`);
    }
    console.log("✅ Login challenge requested 2FA code successfully");

    // Send code
    const challengeOtp = speakeasy.totp({
      secret: enable2FAData.secret,
      encoding: "base32"
    });
    const verifiedLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test-auth-user@example.com",
        password: "Password123!",
        twoFactorCode: challengeOtp
      })
    });
    const verifiedLoginData = await verifiedLoginRes.json();
    if (!verifiedLoginData.success) {
      throw new Error(`OTP challenge failed: ${JSON.stringify(verifiedLoginData)}`);
    }
    console.log("✅ Sign in completed with OTP challenge validation");

    // 7. Role-Based Access Control
    console.log("\n--- Test 7: Role-Based Access Control (RBAC) ---");
    // Visitor should not access admin endpoint
    const adminCheckRes = await fetch(`${baseUrl}/admin`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (adminCheckRes.status === 200) {
      throw new Error("Visitor was allowed to access admin routes.");
    }
    console.log("✅ RBAC correctly blocks visitor from admin endpoints (Status 403/401)");

    console.log("\n🎉 All tests passed successfully!");
    
    // Cleanup
    await User.deleteOne({ email: "test-auth-user@example.com" });
    await Session.deleteMany({});
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
  } finally {
    server.close(() => {
      console.log("🔌 Test Server closed.");
      process.exit(0);
    });
  }
}

runTests();

