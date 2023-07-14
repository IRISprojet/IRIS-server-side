const http = require("http");
const app = require("./src/app");
const socket = require("./socket");
const redisClient = require("./redis");
const userModel = require("./src/models/user.model"); // import our user model

// return the port in the right format
const normalizePort = (val) => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};
const port = normalizePort(process.env.PORT || "4000");
app.set("port", port);

const errorHandler = (error) => {
  if (error.syscall !== "listen") {
    throw error;
  }
  const address = server.address();
  const bind = typeof address === "string" ? "pipe " + address : "port: " + port;
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges.");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use.");
      process.exit(1);
      break;
    default:
      throw error;
  }
};

const server = http.createServer(app);

/* Listening for errors and listening for the server to start. */
server.on("error", errorHandler);
server.on("listening", () => {
  const address = server.address();
  const bind = typeof address === "string" ? "pipe " + address : "port " + port;
  console.log("Listening on " + bind);
});

try {
  const appServer = server.listen(port);
  const io = socket.init(appServer);
  io.on("connection", (socket) => {
    // require chat socket
    require("./src/sockets/index")(socket);

    // save socket id with user id in redis
    socket.on("saveSocketId", async (data) => {
      redisClient.hSet("online users", data.userId, socket.id);
      // change user status to online
      await userModel.findByIdAndUpdate(data.userId, { status: "online" });
    });
    // disconnect
    socket.on("disconnect", async () => {
      const users = await redisClient.hGetAll("online users");
      for (let key in users) {
        if (users[key] === socket.id) {
          await redisClient.hDel("online users", key);
          // change user status to offline
          await userModel.findByIdAndUpdate(key, { status: "offline" });
        }
      }
    });
  });
} catch (error) {
  console.log(error);
}
