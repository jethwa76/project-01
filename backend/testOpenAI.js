import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function testAI() {
    try {
        const response = await client.responses.create({
            model: "gpt-4.1-mini",
            input: "Explain MERN stack in one sentence."
        });

        console.log(response.output_text);
    } catch (error) {
        console.log("OpenAI Error:", error.message);
    }
}

testAI();