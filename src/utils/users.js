const users = [];

// adddUser, removeUser, getUser, getUsersInRoom

const addUser = ({ id, username, room }) => {
    // Clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // Validate the data

    if (!username || !room) {
        return {
            error: 'User name and room are required'
        };
    }

    // Check for existing user with the same name

    const existingUser = users.find((user) => {
        return user.room === room && user.username === username;
    });

    if (existingUser) {
        return {
            error: 'User name is in use'
        };
    }

    // Store user

    const user = { id, username, room };
    users.push(user);
    return { user };
};

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);

    if (index != -1) {
        return users.splice(index, 1)[0];
    }
};

const getUser = (id) => {
    const matchingUser = users.find((user) => user.id === id);

    if (!matchingUser) {
        return {
            error: 'User not found'
        };
    }
    return matchingUser;
};

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase();
    const usersInRoom = users.filter((user) => user.room === room);

    if (usersInRoom.length == 0) {
        return {
            error: 'No users in the room'
        };
    }
    return usersInRoom;
};

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
};