const Comment = require("../models/Comment.model");
const User = require("../models/user.model");
const Post = require("../models/event.model");
const express = require("express");

//add comment

const addcomment = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const post = await Post.findById(req.params.id);
    console.log(post);
    if (!post) {
      return res.status(404).send({ message: "Post not found" });
    }

    const newComment = new Comment({
      user: user.id,
      message: req.body.message,
      post: post.id,
    });

    const commented = await newComment.save();
    post.comments.push(commented);
    const test = await post.save();
    // get the  new post and send it to the client
    const newPost = await Post.findById(post.id)
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

    res.send(newPost);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "something went wrong" });
  }
};
//get comments
const getComments = async (req, res) => {
  try {
    const comments = await Comment.find().sort({ time: -1 });
    res.send(comments);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "something went wrong" });
  }
};

//get by id
const getCommentsbyid = async (req, res) => {
  try {
    const commentId = req.params.id;
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).send("Comment not found");
    }
    res.send(comment);
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
};

// Update a Comment
const updateComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).send({ message: "Comment not found" });
    }

    // Check if the user is an admin or the comment belongs to the user
    const user = await User.findById(req.user._id);
    if (
      user.role !== "admin" &&
      user.role !== "moderator" &&
      comment.user.toString() !== user._id.toString()
    ) {
      return res.status(401).send("Unauthorized");
    }

    // Update the comment properties with the values from the request body
    comment.message = req.body.message;

    // Save the updated comment to the database
    const updatedComment = await comment.save();

    res.send(updatedComment);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Something went wrong" });
  }
};

const deleteComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const comment = await Comment.findById(commentId);
    const user = await User.findById(req.user._id);
    const post = await Post.findOne({ comments: commentId });

    if (user.role === "admin" || comment.user.toString() === user._id.toString()) {
      await comment.deleteOne();

      if (post) {
        post.comments.pull(commentId);
        await post.save();
      }

      res.send("Comment deleted successfully");
    } else {
      res.status(401).send("Unauthorized");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Server error");
  }
};

//Find all comments by a specific user:
const findallcommentsbyuser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const comments = await Comment.find({ user });
    res.send(comments);
  } catch (err) {
    console.error("Error fetching comments:", err);
    res.status(500).send({ message: "something went wrong !" });
  }
};

//Find all comments created after a specific date:

const findallcommentscreatedbydate = async (req, res) => {
  try {
    const fromDate = new Date(req.params.date);

    const comments = await Comment.find({ time: { $gte: fromDate } });

    res.send(comments);
  } catch (err) {
    console.error("Error fetching comments:", err);
    res.status(500).send({ message: "something went wrong !" });
  }
};
//Sort comments by time in descending order:

// Get all comments for a forum

const getCommentsForPost = async (req, res) => {
  try {
    const postId = req.params.id;
    // Récupérer tous les commentaires pour un post donné
    const comments = await Comment.find({ post: postId });

    const commentsWithId = await Promise.all(
      comments.map(async (comment) => {
        const user = await User.findOne(comment.user);
        return {
          id: comment._id,
          message: comment.message,
          user: user.displayName,
        };
      })
    );
    res.status(200).send(commentsWithId);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Something went wrong!" });
  }
};
module.exports = {
  addcomment,
  getComments,
  getCommentsbyid,
  updateComment,
  deleteComment,
  findallcommentsbyuser,
  findallcommentscreatedbydate,
  getCommentsForPost,
};
const router = express.Router();
