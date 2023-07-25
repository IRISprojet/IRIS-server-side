const { default: axios } = require("axios");
const deviceModel = require("../models/device.model");
const fingerprintModel = require("../models/fingerprint");

const getAllSessions = async (req, res) => {
  try {
    const sessions = await deviceModel.find({ user: req.user._id }).lean();
    for (let i = 0; i < sessions.length; i++) {
      const fp = await fingerprintModel
        .findOne({
          visitorId: sessions[i].visitorId,
        })
        .lean();
      if (fp) {
        sessions[i] = {
          ...fp,
          ...sessions[i],
        };
      } else {
        // do here fp stuff
        // store fp result in db
        // push fp result in arrays
        const { data } = await axios.get(
          `https://api.fpjs.io/visitors/${sessions[i].visitorId}?api_key=${process.env.fp_secretKey}`
        );

        const newFp = new fingerprintModel({
          visitorId: data.visitorId,
          requestId: data.visits[data.visits.length - 1].requestId,
          browserName: data.visits[data.visits.length - 1].browserDetails.browserName,
          incognito: data.visits[data.visits.length - 1].incognito,
          ip: data.visits[data.visits.length - 1].ip,
          time: data.visits[data.visits.length - 1].time,
          timestamp: data.visits[data.visits.length - 1].timestamp,
          cityName: data.visits[data.visits.length - 1].ipLocation.city.name,
          countryName: data.visits[data.visits.length - 1].ipLocation.country.name,
          countryCode: data.visits[data.visits.length - 1].ipLocation.country.code,
          continentName: data.visits[data.visits.length - 1].ipLocation.continent.code,
          continentCode: data.visits[data.visits.length - 1].ipLocation.continent.name,
          visitorFound: data.visits[data.visits.length - 1].visitorFound,
          browserMajorVersion:
            data.visits[data.visits.length - 1].browserDetails.browserMajorVersion,
          browserFullVersion: data.visits[data.visits.length - 1].browserDetails.browserFullVersion,
          os: data.visits[data.visits.length - 1].browserDetails.os,
          osVersion: data.visits[data.visits.length - 1].browserDetails.osVersion,
          device: data.visits[data.visits.length - 1].browserDetails.device,
          userAgent: data.visits[data.visits.length - 1].browserDetails.userAgent,
          latitude: data.visits[data.visits.length - 1].ipLocation.latitude,
          longitude: data.visits[data.visits.length - 1].ipLocation.longitude,
          timezone: data.visits[data.visits.length - 1].ipLocation.timezone,
          url: data.visits[data.visits.length - 1].url,
          confidenceScore: data.visits[data.visits.length - 1].confidence.score,
          firstSeenAtGlobal: data.visits[data.visits.length - 1].firstSeenAt.global,
          firstSeenAtSubscription: data.visits[data.visits.length - 1].firstSeenAt.subscription,
          lastSeenAtGlobal: data.visits[data.visits.length - 1].lastSeenAt.global,
          lastSeenAtSubscription: data.visits[data.visits.length - 1].lastSeenAt?.subscription,
        });
        await newFp.save();
        // get fp result from db
        const fp = await fingerprintModel
          .findOne({
            visitorId: sessions[i].visitorId,
          })
          .lean();

        sessions[i] = {
          ...fp,
          ...sessions[i],
        };
      }
    }
    res.status(200).send({ message: "Success", sessions });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "something went wrong !" });
  }
};

const verifySession = async (req, res) => {
  console.log(req.query.id);
  const result = await deviceModel.findById(req.query.id);
  if (!result) {
    return res.status(404).send("Device not found");
  }

  //update isVerified
  result.isVerified = true;

  //save the edited session
  try {
    const updatedSession = await result.save();
    res.status(200).send(updatedSession);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
};

const closeSession = async (req, res) => {
  try {
    let result = await deviceModel.deleteOne({
      _id: req.query.id,
    });
    res.status(200).send({ message: "session deleted", result });
  } catch (error) {
    res.status(500).send({ message: "something went wrong !" });
  }
};

const closeAllSessions = async (req, res) => {
  try {
    let result = await deviceModel.deleteMany({ user: req.user._id });
    res.status(200).send({ message: "sessions deleted", result });
  } catch (error) {
    res.status(500).send({ message: "something went wrong !" });
  }
};

module.exports = {
  getAllSessions,
  verifySession,
  closeSession,
  closeAllSessions,
};
