const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
  mobileNumber: { type: String, required: true, unique: true },
  salonName: { type: String, required: false },
  role: { type: String, enum: ["user", "shop_owner", "admin"], required: true },
  name: { type: String },
  email: { type: String, unique: true, sparse: true },
  gender: { type: String, enum: ["male", "female", "other"], required: false },
  address: { type: String },
  wallet: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet" },
  profilePhoto: { type: String, default: "" },
  location: {
    latitude: { type: Number },
    longitude: { type: Number },
  },
  notificationToken:{type :String},
  referralCode: { type: String, unique: true }, 
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("User", userSchema);
