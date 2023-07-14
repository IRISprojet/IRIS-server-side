const express = require("express");
const router = express.Router();
// import middleware
const { isAdmin ,isAuth } = require("../middleware");
const uploadCloudinary = require('../middleware/cloudinary.middleware');

const storage =require('../middleware/multer.middleware');
// import controller register
const {
addForum,getAllForums,deleteForum,updateForum,getForum,changeIsApproved,getPostsApproved,forbidanwords
 
} = require("../controllers/event.controller");




router.post("/",  storage.single('media'),isAuth, addForum);

router.post("/forbidanwords", isAuth, forbidanwords);
router.get("/",getAllForums);
router.get("/getPostsApproved",getPostsApproved)
router.get("/:id",getForum);
router.delete("/:id",isAuth,deleteForum)
router.put("/approved/:id",isAuth,isAdmin,changeIsApproved)
router.put("/:id" ,  storage.single('media'),isAuth,updateForum)

module.exports = router;
