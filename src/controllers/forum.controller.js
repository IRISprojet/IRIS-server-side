const Post = require("../models/Post.model");
const User = require("../models/user.model");
const express = require("express");
const cloudinary = require("cloudinary").v2;
const uploadCloudinary = require("../middleware/cloudinary.middleware");
const socket = require("../../socket");
const notificationModel = require("../models/notification.model");

const forbidanwords = (message) => {
  const forbiddenWords = ["bad", "offensive", "inappropriate"];
  const messageWords = message.split(" ");
  for (let i = 0; i < forbiddenWords.length; i++) {
    if (messageWords.includes(forbiddenWords[i])) {
      return true;
    }
  }
  return false;
};

// Add a new forum
const addForum = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    let type;
    if (req.file && req.file.originalname.endsWith(".mp4")) {
      type = "video";
    } else {
      type = "image";
    }
    let media = {};
    if (req.file && req.file.path) {
      console.log(2);
      // Upload the file to Cloudinary
      if (type === "video") {
        const result = await cloudinary.uploader.upload(req.file.path, {
          resource_type: "video",
          folder: "video",
        });

        media = {
          type: "video",
          preview: result.url,
        };
      } else if (type === "image") {
        const result = await cloudinary.uploader.upload(req.file.path, {
          public_id: `forum/${user.displayName.trim()}`,
        });

        media = {
          type: "image",
          preview: result.url,
        };
      }
    }

    const newForum = new Post({
      message: req.body.message,
      type: type,
      media: media,
      time: req.body.time,
      comments: req.body.comments,
      approved: false,
      user: user.id,
    });

    const savedPost = await newForum.save();

    //get the saved post and populate the user
    const populatedPost = await Post.findById(savedPost._id).populate({
      path: "user",
      select: ["profilePicture", "displayName"],
    });
    //save the post to the notification
    const notification = new notificationModel({
      title: "New post",
      description: "new post created",
      time: new Date(),
      read: false,
      link: "/apps/forum/",
      useRouter: true,
      icon: "heroicons-solid:annotation",
    });
    await notification.save();

    //send notification
    socket.getIO().emit("notificationReceived", {
      title: "New post",
      description: "new post created",
      time: new Date(),
      read: false,
      link: "/apps/forum/",
      useRouter: true,
      icon: "heroicons-solid:annotation",
    });
    res.json(populatedPost);
  } catch (err) {
    console.error(err); // Log the error message as an error
    res.status(500).send(err.message);
  }
};




// Get all forums
const getAllForums = async (req, res) => {
  try {
  
    const posts = await Post.find()
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
      })
      .sort({ time: -1 });
      

    res.status(200).send(posts);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Something went wrong!" });
  }
};

// Get by id
const getForum = async (req, res) => {
  try {
   
    const PostId = req.params.id;
    const post = await Post.findOne(PostId )
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

    res.status(200).send(post);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "something went wrong !" });
  }
};

// Delete a forum
const deleteForum = async (req, res) => {
  try {
    const PostId = req.params.id;

    const post = await Post.findById(PostId).populate({
      path: "user",
    });
    const user = await User.findById(req.user._id);

    // Check if the user is an admin or the course belongs to the user
    if (user.role === "admin" || post.user._id.equals(user._id)) {
      post.deleteOne({ _id: PostId });
      res.send({ _id: PostId });
    } else {
      res.status(401).send("Unauthorized");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Server error");
  }
};

// Update a Post
// const updateForum = async (req, res) => {
//   try {
//     const postId = req.params.id;
//     const post = await Post.findById(postId);
//     if (!post) {
//       return res.status(404).send({ message: "Post not found" });
//     }

//     // Check if the user is an admin or the post belongs to the user
//     const user = await User.findById(req.user._id);
//     if (user.role !== "admin" && user.role !== "moderator" && post.user.toString() !== user._id.toString()) {
//       return res.status(401).send("Unauthorized");
//     }

//     // Update the post properties with the values from the request body
//     post.message = req.body.message;
//     post.type = req.body.type;
//     post.likes = req.body.likes;

//     // Save the updated post to the database
//     const updatedPost = await post.save();

//     res.send(updatedPost);
//   } catch (err) {
//     console.log(err);
//     res.status(500).send({ message: "Something went wrong" });
//   }
// };

const updateForum = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).send({ message: "Post not found" });
    }

    // Check if the user is an admin or the post belongs to the user
    const user = await User.findById(req.user._id);
    if (
      user.role !== "admin" &&
      user.role !== "moderator" &&
      post.user.toString() !== user._id.toString()
    ) {
      return res.status(401).send("Unauthorized");
    }

    // Update the post properties with the values from the request body
    post.message = req.body.message;
    // Update the media property if a new file is uploaded
    if (req.file) {
      let type = req.body.type;

      let media = {};
      if (req.file && req.file.path) {
        // Upload the file to Cloudinary
        if (type === "video") {
          const result = await cloudinary.uploader.upload(req.file.path, {
            resource_type: "video",
            folder: "video",
          });

          media = {
            type: "video",
            preview: result.url,
          };
        } else if (type === "image") {
          const result = await cloudinary.uploader.upload(req.file.path, {
            public_id:`forum/${user.displayName.trim()}`,
          });
        
          media = {
            type: "image",
            preview: result.url,
          };
        }
      }

      post.media = media;
      post.type = type;
    }

    // Save the updated post to the database
    const updatedPost = await post.save();

    res.send(updatedPost);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Something went wrong" });
  }
};

const changeIsApproved = async (req, res) => {
  try {
    const post = await Post.findOne({ id: req.params.id });
    post.approved = !post.approved;
    await post.save();

    //get the new post
    const updatedPost = await Post.findOne({ id: req.params.id })
      .populate({
        path: "user",
        select: ["profilePicture", "displayName"],
      })
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: ["profilePicture", "displayName"],
        },
      })
      .populate({
        path: "likes",
        select: ["profilePicture", "displayName"],
      });

    res.status(200).send({
      updatedPost,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "something went wrong !" });
  }
};

// Get all approved posts
const getPostsApproved = async (req, res) => {
  try {
    const posts = await Post.find({ approved: true });
    res.status(200).send(posts);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Something went wrong" });
  }
};

module.exports = {
  addForum,
  getAllForums,
  deleteForum,
  updateForum,
  getForum,
  changeIsApproved,
  getPostsApproved,
  forbidanwords,
};
