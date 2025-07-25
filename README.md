# 💖 Khanh Trann Donate Bot

Bot Telegram cho phép nhận donate bằng Telegram Stars với giao diện WebApp đẹp mắt.

## ✨ Tính năng

- 🌟 Nhận donate với 4 mức: 20, 50, 100, 250 Stars
- 💰 Tự động chuyển Stars thành TON 
- 📊 Thống kê realtime số lượng supporters
- 👑 Bảng xếp hạng top supporters
- 💌 Tin nhắn cảm ơn tự động
- 📱 WebApp responsive đẹp mắt

## 🚀 Cài đặt

1. Clone repository này
2. Tạo file `.env` với:
   ```
   BOT_TOKEN=8345096885:AAGiwUX74HOYNOwAYpZlupBs8AXnokipGZw
   WEBAPP_URL=https://your-domain.vercel.app
   ```
3. Deploy lên Vercel
4. Set webhook cho bot
5. Kích hoạt Stars payment trong @BotFather

## 📖 Hướng dẫn chi tiết

Xem file `SETUP_GUIDE.md` để có hướng dẫn từng bước chi tiết.

## 🎯 Demo

- Bot: @your_bot_username
- WebApp: https://your-domain.vercel.app/donate

## 💝 Các mức donate

- ☕ **20 Stars** - Một ly cà phê nhỏ
- 🍜 **50 Stars** - Bữa trưa ngon lành (Phổ biến)
- 🚀 **100 Stars** - Động viên tinh thần  
- 👑 **250 Stars** - Siêu supporter VIP

## 📊 API

- `GET /` - Health check
- `POST /webhook` - Telegram webhook
- `GET /donate` - WebApp interface
- `GET /api/stats` - Thống kê donate

## 🛠️ Tech Stack

- Node.js + Express
- Telegram Bot API
- Telegram WebApp
- Vercel (hosting)

## 📄 License

MIT License - Tự do sử dụng và chỉnh sửa

---

💖 **Tạo bởi Khanh Trann** - Cảm ơn sự ủng hộ của mọi người!
