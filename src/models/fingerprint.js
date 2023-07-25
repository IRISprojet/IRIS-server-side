const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    visitorId: { type: String },
    requestId: { type: String },
    tag: { type: String },
    linkedId: { type: String },
    postalCode: { type: String },
    clientReferrer: { type: String },
    ipLocation: { type: String },
    visitorFound: { type: Boolean },
    browserDetails: { type: String },
    botProbability: { type: Number },
    incognito: { type: Boolean },
    ip: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    time: { type: String },
    timestamp: { type: String },
    url: { type: String },
    confidence: { type: String },
    firstSeenAt: { type: String },
    os: { type: String },
    userAgent: { type: String },
    device: { type: String },
    browserName: { type: String },
    lastSeenAt: { type: String },
    firstSeenAtGlobal: { type: String },
    firstSeenAtSubscription: { type: String },
    lastSeenAtGlobal: { type: String },
    lastSeenAtSubscription: { type: String },
    browserFullVersion: { type: String },
    cityName: { type: String },
    countryName: { type: String },
    countryCode: { type: String },
    continentName: { type: String },
    continentCode: { type: String },
    browserMajorVersion: { type: String },
    osVersion: { type: String },
    timezone: { type: String },
    confidenceScore: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Fingerprint", schema);