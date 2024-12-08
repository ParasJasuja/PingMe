const chatEvents = require("../constants/chatEvents");
const { isLogedinHandshake } = require("../middlewares/socketMiddleware");
const messageListener = require("./listeners/messageListener");
const typingListener = require("./listeners/typingListener");

const socketInIt = (io) => {
    io.use(isLogedinHandshake)
    io.on(chatEvents.CONNECT_EVENT, (socket) => {
        const id = (socket.user._id).toString();
        socket.join(id);

        // listeners
        messageListener(io, socket)
        typingListener(io, socket)


        socket.on(chatEvents.DISCONNECT_EVENT, () => {
            console.log("User disconnected...." + id);
        })
    })
}
const emitSocketEvent = (req, roomId, event, payload) => {
    const io = req.app.get('io')
    io.in(roomId).emit(event, payload);
}

module.exports = {
    socketInIt,
    emitSocketEvent
}