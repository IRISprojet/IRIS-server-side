const express = require("express");
const router = express.Router();
// import middleware
const { isAdmin ,isAuth } = require("../middleware");
// import controller register
const {
    addLike,deleteLike,getLikesByPost,updateLike
 
} = require("../controllers/like.controller");




router.post('/:postId', isAuth, addLike);
router.put('/:likeId', isAuth, updateLike);
router.delete('/:likeId', isAuth, deleteLike);
router.get('/:postId', isAuth, getLikesByPost);




module.exports = router;