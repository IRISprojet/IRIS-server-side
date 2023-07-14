const Like = require("../models/like.model");
const User = require("../models/user.model");
const Post = require("../models/event.model");

exports.addLike = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { postId } = req.params;

    const existingLike = await Like.findOne({ user: user._id, post: postId });
    if (existingLike) {
      await existingLike.remove();
      const updatedPost = await Post.findByIdAndUpdate(postId, {
        $pull: { likes: existingLike._id },
        new: true,
      })
        .populate({
          path: "comments",
          populate: {
            path: "user",
            select: ["profilePicture", "displayName"],
          },
        })
        .populate({
          path: "user",
          select: ["profilePicture", "displayName"],
        })
        .populate({
          path: "likes",
          populate: {
            path: "user",
            select: ["profilePicture", "displayName"],
          },
        });

      return res.status(200).json({ updatedPost });
    }
    // Créer et sauvegarder le nouveau document Like
    const like = new Like({ post: postId, user });
    const savedLike = await like.save();

    // Mettre à jour le post pour inclure l'ID du nouveau like
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      {
        $push: { likes: savedLike._id },
      },
      { new: true }
    )
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: ["profilePicture", "displayName"],
        },
      })
      .populate({
        path: "user",
        select: ["profilePicture", "displayName"],
      })
      .populate({
        path: "likes",
        populate: {
          path: "user",
          select: ["profilePicture", "displayName"],
        },
      });

    res.status(200).json({ updatedPost });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error adding like" });
  }
};

exports.updateLike = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { likeId } = req.params.likeId;
    const updatedLike = await Like.findByIdAndUpdate(likeId, { user });
    res.json(updatedLike);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating like" });
  }
};

exports.deleteLike = async (req, res) => {
  try {
    const { likeId } = req.params.likeId;
    await Like.findByIdAndDelete(likeId);
    res.json({ message: "Like deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting like" });
  }
};

exports.getLikesByPost = async (req, res) => {
  try {
    const { postId } = req.params.postId;
    const likes = await Like.find({ post: postId }).populate("user");
    res.json(likes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error getting likes" });
  }
};
