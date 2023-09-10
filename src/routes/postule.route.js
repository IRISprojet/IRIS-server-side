const express = require("express");
const router = express.Router();
// import middleware
const { isAdmin ,isAuth } = require("../middleware");
// import controller register
const {
    addPostule,getPostulesByInternship,updatedPostule
 
} = require("../controllers/postuler.controller");


router.get('/:internshipId', isAuth, getPostulesByInternship);

router.post('/:internshipId', isAuth, addPostule);
//router.put('/:likeId', isAuth, updatedPostule);
//router.delete('/:likeId', isAuth, deleteLike);





module.exports = router;