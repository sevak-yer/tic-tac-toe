require('./db/mongoose');
const express = require('express');
const cors = require('cors');
const socketIO = require('socket.io');
const User = require('./models/user');
const bcrypt = require('bcryptjs');
const path = require('path');

const publicPath = path.join(__dirname, '../frontend/public');

const app = express();
const port = 3001;

const server = app.listen(port, () => {
    console.log(`server is up on port ${port}.`)
});
var io = socketIO.listen(server);

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", 'http://localhost:3000');
    res.header("Access-Control-Allow-Credentials", true);
    next();
});

app.use(express.static(publicPath));
app.use(express.json());
app.use(cors());

app.post('/user', async (req, res) => {
    await User.findOne({ name: req.body.name }, async (err, result) => {
        if (result === null) {
            const user = new User(req.body);
            try {
                await user.save();
                res.status(200).send(user);
            } catch (e) {
                res.status(400).send(e);
            }
        }
        if (result) {
            res.send('user with this name already exists, try other name')
        }
    })
})

let socketidList = [];
let socketid = '';
let pureIoUsers = [];
let newuser = {};
let roomList = [];

io.on('connection', (socket) => {
    socketid = socket.id;
    socketidList.push(socket.id);

    socket.on('loginData', (data) => {
        try {
            User.findOne({ name: data.name }, async (err, res) => {
                if (err) {
                    return handleError(err);
                } else if (res === null) {
                    socket.emit('errordata', 'username or pasword is incorrect');
                } else {
                    if (! await bcrypt.compare(data.password, res.password)) {
                        socket.emit('errordata', 'username or pasword is incorrect');
                    } else {
                        let dublicate = false;
                        for (let i = 0; i < pureIoUsers.length; i++) {
                            if (pureIoUsers[i].name === res.name) {
                                dublicate = true;
                            }
                        }
                        if (dublicate) {
                            socket.emit('errordata', 'You are already logged in!');
                        } else {
                            socketid = socket.id;
                            socketidList.push(socket.id);
                            newuser = { name: res.name, _id: res._id, password: res.password, socketid: socket.id };
                            pureIoUsers.push(newuser);
                            socket.emit('usersList', pureIoUsers);
                            socket.emit('roomList', roomList);
                        }
                    }
                }

            });
        } catch (error) {
            console.log('catch error in login data ', error)
        }
    })

    socket.on('createRoom', ({ username, room }) => {
        const roomFind = roomList.find((r) => {
            return r.room === room
        })
        if (!roomFind) {
            roomList.push({ users: [username], room, X: socket.id });
            socket.join(room);
            socket.emit('roomCreationConfirmation', true)
            io.emit('roomList', roomList)
            socket.emit('player', {
                text: 'You are X'
            });
            socket.emit('start', {
                text: 'waiting for other player'
            });

        } else {
            socket.emit('createError', `There is already a table with the name ${room}. Choose other name.`);
        }
    })

    socket.on('join', ({ username, room }) => {
        const roomFind = roomList.find((r) => {
            return r.room === room
        })
        roomFind.users.push(username);
        roomList.splice(roomList.findIndex(room => room.room === roomFind.room), 1, roomFind);
        socket.join(room);
        socket.emit('roomJoiningConfirmation', true);
        io.emit('roomList', roomList);
        socket.emit('player', {
            text: 'You are O'
        });

        socket.broadcast.to(room).emit('start', {
            text: 'Game underway, your turn',
            newgame: true
        });

        socket.emit('start', {
            text: 'Game underway, opponent turn',
            newgame: true
        });
    })

    socket.on('newG', function (newG) {
        const user = pureIoUsers.find((user) => {
            return user.socketid === socket.id
        })
        const r = roomList.find((room) => {
            return room.users.includes(user.name)
        })
        io.to(r.room).emit('newGData', true);
    });

    socket.on('backToLobby', () => {
        const user = pureIoUsers.find((user) => {
            return user.socketid === socket.id
        })
        const r = roomList.find((room) => {
            return room.users.includes(user.name)
        })
        for (let i = 0; i < 2; i++) {
            if (user.name === r.users[i]) {
                r.users.splice(i, 1)
            }
        }
        socket.leave(r.room);
        const index = roomList.findIndex((table) => {
            return r.room === table.room
        })
        if (r.users.length === 0) {
            roomList.splice(index, 1)
        } else {
            if (socket.id === r.X) {
                for (let i = 0; i < pureIoUsers.length; i++) {
                    if (r.users[0] === pureIoUsers[i].name) {
                        r.X = pureIoUsers[i].socketid;
                        roomList.splice(index, 1, r)
                        break;
                    }
                }
                socket.broadcast.to(r.room).emit('player', {
                    text: 'You are X'
                });
                socket.broadcast.to(r.room).emit('start', {
                    text: 'opponent has left, Now you are \'X\', waiting for other player to join the table'
                });
            } else {
                socket.broadcast.to(r.room).emit('start', {
                    text: 'opponent has left,waiting for other player to join the table'
                });
            }
        }
        io.emit('roomList', roomList);
    })

    socket.on('result', async (data) => {
        const user = pureIoUsers.find((user) => {
            return user.socketid === socket.id
        })
        const r = roomList.find((room) => {
            return room.users.includes(user.name)
        })
        socket.broadcast.to(r.room).emit('Result', data);
        let opponent = '';
        for (let i = 0; i < 2; i++) {
            if (user.name !== r.users[i]) {
                opponent = r.users[i]
            }
        }
        try {
            User.findOne({ name: opponent }, function (err, user) {
                user.lose = user.lose + 1;
                user.save();
            });
            User.findOne({ name: user.name }, function (err, user) {
                user.win = user.win + 1;
                user.save();
            });
        } catch (e) {
            console.log(e)
        }
    });

    socket.on('event', function (event) {
        const user = pureIoUsers.find((user) => {
            return user.socketid === socket.id
        })
        const r = roomList.find((room) => {
            return room.users.includes(user.name)
        })
        io.to(r.room).emit('array', event);
    });

    socket.on('opponentTurn', (data) => {
        const user = pureIoUsers.find((user) => {
            return user.socketid === socket.id
        })
        const r = roomList.find((room) => {
            return room.users.includes(user.name)
        })
        socket.broadcast.to(r.room).emit('start', data);
    });

    socket.on('verifiedList', (data) => {
        io.emit('listFromServerToUserList', (data))
        io.to(newuser.socketid).emit('logedinUser', newuser);
    })

    socket.on('profile', async (name) => {
        try {
            const user = await User.findOne({ name: name });
            socket.emit('stats', { name: name, win: user.win, lose: user.lose, draw: user.draw })
        } catch (error) {
            console.log('catch error in profile ', error)
        }
    })

    socket.on('logout', (data) => {
        const user = pureIoUsers.find((user) => {
            return user.socketid === socket.id
        })
        console.log('user in logout ', user)
        if (roomList.length > 0) {
            const index = roomList.findIndex((r) => {
                return r.users.includes(user.name)
            })
            if (index !== -1) {
                socket.leave(roomList[index].room);
                const userIndex = roomList[index].users.findIndex((u) => {
                    return u === user.name;
                })
                roomList[index].users.splice(userIndex, 1);
                const emptyUsersRoomIndex = roomList.findIndex((r) => {
                    return r.users.length === 0
                })
                if (emptyUsersRoomIndex !== -1) {
                    roomList.splice(emptyUsersRoomIndex, 1);
                } else {
                    if (socket.id === roomList[index].X) {
                        for (let i = 0; i < pureIoUsers.length; i++) {
                            if (roomList[index].users[0] === pureIoUsers[i].name) {
                                roomList[index].X = pureIoUsers[i].socketid;
                                break;
                            }
                        }
                        socket.broadcast.to(roomList[index].room).emit('player', {
                            text: 'You are X'
                        });
                        socket.broadcast.to(roomList[index].room).emit('start', {
                            text: 'opponent has left, Now you are \'X\', waiting for other player to join the table'
                        });
                    } else {
                        socket.broadcast.to(roomList[index].room).emit('start', {
                            text: 'opponent has left, waiting for other player to join the table'
                        });
                    }
                }
            }
            io.emit('roomList', roomList)
        }
        if (user.name) {
            pureIoUsers.splice(pureIoUsers.findIndex(u => u.name === user.name), 1);
            socket.broadcast.emit('logoutUpdatedList', pureIoUsers);
        }
        socketidList.splice(socketidList.findIndex(socket => socket === socket.id), 1);
    })

    socket.on('disconnect', () => {
        socket.emit('DC');
        if (roomList.length > 0) {
            const userindex = pureIoUsers.findIndex((r) => {
                return r.socketid === socket.id
            })
            const name = pureIoUsers[userindex].name;
            const index = roomList.findIndex((r) => {
                return r.users.includes(name)
            })
            if (index !== -1) {
                socket.leave(roomList[index].room);
                const roomUserIndex = roomList[index].users.findIndex((user) => {
                    return user === name;
                })
                roomList[index].users.splice(roomUserIndex, 1);
                const emptyUsersRoomIndex = roomList.findIndex((r) => {
                    return r.users.length === 0
                })
                if (emptyUsersRoomIndex !== -1) {
                    roomList.splice(emptyUsersRoomIndex, 1);
                } else {
                    if (socket.id === roomList[index].X) {
                        for (let i = 0; i < pureIoUsers.length; i++) {
                            if (roomList[index].users[0] === pureIoUsers[i].name) {
                                roomList[index].X = pureIoUsers[i].socketid;
                                break;
                            }
                        }
                        socket.broadcast.to(roomList[index].room).emit('player', {
                            text: 'You are X'
                        });
                        socket.broadcast.to(roomList[index].room).emit('start', {
                            text: 'opponent has left, Now you are \'X\', waiting for other player to join the table'
                        });
                    } else {
                        socket.broadcast.to(roomList[index].room).emit('start', {
                            text: 'opponent has left, waiting for other player to join the table'
                        });
                    }
                }
            }
            io.emit('roomList', roomList)
        }
        socketidList.splice(socketidList.findIndex(socket => socket === socket.id), 1);
        socketid = '';
        if (pureIoUsers.findIndex(user => user.socketid === socket.id) !== -1) {
            pureIoUsers.splice(pureIoUsers.findIndex(user => user.socketid === socket.id), 1);
        }
        socket.broadcast.emit('usersListFromDisconnect', pureIoUsers);
    });
});



