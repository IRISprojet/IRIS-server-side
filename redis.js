const redis = require("redis");

// Initialize client.
let redisClient = redis.createClient();
redisClient.connect().then(() => {
  console.log("Redis client connected");
});

module.exports = redisClient;
