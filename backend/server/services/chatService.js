// 💬 chatService.js — AI Chat Service
// Tries OpenAI first. If no API key, falls back to smart local replies using real account data.

// ============================================================
// SMART LOCAL REPLY ENGINE (No API key needed)
// Receives the user's question + real account data from the DB
// ============================================================
const getSmartReply = (userQuestion, userData) => {
    const q = userQuestion.toLowerCase();

    const { username, balance, transactions } = userData;
    const expenses = transactions.filter(t => t.is_negative === 1);
    const income   = transactions.filter(t => t.is_negative === 0);

    // ── Helper: total amount from a list of transactions ──
    const sum = (list) => list.reduce((acc, t) => acc + parseFloat(t.amount || 0), 0);

    // ── Helper: group expenses by category ──
    const byCategory = () => {
        const map = {};
        expenses.forEach(t => {
            const cat = t.category || 'Other';
            map[cat] = (map[cat] || 0) + parseFloat(t.amount || 0);
        });
        return map;
    };

    // ── Helper: group expenses by month ──
    const byMonth = () => {
        const map = {};
        expenses.forEach(t => {
            if (!t.date) return;
            const month = t.date.substring(0, 7); // "2025-01"
            map[month] = (map[month] || 0) + parseFloat(t.amount || 0);
        });
        return map;
    };

    // ── Helper: format currency ──
    const eur = (n) => `€${Math.abs(n).toFixed(2)}`;

    // ── Helper: month name from "2025-01" ──
    const monthName = (key) => {
        const [y, m] = key.split('-');
        const date = new Date(parseInt(y), parseInt(m) - 1);
        return date.toLocaleString('en-GB', { month: 'long', year: 'numeric' });
    };

    // ══════════════════════════════════════════════════════════
    // GREETINGS
    // ══════════════════════════════════════════════════════════
    if (q.match(/\b(hi|hello|hey|good morning|good evening|howdy)\b/)) {
        return `Hello ${username}! 👋 I'm Andy, your Vindobona Pro assistant. How can I help you today?\n\nYou can ask me about your balance, spending, ATM locations, or get help anytime!`;
    }

    // ══════════════════════════════════════════════════════════
    // BALANCE
    // ══════════════════════════════════════════════════════════
    if (q.includes('balance') || q.includes('how much do i have') || q.includes('my money') || q.includes('account total')) {
        const totalIncome  = sum(income);
        const totalExpense = sum(expenses);
        return `💰 **Your Account Summary, ${username}:**\n\n` +
               `• Current Balance: **${eur(balance)}**\n` +
               `• Total Income:    **+${eur(totalIncome)}**\n` +
               `• Total Spent:     **-${eur(totalExpense)}**\n\n` +
               `Your balance is always live and updates after every transaction.`;
    }

    // ══════════════════════════════════════════════════════════
    // HOW MUCH DID I SPEND (overall)
    // ══════════════════════════════════════════════════════════
    if (q.includes('how much did i spend') || q.includes('total spent') || q.includes('spending total') || q.includes('i spend')) {
        const totalSpent = sum(expenses);
        const catMap = byCategory();
        const topCat = Object.entries(catMap).sort((a,b) => b[1] - a[1])[0];

        let reply = `📊 **Your Spending Summary, ${username}:**\n\n` +
                    `• Total Spent: **${eur(totalSpent)}**\n`;

        if (topCat) {
            reply += `• Biggest Category: **${topCat[0]}** — ${eur(topCat[1])}\n`;
        }

        reply += `\nCheck the **Spending Distribution** chart on your dashboard for a full visual breakdown!`;
        return reply;
    }

    // ══════════════════════════════════════════════════════════
    // SPENDING BY MONTH (e.g. "in january", "last month")
    // ══════════════════════════════════════════════════════════
    const MONTHS = ['january','february','march','april','may','june',
                    'july','august','september','october','november','december'];
    const foundMonth = MONTHS.findIndex(m => q.includes(m));

    if (foundMonth !== -1 || q.includes('last month') || q.includes('this month')) {
        const monthMap = byMonth();
        const now = new Date();
        let targetMonth;

        if (q.includes('last month')) {
            const d = new Date(now.getFullYear(), now.getMonth() - 1);
            targetMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}`;
        } else if (q.includes('this month')) {
            targetMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2,'0')}`;
        } else {
            // Match the month name to the current or last year
            const mNum = String(foundMonth + 1).padStart(2,'0');
            const yr = now.getMonth() >= foundMonth ? now.getFullYear() : now.getFullYear() - 1;
            targetMonth = `${yr}-${mNum}`;
        }

        const spent = monthMap[targetMonth];
        if (spent) {
            return `📅 In **${monthName(targetMonth)}**, you spent a total of **${eur(spent)}**.\n\nView the Cash Flow chart on your dashboard to see income vs. expenses over time!`;
        } else {
            return `📅 I don't have any spending records for **${monthName(targetMonth)}** yet.\n\nTry checking your Transaction List on the dashboard for a full history.`;
        }
    }

    // ══════════════════════════════════════════════════════════
    // WHERE DID I SPEND MOST / BIGGEST CATEGORY
    // ══════════════════════════════════════════════════════════
    if (q.includes('most') || q.includes('category') || q.includes('where did i spend') ||
        q.includes('biggest') || q.includes('top spending') || q.includes('spend more')) {
        const catMap = byCategory();
        const sorted = Object.entries(catMap).sort((a, b) => b[1] - a[1]);

        if (sorted.length === 0) {
            return `I don't see any expense transactions yet, ${username}. Add some transactions to see your spending breakdown!`;
        }

        let reply = `🏆 **Your Top Spending Categories, ${username}:**\n\n`;
        sorted.slice(0, 5).forEach(([cat, amt], i) => {
            const emoji = ['🥇','🥈','🥉','4️⃣','5️⃣'][i];
            reply += `${emoji} ${cat}: **${eur(amt)}**\n`;
        });
        reply += `\nSee the full **Spending Distribution** pie chart on your dashboard for a visual view!`;
        return reply;
    }

    // ══════════════════════════════════════════════════════════
    // ATM / NEAREST ATM
    // ══════════════════════════════════════════════════════════
    if (q.includes('atm') || q.includes('cash') || q.includes('nearest') || q.includes('closest') || q.includes('withdraw')) {
        return `🏧 **Find Your Nearest ATM:**\n\n` +
               `Your nearest Vindobona Pro ATMs are typically located at:\n` +
               `• Major bank branches in your city centre\n` +
               `• Shopping centres and supermarkets\n` +
               `• Train stations and airports\n\n` +
               `📍 Use the **ATM Map** at the bottom of your dashboard for a live, interactive map showing ATMs near your current location!\n\n` +
               `Just scroll down on the Dashboard view and tap on any red marker 📌`;
    }

    // ══════════════════════════════════════════════════════════
    // HELP / SUPPORT / CONTACT
    // ══════════════════════════════════════════════════════════
    if (q.includes('help') || q.includes('support') || q.includes('contact') ||
        q.includes('phone') || q.includes('email') || q.includes('problem') || q.includes('issue')) {
        return `🆘 **Vindobona Pro Support Centre:**\n\n` +
               `📞 **Phone:** +43 1 234 5678\n` +
               `   Available Mon–Fri, 08:00–20:00 CET\n\n` +
               `📧 **Email:** support@vindobonapro.at\n` +
               `   We reply within 24 hours\n\n` +
               `💬 **Live Chat:** You're already here! Describe your issue and I'll guide you.\n\n` +
               `🌐 **Help Centre:** Click **Help Center** in the sidebar for FAQs and guides.\n\n` +
               `For urgent card issues (lost/stolen), call us immediately at **+43 1 234 5678**.`;
    }

    // ══════════════════════════════════════════════════════════
    // FREEZE CARD / CARD QUESTIONS
    // ══════════════════════════════════════════════════════════
    if (q.includes('freeze') || q.includes('card') || q.includes('block') || q.includes('lost card') || q.includes('stolen')) {
        return `💳 **Card Management:**\n\n` +
               `To **freeze your card** immediately:\n` +
               `1. Click **Payment Methods** in the left sidebar\n` +
               `2. Click the **Freeze Card** toggle on your card\n` +
               `3. The card is instantly frozen — no transactions can be made\n\n` +
               `To unfreeze, simply toggle it back!\n\n` +
               `🚨 If your card is **lost or stolen**, call us now:\n` +
               `📞 **+43 1 234 5678** (24/7 Emergency Line)`;
    }

    // ══════════════════════════════════════════════════════════
    // FX / CURRENCY / EXCHANGE
    // ══════════════════════════════════════════════════════════
    if (q.includes('fx') || q.includes('exchange') || q.includes('currency') || q.includes('convert') || q.includes('foreign')) {
        return `💱 **FX Converter — How It Works:**\n\n` +
               `1. Click **FX Converter** in the sidebar\n` +
               `2. Select your source currency (e.g. EUR)\n` +
               `3. Select your target currency (e.g. USD, GBP, CHF)\n` +
               `4. Enter the amount and click **Convert**\n\n` +
               `✅ Your wallet balances update in real time.\n` +
               `📊 Live exchange rates are used for all conversions.\n\n` +
               `Your current EUR wallet balance: **${eur(balance)}**`;
    }

    // ══════════════════════════════════════════════════════════
    // BUDGET
    // ══════════════════════════════════════════════════════════
    if (q.includes('budget') || q.includes('limit') || q.includes('overspend') || q.includes('saving')) {
        return `🎯 **Budget Manager:**\n\n` +
               `You can set monthly spending limits by category:\n` +
               `1. Click **Budgets** in the sidebar\n` +
               `2. Set a limit for categories like Food, Shopping, Travel etc.\n` +
               `3. A progress bar shows how close you are to your limit\n\n` +
               `💡 Tip: Set a budget limit lower than your average spending to save more each month!`;
    }

    // ══════════════════════════════════════════════════════════
    // RECENT TRANSACTIONS
    // ══════════════════════════════════════════════════════════
    if (q.includes('transaction') || q.includes('recent') || q.includes('last payment') || q.includes('history')) {
        if (transactions.length === 0) {
            return `You don't have any transactions yet, ${username}. Use the **Transaction Form** on your dashboard to add your first one!`;
        }
        const recent = transactions.slice(0, 5);
        let reply = `📋 **Your 5 Most Recent Transactions, ${username}:**\n\n`;
        recent.forEach(t => {
            const sign = t.is_negative ? '−' : '+';
            const color = t.is_negative ? '🔴' : '🟢';
            reply += `${color} ${sign}${eur(t.amount)} — ${t.receiver} (${t.category || 'Uncategorized'}) — ${t.date || 'N/A'}\n`;
        });
        reply += `\nSee the full list in the **Transaction Ledger** on your dashboard.`;
        return reply;
    }

    // ══════════════════════════════════════════════════════════
    // INCOME / RECEIVED
    // ══════════════════════════════════════════════════════════
    if (q.includes('income') || q.includes('received') || q.includes('earn') || q.includes('salary') || q.includes('deposit')) {
        const totalIncome = sum(income);
        return `📥 **Your Total Income, ${username}:**\n\n` +
               `• Total received: **+${eur(totalIncome)}**\n` +
               `• Number of income entries: **${income.length}**\n\n` +
               `This includes all positive transactions (salaries, transfers received, deposits).`;
    }

    // ══════════════════════════════════════════════════════════
    // DEFAULT — friendly fallback
    // ══════════════════════════════════════════════════════════
    return `Hi ${username}! 🤔 I didn't quite understand that.\n\n` +
           `Here's what I can help you with:\n` +
           `• 💰 "What is my balance?"\n` +
           `• 📊 "How much did I spend?"\n` +
           `• 📅 "How much did I spend in January?"\n` +
           `• 🏆 "Where did I spend most?"\n` +
           `• 🏧 "Where is the nearest ATM?"\n` +
           `• 🆘 "I need help / contact support"\n` +
           `• 💳 "How do I freeze my card?"\n` +
           `• 💱 "How does FX exchange work?"\n\n` +
           `Just ask me anything about your Vindobona Pro account!`;
};

// ══════════════════════════════════════════════════════════════
// MAIN FUNCTION — tries OpenAI, falls back to smart local reply
// ══════════════════════════════════════════════════════════════
const askAi = async (systemPrompt, userQuestion, userData = null) => {
    const apiKey = process.env.OPENAI_API_KEY;

    // If no OpenAI key → use smart local reply engine
    if (!apiKey) {
        console.warn('⚠️  OPENAI_API_KEY not set — using smart local reply engine.');
        return userData ? getSmartReply(userQuestion, userData) : getSmartReply(userQuestion, {
            username: 'User', balance: 0, transactions: []
        });
    }

    try {
        const url = 'https://api.openai.com/v1/chat/completions';
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user',   content: userQuestion }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API returned status ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;

    } catch (error) {
        console.error('❌ OpenAI API call failed, falling back to local reply:', error.message);
        return userData ? getSmartReply(userQuestion, userData) : getSmartReply(userQuestion, {
            username: 'User', balance: 0, transactions: []
        });
    }
};

module.exports = { askAi };