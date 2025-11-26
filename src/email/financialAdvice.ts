/**
 * Financial advice service with OpenAI integration
 * Generates both spending breakdown and personalized financial advice
 */

import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { AdviceInput, AIResponse, AICategory } from "./types";

const ADVISOR_PROMPT_PATH = path.join(process.cwd(), "financial-advisor-prompt.txt");

/**
 * Load user-editable financial advisor prompt from file
 * This file contains ONLY the instructions for the AI - formatting requirements are injected programmatically
 */
function loadAdvisorPrompt(): string {
  try {
    if (fs.existsSync(ADVISOR_PROMPT_PATH)) {
      return fs.readFileSync(ADVISOR_PROMPT_PATH, "utf-8");
    }
  } catch (error: any) {
    console.warn("Failed to load financial-advisor-prompt.txt, using default:", error.message);
  }

  // Default fallback (user-friendly instructions only)
  return `You are a financial advisor. Analyze my spending for the period and provide insights to help me manage my budget better.

Key figures:
- Total spent: {{totalSpend}}
- Weekly Budget: {{weeklyAllowance}}
- Monthly Budget: {{monthlyAllowance}}
- Transactions count: {{transactionCount}}

Recent transactions (grouped by merchant):
{{transactionsSummary}}

Please provide:

1. SPENDING CATEGORIES: Intelligently categorize all my spending into meaningful categories (e.g., Food & Dining, Groceries, Transport, Shopping, Entertainment, Bills, Health, etc.). Assign an appropriate emoji to each category.

2. SPENDING BREAKDOWN: For each category, list the vendors/merchants with their amounts. Present this as an organized, easy-to-scan summary.

3. FINANCIAL ADVICE: Provide 3-5 specific, actionable insights:
   - Brief summary of my spending patterns
   - Whether I'm on track with my budget (ignoring large irregular purchases)
   - Two specific actionable tips to save money
   - Any notable spending patterns or concerns I should be aware of`;
}

/**
 * Get the hard-coded categorization and JSON formatting requirements (NOT user-editable)
 * This is injected programmatically to ensure exact response format
 */
function getHardCodedInstructions(): string {
  return `

═══════════════════════════════════════════════════════════════════════
🔒 HARD-CODED SYSTEM INSTRUCTIONS (DO NOT MODIFY)
═══════════════════════════════════════════════════════════════════════

TASK 1: INTELLIGENT CATEGORIZATION
───────────────────────────────────
Analyze ALL transactions and create meaningful spending categories:
- Examples: Food & Dining 🍔, Groceries 🛒, Transport 🚗, Shopping 🛍️,
  Entertainment 🎬, Bills & Utilities 💡, Health & Fitness 💪, Personal Care 💅
- Choose the MOST RELEVANT emoji for each category
- Ensure categories are mutually exclusive (no overlap)
- Order categories by amount spent (highest first)
- Include top 3 vendors for each category with their amounts

═══════════════════════════════════════════════════════════════════════
⚠️ CRITICAL: RESPONSE FORMAT REQUIREMENTS
═══════════════════════════════════════════════════════════════════════

YOU MUST RETURN A VALID JSON OBJECT WITH THIS EXACT STRUCTURE:

{
  "categories": [
    {
      "name": "Category Name",
      "emoji": "🛒",
      "amount": 123.45,
      "percentage": 25.5,
      "topVendors": [
        {"name": "Tesco", "amount": 67.89},
        {"name": "Sainsbury's", "amount": 34.56},
        {"name": "Waitrose", "amount": 21.00}
      ]
    }
  ],
  "spendingBreakdown": "LEAVE THIS EMPTY - UI WILL RENDER",
  "advice": "<HTML string with your financial advice>"
}

RULES FOR "categories" ARRAY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Each category MUST have: name, emoji, amount, percentage, topVendors
✓ "amount" must be a NUMBER (not string with £ symbol)
✓ "percentage" must be a NUMBER (not string with % symbol)
✓ "topVendors" must be array of objects: {name: string, amount: number}
✓ Include top 3 vendors per category (or fewer if not available)
✓ Sort categories by amount (highest first)

RULES FOR "spendingBreakdown":
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Set this to empty string: ""
✓ The UI will render the categories with progress bars automatically
✓ DO NOT generate HTML for spending breakdown

RULES FOR "advice" (HTML STRING):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ MUST be valid HTML (not plain text)
✓ Use <h4> tags for section headings with emojis (e.g., <h4>💰 Budget Performance</h4>)
✓ Use <ul> and <li> tags for bullet points
✓ Use <strong> tags for emphasis on numbers/actions
✓ Keep it concise and scannable
✓ Follow the advice instructions from the user-editable section above

JSON VALIDATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Use double quotes for all strings
✓ Escape special characters in HTML strings
✓ NO markdown code fences (no \`\`\`json)
✓ NO text outside the JSON structure
✓ Return ONLY valid JSON

═══════════════════════════════════════════════════════════════════════`;
}

