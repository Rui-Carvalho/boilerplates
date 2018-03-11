const config = require("config");
const port = config.get("API.PORT");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const server = require("http").Server(app);
// const io = require("socket.io")(server);

// io.set('transports', ['websocket']);
const routes = require("./app/routes");

const authService = require("./app/auth/auth_service");
const SocketRouter = require("./app/libs/socket_router");

// static files
app.disable("etag");
app.use(bodyParser.json());

app.use("/api", authService);

app.get("/api/test", (req, res) => {
  res.json({ data: { status: true } });
});


app.get("/*", (req, res) => {
  res.sendFile(__dirname + "/app/build/index.html");
});


// socket router
// SocketRouter.use("/start", (io, socket, payload) => {
//   // socket.emit('server', {     status: true }); to everyone
//   io.sockets.emit("/status", { status: true });
// });
// SocketRouter.init(io);

server.listen(port, () => {
  console.log("Listening on port", port);
});
