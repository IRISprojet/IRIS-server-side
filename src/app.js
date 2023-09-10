const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const connection = require("./config/DatabaseConfig");
const passport = require("passport");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const cookieEncrypter = require("cookie-encrypter");
// Import Routes
const userRoute = require("./routes/user.route");
const deviceRoute = require("./routes/device.route");
const adminRoute = require("./routes/admin.route");
const noteRoute = require("./routes/note.route");
const { isAuth, isAdmin } = require("./middleware");
const InternshipRoute = require("./routes/Internship.route");
const InternshipCategoryRoute = require("./routes/InternshipCategory.route");
const forumRoute = require("./routes/forum.route");
const commentRoute = require("./routes/comment.route");
const likeRoute = require("./routes/like.route");
const appliedRoute = require ("./routes/postule.route")
const conversationRoute = require("./routes/conversation.route");
const messageRoute = require("./routes/message.route");
const notificationRoute = require("./routes/notification.route");

const app = express();
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 600000,
      sameSite: true,
      secure: false,
    },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const bodyParser = require("body-parser");
app.use(bodyParser.json({ limit: "50mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
//app.use(express.json({ limit: "40mb" }));
app.use(helmet());
app.use(cors({ credentials: true, origin: true }));
// cookie parser
app.use(cookieParser(process.env.COOKIE_PARSER_SECRET));
// cookie parser
//must be 32 character  long secret key (with aes256)
app.use(cookieEncrypter("UWokkDVLnZBWD6yymW95H10n2wEXfVDs"));

connection.getConnections();

app.use(passport.initialize());
app.use(passport.session());
// Route MiddleWares
app.use("/api/user", userRoute);
//only authenticated user can access this route
app.use("/api/devices", isAuth, deviceRoute);
//only admin can access this route
app.use("/api/admin", adminRoute);

// Internship Routes
app.use("/api/Internship", isAuth, InternshipRoute);
// course category routes
app.use("/api/category", isAuth, InternshipCategoryRoute);

//label(notes) routes
app.use("/api/note", noteRoute);

//forum route
app.use("/api/post", forumRoute);
//forum route
app.use("/api/comment", commentRoute);
//like route
app.use("/api/like", likeRoute);
//applied to internship
app.use("/api/applied", appliedRoute);

//conversation route
app.use("/api/conversation", isAuth, conversationRoute);
//message route
app.use("/api/message", isAuth, messageRoute);
//notification route
app.use("/api/notification", isAuth, notificationRoute);

module.exports = app;
