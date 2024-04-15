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

        const { error: requestError } = await supabase
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
                }
            ]);

        if (requestError) {
            return res.status(500).json({ error: 'Failed to send the friend request' });
        }

        res.status(200).json({ message: `Friend Request sent by ${senderData.username} to ${receiverData.username} succefully!` });
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

        res.status(200).json({ message: `Friend Request accepted by ${receiverData.username} to ${senderData.username} successfully!` });
    } catch (error) {
        console.error("Error accepting friend request:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Subscribe to changes in the FriendsRequest table
const friendsRequestSubscription = supabase
    .channel('custom-insert-channel')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'FriendsRequest' }, (payload) => {
        console.log('Change received:', payload);
    })
    .subscribe();

module.exports = { sendFriendRequest, acceptFriendRequest };
