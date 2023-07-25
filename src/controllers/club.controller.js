const clubModel = require("../models/club.model");

// add club
const addClub = async (req, res) => {
  try {
    const club = new clubModel(req.body);
    const newClub = await club.save();
    res.send(newClub);
  } catch (err) {
    res.status(500).send(err.message);
  }
};
// get all clubs
const getAllClubs = async (req, res) => {
  try {
    const clubs = await clubModel.find();
    const newClubs = clubs.map((club) => {
      return {
        id: club._id,
        name: club.name,
        email: club.email,
        photoURL: club.photoURL,
        ExecutivePhoto:club.ExecutivePhoto,
        description:club.description,
        budget: club.budget,
      };
    });

    res.send(newClubs);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// get club by id
const getClub = async (req, res) => {
  try {
    const club = await clubModel.findById(req.params.id);
    club.id = club._id;
    delete club._id;
    delete club.__v;
    res.send(club);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// update club
const updateClub = async (req, res) => {
  try {
    const club = await clubModel.findById(req.params.id);
    if (club) {
      club.name = req.body.name;
      club.email = req.body.email;
      club.photoURL = req.body.photoURL;
      club.membersNbr = req.body.membersNbr;
      club.board = req.body.board;
      club.event = req.body.event;
      club.description=req.body.description;
      club.ExecutivePhoto=req.body.ExecutivePhoto
      club.updatedAt = Date.now();
      const updatedClub = await club.save();
      res.send(updatedClub);
    } else {
      res.status(404).send("Club not found");
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
};
// delete club
const deleteClub = async (req, res) => {
  try {
    const club = await clubModel.findById(req.params.id);
    if (club) {
      const deletedClub = await club.remove();
      res.send(deletedClub);
    } else {
      res.status(404).send("Club not found");
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
};

module.exports = { addClub, getAllClubs, getClub, updateClub, deleteClub };
