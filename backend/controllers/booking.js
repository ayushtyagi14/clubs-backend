const { supabase } = require("../db");

async function createBooking(req, res) {
  try {
    const {
      userId,
      clubName,
      guests,
      type,
      afterPartyId,
      nightClubId,
      specialEventId,
      totalGuests,
      couple,
      male,
      female,
      date,
      isCompleted,
      amount,
    } = req.body;

    let validClubId;

    let validUserId = userId;

    // Determine the valid club ID based on the provided type
    switch (type) {
      case "AfterParty":
        validClubId = afterPartyId;
        break;
      case "NightClubs":
        validClubId = nightClubId;
        break;
      case "SpecialEvents":
        validClubId = specialEventId;
        break;
      default:
        return res.status(400).json({ message: "Invalid club type" });
    }

    // Check if the valid club ID exists in the corresponding table
    if (validClubId) {
      const { data: clubs, error: clubError } = await supabase
        .from('SpecialEvents')
        .select('clubId')
        .eq("clubId", validClubId);

      if (clubError) {
        console.error("Supabase Club Error:", clubError.message);
        throw clubError;
      }

      if (clubs) {
        console.log("Found club with id: ", clubs);
      }

      console.log("Supabase Clubs Data:", clubs);

      if (!clubs || clubs.length === 0) {
        console.log(`${type} doesn't exist`);
        return res.status(404).json({ message: `${type} doesn't exist` });
      }

      // Assuming that only one row should match, take the first row
      const club = clubs[0];

      console.log("Club:", club);
    }

    if (validUserId) {
      const { data: users, error: clubError } = await supabase
        .from('Accounts')
        .select('id')
        .eq("id", validUserId);
        
      if (clubError) {
        console.error("Supabase Club Error:", clubError.message);
        throw clubError;
      }

      if (users) {
        console.log("Found club with id: ", users);
      }

      console.log("Supabase Clubs Data:", users);

      if (!users || users.length === 0) {
        console.log(`${type} doesn't exist`);
        return res.status(404).json({ message: `user doesn't exist` });
      }

      // Assuming that only one row should match, take the first row
      const user = users[0];

      console.log("User:", user);
    }

    // Insert new booking into 'Bookings' table
    const { data: booking, error: bookingError } = await supabase
      .from("Bookings")
      .insert([
        {
          userId,
          clubName,
          guests,
          type,
          afterPartyId,
          nightClubId,
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

    if (bookingError) {
      console.error("Supabase Booking Error:", bookingError.message);
      throw bookingError;
    }

    console.log("Booking created successfully:", booking);

    res.status(201).json({ message: "Booking created successfully", data: booking });
  } catch (error) {
    console.error("Error creating booking:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = { createBooking };
