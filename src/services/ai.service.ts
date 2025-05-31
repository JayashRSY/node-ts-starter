import { openai } from "../configs/openai";
import pdfParse from "pdf-parse";

interface Transaction {
  platform: string;
  category: string;
  amount: number;
}

export async function getCardRecommendation(
  amount: number,
  platform: string,
  category: string,
  transactionMode: string,
  cards: string[]
): Promise<string> {
  const prompt = `
    You are a credit card recommendation engine.

    The user has the following credit cards: ${cards.join(", ")}.
    They are going to spend ₹${amount} on "${platform}" in the category "${category}" in ${transactionMode} mode.
    Your job is to select the best credit card from the user's wallet to maximize cashback, points, or discounts based on real or commonly known Indian credit card reward programs.
    Respond ONLY with a valid JSON object in this **exact format**:
    {
      "card": "Card Name",
      "savings": "₹XXX",
      "reason": "Explain why this card is best in one sentence"
    }
    Do not include any text, explanation, markdown, or comments outside the JSON object. Only output valid JSON.
    `;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return completion.choices[0].message?.content || "No recommendation found.";
}

export async function extractStatementDataFromPdf(pdfBuffer: Buffer): Promise<string> {
  const parsed = await pdfParse(pdfBuffer);
  const pdfText = parsed.text;

  const prompt = `
    You are a financial assistant. Extract the following structured information from the credit card statement text:

    - card_holder_name
    - card_number_last4
    - statement_period: { from: string, to: string }
    - total_due
    - minimum_due
    - due_date
    - transactions: [{ date, description, amount }]
    - reward_points_earned
    - reward_points_redeemed
    - total_spent
    - category_breakdown: { category: string, amount: number }[]

    Statement Text:
    ${pdfText}

    Return as JSON.
  `;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
  });

  return completion.choices[0].message?.content || "No data extracted.";
}
