const OTP = require("../models/otpModel");
const axios = require("axios");


const generateOtp = async (mobileNumber) => {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000);
    // Remove existing OTPs before creating a new one
    await OTP.deleteMany({ mobileNumber });
    await OTP.create({ mobileNumber, otp });
    return otp;
  } catch (error) {
    console.error("Error generating OTP:", error);
    throw new Error("Failed to generate OTP");
  }

};
  const verifyOtp = async (mobileNumber, otp) => {                                        
    try {
      const existingOtp = await OTP.findOne({ mobileNumber, otp });
  
      if (!existingOtp) {
        return { success: false, message: "Invalid or expired OTP" };
      }
  
      // Remove OTP after successful verification
      await OTP.deleteMany({ mobileNumber });
  
      return { success: true, message: "OTP verified successfully" };
    } catch (error) {
      console.error("Error verifying OTP:", error);
      return { success: false, message: "Failed to verify OTP" };
    }
};


const sendOtp = async (mobileNumber, otp) => {
  try {
    const apiKey = "8Ke0teaW2mo5i6yh7A06YzMookM9RjGrTKSsd5AlJEm2gOozuql50GOqKm4e";
    const senderId = "FINUNI";
    const message = `Dear user, Your OTP for login is ${otp} Do not share with anyone -Finunique Small Pvt. Ltd`;

    if (!apiKey || !senderId) {
      console.error("Missing API Key or Sender ID");
      throw new Error("Fast2SMS API key or Sender ID is missing");
    }

    const params = {
      // authorization: apiKey,
      route: "q",  // Change route if needed (e.g., "dlt")
      sender_id: senderId,
      message,
      language: "english",
      numbers: mobileNumber,
    };

    //console.log("Fast2SMS Request Params:", params);  // Debugging log

    const response = await axios.post("https://www.fast2sms.com/dev/bulkV2", params, {
      headers: {
        authorization: apiKey  // API key in the header
      }
      });
    //console.log("Fast2SMS Response:", response.data);

    if (response.data.return) {
      return { success: true, message: "OTP sent successfully" };
    } else {
      // Provide a more detailed error message
      const errorMessage = response.data.message || "Failed to send OTP";
      return { success: false, message: errorMessage };
    }
  } catch (error) {
    if (error.response) {
      console.error("Error in sendOtp - Response Error:", error.response.data);
      return { success: false, message: error.response.data.message || "Failed to send OTP" };
    } else {
      console.error("Error in sendOtp - General Error:", error.message);
      return { success: false, message: "Error sending OTP" };
    }
    // console.error("Error in sendOtp:", error.response?.data || error.message);
    // return { success: false, message: "Error sending OTP" };
  }
};


module.exports = { generateOtp, verifyOtp, sendOtp  }; // Ensure this export is correct