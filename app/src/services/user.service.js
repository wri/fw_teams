const logger = require("logger");
const axios = require("axios");
const loggedInUserService = require("./LoggedInUserService");
const config = require("config");

class UserService {
  static async getEmailById(userId) {
    logger.info("Get user by user id", userId);
    try {
      let baseURL = config.get("usersApi.url");
      const response = await axios.default({
        baseURL,
        url: `/user/${userId}`,
        method: "GET",
        headers: {
          authorization: loggedInUserService.token
        }
      });
      const user = response.data;
      if (!user || !user.data) return null;
      logger.info("Get user by user id", user);
      return user.data ? user.data.attributes.email : null;
    } catch (e) {
      logger.info("Error finding user", e);
      return null;
    }
  }
}

module.exports = UserService;
