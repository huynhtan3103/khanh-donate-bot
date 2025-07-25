// ===== KHANH TRANN DONATE BOT =====
// Tạo bởi AI Assistant cho Khanh Trann
// Bot nhận donate bằng Telegram Stars
// Bot Token: 8345096885:AAGiwUX74HOYNOwAYpZlupBs8AXnokipGZw
// TON Wallet: UQAz_a6I4tlAkkNescqIaUk38ojeRjxkHLx_abQirriHbk_L

const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Bot configuration
const BOT_TOKEN = '8345096885:AAGiwUX74HOYNOwAYpZlupBs8AXnokipGZw';
const bot = new TelegramBot(BOT_TOKEN);

// Enable webhook mode
app.use(express.json());

// Donate amounts configuration
const DONATE_AMOUNTS = {
    20: {
        emoji: '☕',
        title: 'Một ly cà phê nhỏ',
        message: '☕ Cảm ơn bạn đã ủng hộ một ly cà phê!\nRất cảm ơn sự support của bạn! 💖'
    },
    50: {
        emoji: '🍜',
        title: 'Bữa trưa ngon lành',
        message: '🍜 Cảm ơn bạn đã ủng hộ bữa trưa!\nBạn đã giúp tôi có bữa ăn ngon! 💖'
    },
    100: {
        emoji: '🚀',
        title: 'Động viên tinh thần',
        message: '🚀 Cảm ơn sự động viên mạnh mẽ!\nĐiều này thực sự có ý nghĩa với tôi! 💖'
    },
    250: {
        emoji: '👑',
        title: 'Siêu supporter VIP',
        message: '👑 WOW! Bạn là VIP supporter!\nCảm ơn bạn rất rất nhiều! Bạn thật tuyệt vời! 💖✨'
    }
};

// Database (simple JSON file for demo)
const DB_FILE = 'donations.json';

function initDatabase() {
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify({
            totalDonations: 0,
            totalAmount: 0,
            supporters: [],
            transactions: []
        }, null, 2));
    }
}

function getDatabase() {
    try {
        return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch (error) {
        console.error('Database read error:', error);
        return { totalDonations: 0, totalAmount: 0, supporters: [], transactions: [] };
    }
}

function saveDatabase(data) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Database save error:', error);
    }
}

function addDonation(userId, username, firstName, amount) {
    const db = getDatabase();
    const now = new Date();
    
    // Add transaction
    db.transactions.push({
        userId,
        username,
        firstName,
        amount,
        timestamp: now.toISOString(),
        date: now.toLocaleDateString('vi-VN')
    });
    
    // Update totals
    db.totalDonations += 1;
    db.totalAmount += amount;
    
    // Add/update supporter
    const existingSupporter = db.supporters.find(s => s.userId === userId);
    if (existingSupporter) {
        existingSupporter.totalAmount += amount;
        existingSupporter.donationCount += 1;
        existingSupporter.lastDonation = now.toISOString();
    } else {
        db.supporters.push({
            userId,
            username,
            firstName,
            totalAmount: amount,
            donationCount: 1,
            firstDonation: now.toISOString(),
            lastDonation: now.toISOString()
        });
    }
    
    saveDatabase(db);
    return db;
}

// Bot commands
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name || 'Bạn';
    
    const welcomeMessage = `
🌟 *Chào mừng ${firstName}!* 🌟

Cảm ơn bạn đã ghé thăm bot donate của *Khanh Trann*! 

💖 *Nếu bạn thích nội dung của tôi, hãy ủng hộ tôi nhé!*

🎯 *Các mức ủng hộ:*
☕ *20 Stars* - Một ly cà phê nhỏ
🍜 *50 Stars* - Bữa trưa ngon lành  
🚀 *100 Stars* - Động viên tinh thần
👑 *250 Stars* - Siêu supporter VIP

✨ Nhấn nút *"💖 Ủng hộ Khanh"* để bắt đầu!

🙏 Mọi sự ủng hộ đều có ý nghĩa rất lớn với tôi!
    `;
    
    const keyboard = {
        inline_keyboard: [
            [{ text: '💖 Ủng hộ Khanh', web_app: { url: `${process.env.WEBAPP_URL || 'https://your-domain.vercel.app'}/donate` } }],
            [{ text: '📊 Thống kê donate', callback_data: 'stats' }],
            [{ text: '👑 Top supporters', callback_data: 'top_supporters' }]
        ]
    };
    
    bot.sendMessage(chatId, welcomeMessage, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
    });
});

