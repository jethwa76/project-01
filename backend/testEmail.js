import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

console.log("SMTP HOST:", process.env.SMTP_HOST);
console.log("SMTP PORT:", process.env.SMTP_PORT);
console.log("SMTP USER:", process.env.SMTP_USER);

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

transporter.verify((error) => {
    if (error) {
        console.log("SMTP Error:", error);
    } else {
        console.log("SMTP Connected Successfully ✅");
    }
});