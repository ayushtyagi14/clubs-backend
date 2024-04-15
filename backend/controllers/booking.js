const { supabase } = require("../db");

const handleClubBooking = async (req, res) => {
  try {
    const { userId, clubId, bookingDate, bookingTime, users, totalGuest, couple, female, stag, amount, isPaid, isCompleted } = req.body;

    console.log(req.body)

    // Check if the clubId exists in the Clubs table
    const { data: clubData, error: clubError } = await supabase
      .from('Clubs')
      .select('*')
      .eq('clubId', clubId)
      .single();

    if (clubError || !clubData) {
      return res.status(400).json({ error: 'Invalid clubId' });
    }

    // Check if userId exists in the Accounts table
    const { data: userData, error: userError } = await supabase
      .from('Accounts')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return res.status(400).json({ error: 'Invalid userId' });
    }

    // Fetch user with userId from Supabase
    const { data: userExists, error: userFetchError } = await supabase
      .from('Accounts')
      .select('*')
      .eq('id', userId)
      .single();

    if (userFetchError || !userExists) {
      return res.status(500).json({ error: `Failed to fetch user with id ${userId}` });
    }

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

    // Initialize newBookings as the existing array or an empty array if it's null
    let newBookings = userExists.newBookings || [];

    // Append new booking details to the newBookings array
    newBookings.push({ clubId, clubName: clubData.clubName, clubType: clubData.type, bookingDate, bookingTime, totalGuest });

    // Update newBookings column in the Accounts table for userId
    const { data: userDataUpdate, error: userUpdateError } = await supabase
      .from('Accounts')
      .update({ newBookings: newBookings })
      .eq('id', userId);

    if (userUpdateError) {
      return res.status(500).json({ error: `Failed to update user with id ${userId}` });
    }

    const updatedUsers = [];
    for (const user of users) {
      try {
        // Fetch user from Supabase
        const { data: userExists, error: userError } = await supabase
          .from('Accounts')
          .select('newBookings')
          .eq('id', user)
          .single();

        // Check for errors or if user doesn't exist
        if (userError || !userExists) {
          console.error(`Error fetching user with id ${user}:`, userError);
          return res.status(500).json({ error: `Failed to fetch user with id ${user}` });
        }

        // Initialize newBookings as the existing array or an empty array if it's null
        let newBookings = userExists.newBookings || [];

        // Append new booking details to the newBookings array
        newBookings.push({ clubId, clubName: clubData.clubName, clubType: clubData.type, bookingDate, bookingTime, totalGuest });

        // Update newBookings column in the Accounts table for user
        const { data, error } = await supabase
          .from('Accounts')
          .update({ newBookings: newBookings })
          .eq('id', user);

        // Check for errors while updating
        if (error) {
          console.error(`Error updating user with id ${user}:`, error);
          return res.status(500).json({ error: `Failed to update user with id ${user}` });
        }

        // If update successful, add user to updatedUsers array
        updatedUsers.push(user);
      } catch (err) {
        console.error(`Error updating user with id ${user}:`, err);
        return res.status(500).json({ error: `Failed to update user with id ${user}` });
      }
    }

    res.status(200).json({ message: `Club booking created successfully for ${clubData.clubName} on ${bookingDate} at ${bookingTime} by ${userData.username}`, updatedUsers });
  } catch (error) {
    console.error('Internal server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  handleClubBooking
};