bot.onText(/\/stats/, (msg) => {
    if (msg.from.id !== 1896302427) { // Only Khanh can see detailed stats
        bot.sendMessage(msg.chat.id, '❌ Bạn không có quyền xem thống kê chi tiết.');
        return;
    }
    
    const db = getDatabase();
    const statsMessage = `
📊 *THỐNG KÊ DONATE* 📊

💰 *Tổng số donate:* ${db.totalDonations}
⭐ *Tổng Stars nhận:* ${db.totalAmount}
👥 *Số supporters:* ${db.supporters.length}

🏆 *Top 5 Supporters:*
${db.supporters
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 5)
    .map((s, i) => `${i + 1}. ${s.firstName} - ${s.totalAmount} ⭐`)
    .join('\n')}

📅 *Donate gần đây:*
${db.transactions
    .slice(-5)
    .reverse()
    .map(t => `• ${t.firstName}: ${t.amount} ⭐ (${t.date})`)
    .join('\n')}
    `;
    
    bot.sendMessage(msg.chat.id, statsMessage, { parse_mode: 'Markdown' });
});

// Callback queries
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;
    
    if (data === 'stats') {
        const db = getDatabase();
        const publicStats = `
📊 *THỐNG KÊ DONATE* 📊

💰 *Tổng donate:* ${db.totalDonations}
⭐ *Tổng Stars:* ${db.totalAmount}
👥 *Supporters:* ${db.supporters.length}

💖 Cảm ơn tất cả mọi người đã ủng hộ!
        `;
        
        bot.editMessageText(publicStats, {
            chat_id: chatId,
            message_id: query.message.message_id,
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [{ text: '💖 Ủng hộ ngay', web_app: { url: `${process.env.WEBAPP_URL || 'https://your-domain.vercel.app'}/donate` } }],
                    [{ text: '🔙 Quay lại', callback_data: 'back_to_main' }]
                ]
            }
        });
    } else if (data === 'top_supporters') {
        const db = getDatabase();
        const topSupporters = `
👑 *TOP SUPPORTERS* 👑

${db.supporters
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 10)
    .map((s, i) => {
        const medals = ['🥇', '🥈', '🥉'];
        const medal = medals[i] || '🏅';
        return `${medal} ${s.firstName}: ${s.totalAmount} ⭐`;
    })
    .join('\n')}

💖 Cảm ơn các bạn đã ủng hộ!
        `;
        
        bot.editMessageText(topSupporters, {
            chat_id: chatId,
            message_id: query.message.message_id,
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [{ text: '💖 Tôi cũng muốn ủng hộ!', web_app: { url: `${process.env.WEBAPP_URL || 'https://your-domain.vercel.app'}/donate` } }],
                    [{ text: '🔙 Quay lại', callback_data: 'back_to_main' }]
                ]
            }
        });
    } else if (data === 'back_to_main') {
        const firstName = query.from.first_name || 'Bạn';
        const welcomeMessage = `
🌟 *Chào ${firstName}!* 🌟

💖 *Ủng hộ Khanh Trann với Telegram Stars!*

🎯 *Các mức ủng hộ:*
☕ *20 Stars* - Một ly cà phê nhỏ
🍜 *50 Stars* - Bữa trưa ngon lành  
🚀 *100 Stars* - Động viên tinh thần
👑 *250 Stars* - Siêu supporter VIP

✨ Nhấn nút để bắt đầu ủng hộ!
        `;
        
        bot.editMessageText(welcomeMessage, {
            chat_id: chatId,
            message_id: query.message.message_id,
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [{ text: '💖 Ủng hộ Khanh', web_app: { url: `${process.env.WEBAPP_URL || 'https://your-domain.vercel.app'}/donate` } }],
                    [{ text: '📊 Thống kê donate', callback_data: 'stats' }],
                    [{ text: '👑 Top supporters', callback_data: 'top_supporters' }]
                ]
            }
        });
    }
    
    bot.answerCallbackQuery(query.id);
});