/**
 * Generate financial advice and spending breakdown using OpenAI
 * Returns AIResponse with both spending breakdown and advice HTML
 */
export async function generateFinancialAdviceAndBreakdown(input: AdviceInput): Promise<AIResponse> {
  // Check if OpenAI is configured
  if (!process.env.OPENAI_API_KEY) {
    console.warn("⚠️  OpenAI API key not configured, using fallback");
    return generateFallbackResponse(input);
  }

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Load user-editable advisor prompt and add formatting requirements
    let userPrompt = loadAdvisorPrompt();

    // Replace all placeholders in user prompt
    userPrompt = userPrompt.replace(/\{\{totalSpend\}\}/g, `£${input.totalSpend.toFixed(2)}`);
    userPrompt = userPrompt.replace(/\{\{weeklyAllowance\}\}/g, input.budget ? `£${input.budget.toFixed(2)}` : 'Not set');
    userPrompt = userPrompt.replace(/\{\{monthlyAllowance\}\}/g, input.budget ? `£${(input.budget * 4).toFixed(2)}` : 'Not set');
    userPrompt = userPrompt.replace(/\{\{periodLabel\}\}/g, input.periodLabel || 'this period');
    userPrompt = userPrompt.replace(/\{\{transactionCount\}\}/g, input.transactionCount.toString());
    userPrompt = userPrompt.replace(/\{\{largeTransactionLimit\}\}/g, '100'); // Default threshold
    userPrompt = userPrompt.replace(/\{\{largePurchaseCount\}\}/g, input.biggestPurchases.length.toString());

    // Budget status
    const overUnder = input.overUnder !== null && input.overUnder !== undefined
      ? (input.overUnder > 0
          ? `£${Math.abs(input.overUnder).toFixed(2)} OVER budget ⚠️`
          : input.overUnder < 0
            ? `£${Math.abs(input.overUnder).toFixed(2)} UNDER budget ✅`
            : 'Exactly on budget ✨')
      : 'No budget set';
    userPrompt = userPrompt.replace(/\{\{overUnder\}\}/g, overUnder);

    // Build detailed transactions summary
    const transactionsSummary = input.topMerchants
      .map((m, i) => `${i + 1}. ${m.name}: ${m.amountFormatted} (${m.transactionCount} transaction${m.transactionCount > 1 ? 's' : ''})`)
      .join('\n');
    userPrompt = userPrompt.replace(/\{\{transactionsSummary\}\}/g, transactionsSummary);

    // Combine user prompt with hard-coded instructions
    const fullPrompt = userPrompt + getHardCodedInstructions();

    console.log("🤖 Calling OpenAI for AI analysis...");

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful financial advisor. Return responses ONLY as valid JSON with 'categories' (array), 'spendingBreakdown' (HTML string), and 'advice' (HTML string) fields. Do not include markdown code fences."
        },
        {
          role: "user",
          content: fullPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      console.warn("⚠️  OpenAI returned empty response");
      return generateFallbackResponse(input);
    }

    console.log("✅ AI analysis generated successfully");

    // Parse JSON response
    try {
      // Clean up the response - remove any markdown code fences if present
      let cleanedResponse = response.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const parsed = JSON.parse(cleanedResponse);

      // Validate the response structure (advice is required, spendingBreakdown is optional/ignored)
      if (parsed.categories && Array.isArray(parsed.categories) && parsed.advice) {
        // Validate categories array
        const validCategories = parsed.categories.filter((cat: any) =>
          cat.name && cat.emoji && typeof cat.amount === 'number' && typeof cat.percentage === 'number'
        );

        if (validCategories.length === 0) {
          console.warn("⚠️  No valid categories in OpenAI response");
          return generateFallbackResponse(input);
        }

        // Generate spending breakdown HTML from categories (UI controls design, not AI)
        const spendingBreakdownHtml = generateSpendingBreakdownHtml(validCategories);

        return {
          categories: validCategories,
          spendingBreakdown: spendingBreakdownHtml,
          advice: parsed.advice,
        };
      } else {
        console.warn("⚠️  Invalid JSON structure from OpenAI (missing categories or advice)");
        return generateFallbackResponse(input);
      }
    } catch (parseError: any) {
      console.error("❌ Failed to parse OpenAI JSON response:", parseError.message);
      console.log("Raw response:", response);
      return generateFallbackResponse(input);
    }

  } catch (error: any) {
    console.error("❌ OpenAI API error:", error.message);
    return generateFallbackResponse(input);
  }
}

/**
 * Generate fallback response when OpenAI is unavailable
 */
