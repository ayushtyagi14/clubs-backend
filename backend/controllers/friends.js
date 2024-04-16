const { supabase } = require("../db");

async function sendFriendRequest(req, res) {
    try {
        const { senderId, receiverUsername } = req.body;

        const { data: senderData, error: senderError } = await supabase
            .from('Accounts')
            .select('*')
            .eq('id', senderId)
            .single();

        if (senderError || !senderData) {
            return res.status(400).json({ error: 'Invalid senderId' });
        }

        const { data: receiverData, error: receiverError } = await supabase
            .from('Accounts')
            .select('*')
            .eq('username', receiverUsername)
            .single();

        if (receiverError || !receiverData) {
            return res.status(400).json({ error: `Username ${receiverUsername} doesn't exist` });
        }

        // Check if a friend request already exists between sender and receiver
        const { data: existingRequest, error: requestError } = await supabase
            .from('FriendsRequest')
            .select('*')
            .eq('senderId', senderId)
            .eq('receiverId', receiverData.id)
            .single();

        if (existingRequest) {
            if (existingRequest.status === 'pending') {
                return res.status(400).json({ error: 'Friend request already sent' });
            } else if (existingRequest.status === 'accepted') {
                return res.status(400).json({ error: 'User is already a friend' });
            }
        }

        const { error: insertError } = await supabase
            .from('FriendsRequest')
            .insert([
                {
                    senderId,
                    receiverId: receiverData.id,
                    receiverUsername,
                    receiverName: receiverData.fullName,
                    receiverAvatar: receiverData.avatar,
                    senderUsername: senderData.username,
                    senderName: senderData.fullName,
                    senderAvatar: senderData.avatar,
                    status: 'pending' // Set the status of the friend request as pending
                }
            ]);

        if (insertError) {
            return res.status(500).json({ error: 'Failed to send the friend request' });
        }

        res.status(200).json({ message: `Friend Request sent by ${senderData.username} to ${receiverData.username} successfully!` });
    } catch (error) {
        console.error("Error sending friend request:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

async function acceptFriendRequest(req, res) {
    try {
        const { senderUsername, receiverId } = req.body;

        const { data: senderData, error: senderError } = await supabase
            .from('Accounts')
            .select('*')
            .eq('username', senderUsername)
            .single();

        if (senderError || !senderData) {
            return res.status(400).json({ error: 'Invalid sender username' });
        }

        const { data: receiverData, error: receiverError } = await supabase
            .from('Accounts')
            .select('*')
            .eq('id', receiverId)
            .single();

        if (receiverError || !receiverData) {
            return res.status(400).json({ error: 'Invalid receiverId' });
        }

        let senderFriendList = senderData.friendsList || [];
        let receiverFriendList = receiverData.friendsList || [];

        // Check if the receiver is already in the sender's friend list
        const existingSenderFriend = senderFriendList.find(friend => friend.receiverId === receiverId);
        // Check if the sender is already in the receiver's friend list
        const existingReceiverFriend = receiverFriendList.find(friend => friend.userId === senderData.id);

        if (existingSenderFriend && existingReceiverFriend) {
            return res.status(400).json({ error: `User ${receiverData.username} is already friends with ${senderData.username}` });
        }

        if (!existingSenderFriend) {
            senderFriendList.push({ receiverId, name: receiverData.fullName, username: receiverData.username, avatar: receiverData.avatar });

            const { data: senderDataUpdate, error: senderUpdateError } = await supabase
                .from('Accounts')
                .update({ friendsList: senderFriendList })
                .eq('username', senderUsername);

            if (senderUpdateError) {
                return res.status(500).json({ error: `Failed to update user with id ${senderData.id}` });
            }
        }

        if (!existingReceiverFriend) {
            receiverFriendList.push({ userId: senderData.id, name: senderData.fullName, senderUsername, avatar: senderData.avatar });

            const { data: receiverDataUpdate, error: receiverUpdateError } = await supabase
                .from('Accounts')
                .update({ friendsList: receiverFriendList })
                .eq('id', receiverId);

            if (receiverUpdateError) {
                return res.status(500).json({ error: `Failed to update user with id ${receiverId}` });
            }
        }

        // Update the status of the friend request in the FriendsRequest table
        const { data: friendRequest, error: friendRequestError } = await supabase
            .from('FriendsRequest')
            .update({ status: 'accepted' })
            .eq('receiverId', receiverId)
            .eq('senderId', senderData.id)
            .single();

        if (friendRequestError) {
            return res.status(500).json({ error: 'Failed to update friend request status' });
        }

        res.status(200).json({ message: `Friend Request accepted by ${receiverData.username} to ${senderData.username} successfully!` });
    } catch (error) {
        console.error("Error accepting friend request:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

async function declineFriendRequest(req, res) {
    try {
        const { senderUsername, receiverId } = req.body;

        const { data: senderData, error: senderError } = await supabase
            .from('Accounts')
            .select('*')
            .eq('username', senderUsername)
            .single();

        if (senderError || !senderData) {
            return res.status(400).json({ error: 'Invalid sender username' });
        }

        const { data: receiverData, error: receiverError } = await supabase
            .from('Accounts')
            .select('*')
            .eq('id', receiverId)
            .single();

        if (receiverError || !receiverData) {
            return res.status(400).json({ error: 'Invalid receiverId' });
        }

        // Delete the friend request entry from the FriendsRequest table
        const { data: deletedFriendRequest, error: deleteError } = await supabase
            .from('FriendsRequest')
            .delete()
            .eq('receiverId', receiverId)
            .eq('senderId', senderData.id);

        if (deleteError) {
            return res.status(500).json({ error: 'Failed to delete friend request entry' });
        }

        res.status(200).json({ message: `Friend Request declined by ${receiverData.username} to ${senderData.username} successfully!` });
    } catch (error) {
        console.error("Error declining friend request:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

async function getAllFriends(req, res) {
    try {
        const { receiverId } = req.body;

        const { data: document, error } = await supabase
            .from("FriendsRequest")
            .select("*")
            .eq("receiverId", receiverId)

        if (error) {
            throw error;
        }
        res.json(document);
    } catch (error) {
        console.error("Error getting friend requests:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Subscribe to changes in the FriendsRequest table
const friendsRequestSubscription = supabase
    .channel('custom-insert-channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'FriendsRequest' }, (payload) => {
        console.log('Change received:', payload);
    })
    .subscribe();

module.exports = { sendFriendRequest, acceptFriendRequest, declineFriendRequest, getAllFriends };
