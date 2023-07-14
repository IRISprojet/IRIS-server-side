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

const adminRoute = require("./routes/admin.route");
const { isAuth, isAdmin } = require("./middleware");
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

//only admin can access this route
app.use("/api/admin", adminRoute);


module.exports = app;
