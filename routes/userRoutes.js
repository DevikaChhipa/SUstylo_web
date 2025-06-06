const express = require("express");
const {
  updateLocation,
  updateUserProfile,
  getAllUsers,
  getUserById,
  sendOtpController,
  verifyOTPController,
  getReferralCode,
  getUserInfo,
  getUserReviews,
  addProfilePhoto,
  SalonLead,
  updateProfilePhoto
} = require("../controllers/userController"); // ✅ Ensure correct import path

const { protect } = require("../authMiddleware/authMiddleware"); // ✅ Correct import
const { upload } = require("../authMiddleware/upload");

const router = express.Router();

router.post("/send-otp", sendOtpController);
router.post("/verify-otp", verifyOTPController);
router.post("/update-location", updateLocation);
router.put("/update-profile/:id", updateUserProfile);
router.get("/get-all", getAllUsers);
router.get("/get/:id", getUserById);
router.get("/referral/:userId", getReferralCode);
router.get("/user-info", protect, getUserInfo);
router.get("/user-reviews/:userId", getUserReviews);
router.post("/salon-lead", SalonLead);
router.post("/user/:id/profile-photo", upload.fields([
  { name: "profileImage", maxCount: 1 },
]), addProfilePhoto);
// router.put("/user/:id/profile-photo", upload.single("profilePhoto"), updateProfilePhoto);



module.exports = router;
