const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);
const jwt = require("jsonwebtoken");
const { signInToken, tokenForVerifyAdmin } = require("../utils/generateToken");
const sendEmail = require("../utils/emails/sendEmail");
const cloudinary = require('cloudinary').v2;

const registerAdmin = async (req, res) => {
  try {
    const isAdded = await userModel.findOne({ email: req.body.email });
    if (isAdded) {
      return res.status(403).send({
        message: "This Email already Added!",
      });
    } else {
      const newAdmin = new userModel({
        displayName: req.body.name,
        email: req.body.email,
        role: req.body.role.toLowerCase(),
        password: bcrypt.hashSync(req.body.data.password),
      });
      const admin = await newAdmin.save();
      const token = signInToken(admin);
      const date = new Date();
      date.setDate(
        date.getDate() + process.env.REFRESH_TOKEN_COOKIE_EXPIRATION
      );
      const refreshtoken = jwt.sign(
        { _id: admin._id, displayName: admin.displayName },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
        }
      );
      res.cookie(process.env.REFRESH_TOKEN_NAME, `${refreshtoken}`, {
        expires: date,
        httpOnly: true,
        secure: false,
      });
      res.send({
        token,
        _id: admin._id,
        name: admin.displayName,
        email: admin.email,
        role: admin.role.toLowerCase(),
        joiningDate: Date.now(),
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: "Please Try Again" });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const admin = await userModel.findOne({ email: req.body.email });
    if (!admin) {
      return res
        .status(401)
        .send({ success: false, error: "Incorrect email or password" });
    }
    if (admin.role !== "admin") {
      return res
        .status(403)
        .send({ success: false, error: "You are not an admin" });
    }
    if (admin && bcrypt.compareSync(req.body.password, admin.password)) {
      const token = signInToken(admin);
      const date = new Date();
      date.setDate(
        date.getDate() + process.env.REFRESH_TOKEN_COOKIE_EXPIRATION
      );
      const refreshtoken = jwt.sign(
        { _id: admin._id, displayName: admin.displayName },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
        }
      );
      res.cookie(process.env.REFRESH_TOKEN_NAME, `${refreshtoken}`, {
        expires: date,
        httpOnly: true,
        secure: false,
      });
      res.send({
        token,
        _id: admin._id,
        name: admin.displayName,
        phone: admin.phone,
        email: admin.email,
        image: admin.photoURL,
      });
    } else {
      res.status(401).send({
        message: "Invalid Admin or password!",
      });
    }
  } catch (err) {
    
    res.status(500).send({ success: false, error: "something went wrong" });
  }
};

const forgetPassword = async (req, res) => {
  try {
    const isAdded = await userModel.findOne({ email: req.body.verifyEmail });
    if (!isAdded) {
      return res.status(404).send({
        message: "Admin Not found with this email!",
      });
    } else {
      const token = tokenForVerifyAdmin(isAdded);
      const link = `http://localhost:3001/reset-password/${token}`;
      // create the email message
      const message = {
        from: process.env.EMAIL,
        to: isAdded.email,
        subject: "Password Reset Request",
        html: `<h1>Hello,</h1>
      <p>
      We have received a request to reset the password associated with
      your account. To proceed with resetting your password, </p>
      <a href="${link}">Click here</a>
      <p>
      Once you have clicked on the link, you will be redirected to our website where you can continue to access our services.

      If you have any questions or concerns regarding the verification of your account, please do not hesitate to contact us by replying to this email.

      Thank you for your cooperation, \n

      Best regards,</p>`,
      };
      // send the email
      sendEmail(message);
    }
  } catch (err) {
    
    res.status(500).send({ success: false, error: "something went wrong" });
  }
};
const resetPassword = async (req, res) => {
  const token = req.body.token;
  const { email } = jwt.decode(token);
  const admin = await userModel.findOne({ email: email });
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET_FOR_VERIFY, (err, decoded) => {
      if (err) {
        return res.status(500).send({
          message: "Token expired, please try again!",
        });
      } else {
        admin.password = bcrypt.hashSync(req.body.newPassword);
        admin.save();
        res.send({
          message: "Your password change successful, you can login now!",
        });
      }
    });
  }
};

