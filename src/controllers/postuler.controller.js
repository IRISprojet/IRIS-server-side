const Postuler = require("../models/postuler.model");
const User = require("../models/user.model");
const Internship = require("../models/internship.model");

// exports.addPostule = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);
//     const { internshipId } = req.params;

//     const existingPostuler = await postuler.findOne({ user: user._id, internship: internshipId });
//     if (existingPostuler) {
//       await existingPostuler.remove();
//       const updatedinternship = await internship.findByIdAndUpdate(internshipId, {
//         $pull: { postules: existingPostuler._id },
//         new: true,
//       })
       
//         .populate({
//           path: "user",
//           select: ["profilePicture", "displayName"],
//         })
//         .populate({
//           path: "postules",
//           populate: {
//             path: "user",
//             select: ["profilePicture", "displayName"],
//           },
//         });

//       return res.status(200).json({ updatedinternship });
//     }
//     // Créer et sauvegarder le nouveau document Postuler
//     const postuler = new postuler({ internship: internshipId, user });
//     const savedpostule = await postuler.save();

//     // Mettre à jour le stage pour inclure l'ID du nouveau postule
//     const updatedPostule = await Post.findByIdAndUpdate(
//       postId,
//       {
//         $push: { postules: savedpostule._id },
//       },
//       { new: true }
//     )
     
//       .populate({
//         path: "user",
//         select: ["profilePicture", "displayName"],
//       })
//       .populate({
//         path: "postules",
//         populate: {
//           path: "user",
//           select: ["profilePicture", "displayName"],
//         },
//       });

//     res.status(200).json({ updatedPostule });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Error applied to internship" });
//   }
// };

// exports.updatedPostule = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);
//     const { postuleId } = req.params.postuleId;
//     const updatedpostule = await Like.findByIdAndUpdate(postuleId, { user });
//     res.json(updatedpostule);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "applied to internship" });
//   }
// };


exports.addPostule = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { internshipId } = req.params;

    const existingPostuler = await Postuler.findOne({ user: user._id, internship: internshipId });

    if (existingPostuler) {
      // If the user has already postulated, remove the postulation and update the internship.
      await existingPostuler.remove();

      await Internship.findByIdAndUpdate(
        internshipId,
        {
          $pull: { postules: existingPostuler._id },
        },
        { new: true }
      );

      return res.status(200).json({ message: 'Postulation removed' });
    }

    // Create and save a new Postuler document
    const postuler = new Postuler({ internship: internshipId, user });
    const savedPostuler = await postuler.save();

    // Update the internship to include the ID of the new postulation
    const updatedInternship = await Internship.findByIdAndUpdate(
      internshipId,
      {
        $push: { postules: savedPostuler._id },
      },
      { new: true }
    );

    res.status(200).json({ message: 'Postulation added', updatedInternship });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error applying to the internship' });
  }
};



exports.getPostulesByinternship = async (req, res) => {
  try {
    const { postId } = req.params;
    const postules = await Postuler.find({ postuler: postId }).populate("user");
    res.json(postules);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error getting likes" });
  }
};