function generateFallbackResponse(input: AdviceInput): AIResponse {
  // Generate categories from category totals (fallback)
  const categories: AICategory[] = input.categoryTotals.map(cat => ({
    name: cat.name,
    emoji: getCategoryEmoji(cat.name),
    amount: parseFloat(cat.amountFormatted.replace('£', '').replace(',', '')),
    percentage: cat.percentageOfTotal,
  }));

  // Generate spending breakdown HTML using same function as AI response
  const breakdownHtml = generateSpendingBreakdownHtml(categories);

  // Generate generic advice
  const adviceBullets: string[] = [];

  if (input.budget && input.overUnder !== null) {
    if (input.overUnder > 0) {
      adviceBullets.push(`You spent £${Math.abs(input.overUnder).toFixed(2)} over your budget. Review your largest purchases to identify areas for adjustment.`);
    } else if (input.overUnder < 0) {
      adviceBullets.push(`Great job staying £${Math.abs(input.overUnder).toFixed(2)} under budget! Keep up the disciplined spending.`);
    } else {
      adviceBullets.push(`You're right on target with your budget. Well done!`);
    }
  }

  if (input.transactionCount > 20) {
    adviceBullets.push(`You made ${input.transactionCount} transactions this period. Consider consolidating purchases to reduce impulse spending.`);
  }

  if (input.categoryTotals.length > 0) {
    const topCategory = input.categoryTotals[0];
    adviceBullets.push(`Your highest spending category was ${topCategory.name} at ${topCategory.amountFormatted}. Review if this aligns with your priorities.`);
  }

  adviceBullets.push(`Review recurring subscriptions and memberships to ensure you're getting value from each one.`);

  const adviceHtml = '<ul style="margin: 0; padding-left: 20px;">' +
    adviceBullets.map(bullet => `<li style="margin-bottom: 12px; line-height: 1.5;">${escapeHtml(bullet)}</li>`).join('') +
    '</ul>';

  return {
    categories,
    spendingBreakdown: breakdownHtml,
    advice: adviceHtml,
  };
}

/**
 * Get emoji for category name (fallback helper)
 */
function getCategoryEmoji(categoryName: string): string {
  const lowerName = categoryName.toLowerCase();
  if (lowerName.includes('food') || lowerName.includes('dining') || lowerName.includes('restaurant')) return '🍔';
  if (lowerName.includes('grocer')) return '🛒';
  if (lowerName.includes('transport') || lowerName.includes('travel') || lowerName.includes('uber')) return '🚗';
  if (lowerName.includes('shopping') || lowerName.includes('retail')) return '🛍️';
  if (lowerName.includes('entertainment') || lowerName.includes('streaming')) return '🎬';
  if (lowerName.includes('bill') || lowerName.includes('utilit')) return '💡';
  if (lowerName.includes('health') || lowerName.includes('medical')) return '🏥';
  if (lowerName.includes('fitness') || lowerName.includes('gym')) return '💪';
  return '📦'; // Default
}

/**
 * Generate spending breakdown HTML from categories (UI renders the design)
 * This ensures consistent design across UI and email
 */
function generateSpendingBreakdownHtml(categories: AICategory[]): string {
  if (!categories || categories.length === 0) {
    return '<p style="color: #6b7280;">No spending data available.</p>';
  }

  let html = '<div style="display: flex; flex-direction: column; gap: 16px;">';

  categories.forEach(cat => {
    // Color coding based on percentage
    const barColor = cat.percentage > 30 ? '#ef4444' : cat.percentage > 15 ? '#f59e0b' : '#667eea';

    html += '<div class="category-bar">';

    // Tooltip with top vendors
    if (cat.topVendors && cat.topVendors.length > 0) {
      html += '<div class="category-tooltip">';
      html += '<div style="font-weight: 600; margin-bottom: 4px;">Top Vendors:</div>';
      cat.topVendors.forEach((vendor, i) => {
        html += `<div>${i + 1}. ${escapeHtml(vendor.name)}: £${vendor.amount.toFixed(2)}</div>`;
      });
      html += '</div>';
    }

    // Category name and amount
    html += '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">';
    html += `<span style="font-weight: 600; color: #111827; font-size: 15px;">${cat.emoji} ${escapeHtml(cat.name)}</span>`;
    html += `<span style="font-weight: 700; color: #111827; font-size: 15px;">£${cat.amount.toFixed(2)}</span>`;
    html += '</div>';

    // Progress bar
    html += '<div style="display: flex; align-items: center; gap: 12px;">';
    html += '<div style="flex: 1; background: #e5e7eb; border-radius: 9999px; height: 8px; overflow: hidden;">';
    html += `<div style="width: ${Math.min(cat.percentage, 100)}%; height: 100%; background: ${barColor};"></div>`;
    html += '</div>';
    html += `<span style="font-size: 13px; color: #6b7280; font-weight: 600; min-width: 45px; text-align: right;">${cat.percentage.toFixed(1)}%</span>`;
    html += '</div>';

    html += '</div>'; // close category-bar
  });

  html += '</div>';
  return html;
}

/**
 * Helper function to escape HTML entities
 */
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
