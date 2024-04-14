const { supabase } = require("../db");

const handleClubBooking = async (req, res) => {
  try {
    const { userId, clubId, bookingDate, bookingTime, users, totalGuest, couple, female, stag, amount, isPaid, isCompleted } = req.body;

    // Check if the clubId exists in the Clubs table
    const { data: clubData, error: clubError } = await supabase
      .from('Clubs')
      .select('*') // Select all fields to get clubName and clubType
      .eq('clubId', clubId)
      .single();

    if (clubError || !clubData) {
      return res.status(400).json({ error: 'Invalid clubId' });
    }

    // Log clubName and clubType to the console
    console.log('Club Name:', clubData.clubName);
    console.log('Club Type:', clubData.type);

    // Check if userId exists in the Accounts table
    const { data: userData, error: userError } = await supabase
      .from('Accounts')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return res.status(400).json({ error: 'Invalid userId' });
    }

    // Check if all users exist in the Accounts table
    for (const user of users) {
      const { data: userData, error: userError } = await supabase
        .from('Accounts')
        .select('*')
        .eq('id', user)
        .single();

      if (userError || !userData) {
        return res.status(400).json({ error: `Invalid user with id ${user}` });
      }
    }

    // Insert booking data into ClubBookings table
    const { data, error } = await supabase
      .from('ClubBookings')
      .insert([
        {
          userId,
          clubId,
          bookingDate,
          bookingTime,
          users,
          totalGuest,
          couple,
          female,
          stag,
          amount,
          isPaid,
          isCompleted,
          clubName: clubData.clubName,
          clubType: clubData.type
        }
      ]);

    if (error) {
      return res.status(500).json({ error: 'Failed to create club booking' });
    }

    res.status(200).json({ message: `Club booking created successfully for ${clubData.clubName} on ${bookingDate} at ${bookingTime} by ${userData.username}` });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  handleClubBooking
};
