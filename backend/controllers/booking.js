// controllers/bookingController.js
const { supabase } = require("../db");

async function createBooking(req, res) {
  try {
    const {
      userId,
      clubName,
      guests,
      type,
      nightClubId,
      afterPartyId,
      specialEventId,
      totalGuests,
      couple,
      male,
      female,
      date,
      isCompleted,
      amount,
    } = req.body;
    console.log(date);

    // Insert new booking into 'bookings' table
    const { data: booking, error } = await supabase.from("Bookings").insert([
      {
        userId,
        clubName,
        guests,
        type,
        nightClubId,
        afterPartyId,
        specialEventId,
        totalGuests,
        couple,
        male,
        female,
        date,
        isCompleted,
        amount,
      },
    ]);

    if (error) {
      console.log(error);
      throw error;
    }

    res
      .status(201)
      .json({ message: "Booking created successfully", data: booking });
  } catch (error) {
    console.error("Error creating booking:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = { createBooking };