// Webhook endpoint
app.post('/webhook', async (req, res) => {
    try {
        const update = req.body;
        console.log('Webhook received:', JSON.stringify(update, null, 2));
        
        // Handle pre-checkout query
        if (update.pre_checkout_query) {
            const preCheckoutQuery = update.pre_checkout_query;
            console.log('Pre-checkout query:', preCheckoutQuery);
            
            // Always approve the payment
            await bot.answerPreCheckoutQuery(preCheckoutQuery.id, true);
            console.log('Pre-checkout approved');
        }
        
        // Handle successful payment
        if (update.message && update.message.successful_payment) {
            const payment = update.message.successful_payment;
            const user = update.message.from;
            const chatId = update.message.chat.id;
            
            console.log('Successful payment:', payment);
            console.log('User:', user);
            
            const amount = payment.total_amount;
            const donateConfig = DONATE_AMOUNTS[amount];
            
            if (donateConfig) {
                // Add to database
                addDonation(user.id, user.username, user.first_name, amount);
                
                // Send thank you message
                const thankYouMessage = `
✨ *DONATE THÀNH CÔNG!* ✨

${donateConfig.message}

🎯 *Chi tiết:*
👤 Supporter: ${user.first_name}
💰 Số tiền: ${amount} ⭐ Stars
🎁 Loại: ${donateConfig.title}

🌟 *Bạn đã trở thành supporter của Khanh Trann!*

🙏 Sự ủng hộ của bạn giúp tôi tiếp tục tạo ra những nội dung tốt hơn!

💖 Cảm ơn bạn rất rất nhiều!
                `;
                
                const keyboard = {
                    inline_keyboard: [
                        [{ text: '💖 Ủng hộ thêm', web_app: { url: `${process.env.WEBAPP_URL || 'https://your-domain.vercel.app'}/donate` } }],
                        [{ text: '📊 Xem thống kê', callback_data: 'stats' }],
                        [{ text: '🔄 Chia sẻ bot', switch_inline_query: 'Ủng hộ Khanh Trann với Telegram Stars!' }]
                    ]
                };
                
                await bot.sendMessage(chatId, thankYouMessage, {
                    parse_mode: 'Markdown',
                    reply_markup: keyboard
                });
                
                // Notify Khanh about new donation
                if (user.id !== 1896302427) {
                    const notifyMessage = `
🎉 *NEW DONATION!* 🎉

👤 *Supporter:* ${user.first_name} (@${user.username || 'no_username'})
💰 *Amount:* ${amount} ⭐ Stars
🎁 *Type:* ${donateConfig.title}
📅 *Time:* ${new Date().toLocaleString('vi-VN')}

💖 Chúc mừng!
                    `;
                    
                    await bot.sendMessage(1896302427, notifyMessage, { parse_mode: 'Markdown' });
                }
                
                console.log(`Donation processed: ${user.first_name} donated ${amount} stars`);
            }
        }
        
        // Handle regular messages
        if (update.message && !update.message.successful_payment) {
            await bot.processUpdate(update);
        }
        
        res.sendStatus(200);
    } catch (error) {
        console.error('Webhook error:', error);
        res.sendStatus(500);
    }
});

