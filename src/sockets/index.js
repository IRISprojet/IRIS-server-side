module.exports = function (socket) {
  console.log("Client connected:" + socket.id);

  // require chat socket
  require("./chat.socket")(socket);
  // require notification socket
  require("./notification.socket")(socket);
};
