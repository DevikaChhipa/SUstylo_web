const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  balance: { type: Number, default: 0 },
  nonWithdrawableBalance: { type: Number, default: 0 }, // ✅ Referral money (only for bookings)
  transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Payment" }]
});

module.exports = mongoose.model("Wallet", walletSchema);
