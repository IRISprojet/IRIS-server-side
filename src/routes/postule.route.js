const express = require("express");
const router = express.Router();
// import middleware
const { isAdmin ,isAuth } = require("../middleware");
// import controller register
const {
    addPostule,getPostulesByinternship,updatedPostule
 
} = require("../controllers/postuler.controller");




router.post('/:internshipId', isAuth, addPostule);
//router.put('/:likeId', isAuth, updatedPostule);
//router.delete('/:likeId', isAuth, deleteLike);
router.get('/:internshipId', isAuth, getPostulesByinternship);




module.exports = router;