// Serve WebApp
app.get('/donate', (req, res) => {
    const webAppHTML = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ủng hộ Khanh Trann</title>
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
            color: #333;
        }
        
        .container {
            max-width: 400px;
            margin: 0 auto;
        }
        
        .header {
            text-align: center;
            color: white;
            margin-bottom: 30px;
        }
        
        .header h1 {
            font-size: 2rem;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .header p {
            opacity: 0.9;
            font-size: 1.1rem;
        }
        
        .donate-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 30px;
        }
        
        .donate-card {
            background: white;
            border-radius: 15px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
            cursor: pointer;
            position: relative;
            overflow: hidden;
        }
        
        .donate-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0,0,0,0.15);
        }
        
        .donate-card.popular {
            background: linear-gradient(135deg, #ffd700, #ffeb3b);
            border: 2px solid #ff6b6b;
        }
        
        .popular-badge {
            position: absolute;
            top: -5px;
            right: -5px;
            background: #ff6b6b;
            color: white;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 0.7rem;
            font-weight: bold;
        }
        
        .emoji {
            font-size: 2.5rem;
            margin-bottom: 10px;
            display: block;
        }
        
        .amount {
            font-size: 1.5rem;
            font-weight: bold;
            color: #667eea;
            margin: 10px 0;
        }
        
        .description {
            font-size: 0.9rem;
            color: #666;
            font-style: italic;
        }
        
        .donate-card.popular .amount {
            color: #333;
        }
        
        .footer {
            text-align: center;
            color: white;
            opacity: 0.8;
        }
        
        .stats {
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 20px;
            color: white;
            text-align: center;
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        .donate-card:active {
            animation: pulse 0.3s ease;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💖 Ủng hộ Khanh Trann</h1>
            <p>Cảm ơn sự support của bạn!</p>
        </div>
        
        <div class="stats" id="stats">
            <div>📊 Đang tải thống kê...</div>
        </div>
        
        <div class="donate-grid">
            <div class="donate-card" onclick="donate(20)">
                <span class="emoji">☕</span>
                <div class="amount">20 ⭐</div>
                <div class="description">Ly cà phê nhỏ</div>
            </div>
            
            <div class="donate-card popular" onclick="donate(50)">
                <div class="popular-badge">PHỔ BIẾN</div>
                <span class="emoji">🍜</span>
                <div class="amount">50 ⭐</div>
                <div class="description">Bữa trưa ngon</div>
            </div>
            
            <div class="donate-card" onclick="donate(100)">
                <span class="emoji">🚀</span>
                <div class="amount">100 ⭐</div>
                <div class="description">Động viên</div>
            </div>
            
            <div class="donate-card" onclick="donate(250)">
                <span class="emoji">👑</span>
                <div class="amount">250 ⭐</div>
                <div class="description">VIP Supporter</div>
            </div>
        </div>
        
        <div class="footer">
            <p>💫 Mọi sự ủng hộ đều có ý nghĩa!</p>
            <p>🙏 Cảm ơn bạn rất nhiều!</p>
        </div>
    </div>
    
    <script>
        // Initialize Telegram WebApp
        const tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();
        
        // Load stats
        loadStats();
        
        function loadStats() {
            fetch('/api/stats')
                .then(response => response.json())
                .then(data => {
                    document.getElementById('stats').innerHTML = \`
                        <div>💰 Tổng donate: \${data.totalDonations}</div>
                        <div>⭐ Tổng Stars: \${data.totalAmount}</div>
                        <div>👥 Supporters: \${data.supporters}</div>
                    \`;
                })
                .catch(() => {
                    document.getElementById('stats').innerHTML = '📊 Thống kê sẽ hiển thị sau donate đầu tiên';
                });
        }
        
        function donate(amount) {
            const messages = {
                20: 'Một ly cà phê nhỏ ☕',
                50: 'Bữa trưa ngon lành 🍜',
                100: 'Động viên tinh thần 🚀',
                250: 'Siêu supporter VIP 👑'
            };
            
            const invoiceParams = {
                title: \`Ủng hộ Khanh Trann - \${amount} Stars\`,
                description: messages[amount],
                payload: \`donate_\${amount}_\${Date.now()}\`,
                provider_token: '',
                currency: 'XTR',
                prices: [{ label: 'Donate', amount: amount }]
            };
            
            tg.showInvoice(invoiceParams);
        }
        
        // Handle payment result
        tg.onEvent('invoiceClosed', function(eventData) {
            if (eventData.status === 'paid') {
                tg.showAlert('💖 Cảm ơn bạn đã ủng hộ! Bot sẽ gửi tin nhắn cảm ơn ngay!');
                setTimeout(() => {
                    loadStats(); // Reload stats
                }, 2000);
            } else if (eventData.status === 'cancelled') {
                tg.showAlert('Đã hủy thanh toán. Bạn có thể thử lại bất cứ lúc nào! 😊');
            }
        });
    </script>
</body>
</html>
    `;
    
    res.send(webAppHTML);
});

// API endpoint for stats
app.get('/api/stats', (req, res) => {
    const db = getDatabase();
    res.json({
        totalDonations: db.totalDonations,
        totalAmount: db.totalAmount,
        supporters: db.supporters.length
    });
});

// Health check
app.get('/', (req, res) => {
    res.send(`
        <h1>🤖 Khanh Trann Donate Bot</h1>
        <p>✅ Bot is running!</p>
        <p>🌐 WebApp: <a href="/donate">/donate</a></p>
        <p>📊 Stats API: <a href="/api/stats">/api/stats</a></p>
        <p>💖 Ready to receive donations!</p>
    `);
});

// Initialize database and start server
initDatabase();

app.listen(port, () => {
    console.log(`🚀 Khanh Trann Donate Bot running on port ${port}`);
    console.log(`💖 Ready to receive donations!`);
});

// Export for serverless deployment
module.exports = app;