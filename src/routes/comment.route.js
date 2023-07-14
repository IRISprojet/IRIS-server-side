const express = require("express"); 
const router = express.Router();
const {
    addcomment,
    getComments ,
    getCommentsbyid,
    updateComment,
    deleteComment,
    findallcommentsbyuser,
    findallcommentscreatedbydate,
    getCommentsForPost
   
   
  } = require("../controllers/comment.contoller");
 


// import middleware
const { isAuth } = require("../middleware");


router.post("/:id",isAuth, addcomment);
router.get("/",isAuth, getComments);
router.get("/getCommentsForPost/:id",getCommentsForPost)
router.get("/:id", getCommentsbyid);
router.get("/:date",isAuth, findallcommentscreatedbydate);
router.put("/:id", isAuth, updateComment);
router.delete("/:id",isAuth, deleteComment);
router.get("/user/:id",isAuth, findallcommentsbyuser);








module.exports = router;