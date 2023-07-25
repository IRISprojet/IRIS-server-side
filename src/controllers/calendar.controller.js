const eventModel = require("../models/event.model");
const userModel = require("../models/user.model");
const calendarModel = require("../models/calendar.model");
var jwt = require("jsonwebtoken");
const notificationModel = require("../models/notification.model");
const socket = require("../../socket");

const getAllEvents = async (req, res) => {
  try {
    const events = await eventModel.find().lean();
    // add property id to each event for frontend compatibility
    events.forEach((event) => {
      event.id = event._id;
      return event;
    });
    res.send(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get events" });
  }
};

const addEvent = async (req, res) => {
  try {
    const token = req.headers["x-access-token"]; // extract the token from the Authorization header
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET); // decode the token payload
    const userId = decodedToken._id; // extract the user ID from the payload

    const eventData = req.body;

    const newEvent = new eventModel({
      ...eventData,
      user: userId,
    });

    const savedEvent = await newEvent.save();

    //save the post to the notification
    const notification = new notificationModel({
      title: "New event",
      description: "new post created",
      time: new Date(),
      read: false,
      link: "/apps/calendar/",
      useRouter: true,
      icon: "heroicons-solid:calendar",
    });
    await notification.save();

    //send notification
    socket.getIO().emit("notificationReceived", {
      title: "New event",
      description: "new event created",
      time: new Date(),
      read: false,
      link: "/apps/calendar/",
      useRouter: true,
      icon: "heroicons-solid:calendar",
    });
    res.status(201).json(savedEvent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save event" });
  }
};

const editEvent = async (req, res) => {
  try {
    const updatedEvent = await eventModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedEvent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update event" });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const deletedEvent = await eventModel.findByIdAndDelete(req.params.id);
    res.json(deletedEvent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete event" });
  }
};

const getEventById = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await eventModel.findById(eventId);
    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve event" });
  }
};

//*********************************************************calendar in dashboard admin */

const getCalendars = async (req, res) => {
  try {
    const calendars = await calendarModel.find({}).sort({ _id: -1 }).lean();
    //add id to each calendar
    calendars.forEach((calendar) => {
      calendar.id = calendar._id;
    });

    res.send(calendars);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
const getCalendarById = async (req, res) => {
  try {
    const calendar = await calendarModel.findById(req.params.id).lean();
    if (!calendar) {
      return res.status(200).send({
        message: "Calendar not found with id " + req.params.id,
      });
    }
    calendar.id = calendar._id;
    res.send(calendar);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};
const addCalendar = async (req, res) => {
  try {
    const newCalendar = new calendarModel({
      title: req.body.title,
      color: req.body.color,
    });
    await newCalendar.save();
    res.status(200).send({
      message: "Calendar Added Successfully!",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const updateCalendar = async (req, res) => {
  try {
    const calendar = await calendarModel.findById(req.params.id);
    if (!calendar) {
      return res.status(404).send({ message: "Calendar not found" });
    }
    calendar.title = req.body.title;
    calendar.color = req.body.color;
    const newCalendar = await calendar.save();
    res.status(200).send(newCalendar);
  } catch (err) {
    res.status(500).send({ success: false, error: "something went wrong" });
  }
};

const deleteCalendar = async (req, res) => {
  try {
    const calendar = await calendarModel.findById(req.params.id);
    if (!calendar) {
      return res.status(404).send({ message: "Calendar not found" });
    }
    await calendar.remove();
    res.status(200).send({ message: "Calendar deleted successfully" });
  } catch (err) {
    res.status(500).send({ success: false, error: "something went wrong" });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  addEvent,
  deleteEvent,
  editEvent,

  //calendar
  getCalendars,
  getCalendarById,
  addCalendar,
  updateCalendar,
  deleteCalendar,
  //
};
