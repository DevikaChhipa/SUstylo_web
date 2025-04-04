    const express = require('express');
    const router = express.Router();
    const { 
        createBooking, 
        getUserBookings, 
        getSalonBookings, 
        confirmBooking, 
        cancelBooking, 
        completeBooking, 
        cancelUnpaidBooking 
    } = require('../controllers/bookingController');

    // ✅ Route to create a booking (Initially Pending)
    router.post('/create', createBooking);

    // ✅ Get all bookings for a user
    router.get('/user/:userId', getUserBookings);

    // ✅ Get all bookings for a salon
    router.get('/salon/:salonId', getSalonBookings);

    // ✅ Confirm a booking after payment
    router.post('/confirm/:bookingId', confirmBooking);

    // ✅ Auto-Cancel booking if payment is not done
    router.post('/cancel-unpaid/:bookingId', cancelUnpaidBooking);

    // ✅ Manually Cancel a booking
    router.post('/cancel/:bookingId', cancelBooking);

    // ✅ Mark a booking as completed
    router.post('/complete/:bookingId', completeBooking);

    module.exports = router;
