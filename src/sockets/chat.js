const chatEvents = require("../constants/chatEvents");
const { isLogedinHandshake } = require("../middlewares/socketMiddleware");

const socketInIt = (io) => {
    io.use(isLogedinHandshake)
    io.on(chatEvents.CONNECT_EVENT, (socket) => {
        //TODO: add listeners for chat message, typing, etc. 
        const id = (socket.user._id).toString();
        socket.join(id);
        socket.on(chatEvents.DISCONNECT_EVENT, () => {
            console.log("User disconnected...." + id);
        })
    })
}
const emitSocketEvent = (req, roomId, event, payload) => {
    const io = req.app.get('io')
    io.to(roomId).emit(event, payload);
}

module.exports = {
    socketInIt,
    emitSocketEvent
}