const addStaff = async (req, res) => {
  try {
    const isAdded = await userModel.findOne({ email: req.body.data.email });
    if (isAdded) {
      return res.status(500).send({
        message: "This Email already Added!",
      });
    } else {
      const newStaff = new userModel({
        displayName: req.body.data.name,
        email: req.body.data.email,
        password: bcrypt.hashSync(req.body.data.password),
        phone: req.body.data.phone,
        role: req.body.data.role.toLowerCase(),
        photoURL: req.body.data.image,
      });
      await newStaff.save();
      res.status(200).send({
        message: "Staff Added Successfully!",
      });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const getAllStaff = async (req, res) => {
  try {
    const staff = await userModel
      .find({ role: { $in: ["staff", "moderator", "admin"] } })
      .sort({ _id: -1 });
    res.send(staff);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const getStaffById = async (req, res) => {
  try {
    const staff = await userModel.findOne({
      _id: req.params.id,
      role: { $in: ["staff", "moderator", "admin"] },
    });
    res.send(staff);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const updateStaff = async (req, res) => {
  try {
    const staff = await userModel.findById(req.params.id);
    if (staff) {
      staff.name = req.body.data.name;
      staff.email = req.body.data.email;
      staff.phone = req.body.data.phone;
      staff.role = req.body.data.role.toLowerCase();
      staff.joiningData = dayjs().utc().format(req.body.data.joiningDate);
      staff.password = req.body.data.password
        ? bcrypt.hashSync(req.body.data.password)
        : staff.password;

      let profilePicture;

      if (req.file && req.file.path) {
        try {
          const result = await cloudinary.uploader.upload(req.file.path, {
            public_id: `staff/${staff.displayName}-${staff._id}`,
          });
          profilePicture = result.secure_url;

          // Copy the image to the 'faces' directory
          const fileName = path.basename(req.file.path);
          const destPath = path.join(__dirname, "../utils/Face-Recog38/faces", fileName);
          fs.copyFileSync(req.file.path, destPath);
        } catch (error) {
          console.error(error);
          return res.status(500).json({ error: "Something went wrong." });
        }
      } else {
        profilePicture = req.body.data.profilePicture || staff.photoURL;
      }

      staff.photoURL = profilePicture;

      const updatedStaff = await staff.save();
      const token = signInToken(updatedStaff);
      res.send({
        token,
        _id: updatedStaff._id,
        name: updatedStaff.displayName,
        email: updatedStaff.email,
        role: updatedStaff.role,
        photoURL: updatedStaff.photoURL,
        joiningData: updatedStaff.createdAt,
      });
    }
  } catch (err) {
    
    res.status(500).send({ success: false, error: "something went wrong" });
  }
};


const deleteStaff = (req, res) => {
  userModel.deleteOne({ _id: req.params.id }, (err) => {
    if (err) {
      res.status(500).send({
        message: err.message,
      });
    } else {
      res.status(200).send({
        message: "Staff member Deleted Successfully!",
      });
    }
  });
};

const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find({}).sort({ _id: -1 });
    res.send(users);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const changeIsBanned = async (req, res) => {
  try {
    const USER = await userModel.findOne({ _id: req.params.id });
    USER.isBanned = !USER.isBanned;
    const updatedUser = await USER.save();
    res.status(200).send({
      message: "Ban status successfully changed",
      data: updatedUser.isBanned,
    });
  } catch (error) {
    
    res.status(500).send({ message: "something went wrong !" });
  }
};

module.exports = {
  changeIsBanned,
  addStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  resetPassword,
  registerAdmin,
  loginAdmin,
  forgetPassword,
  getAllUsers,
};
