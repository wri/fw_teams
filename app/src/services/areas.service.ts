const config = require("config");
const logger = require("logger");
const axios = require("axios");
const loggedInUserService = require("./LoggedInUserService");

class AreaService {
  static async getTeamAreas(id: string) {
    logger.info(`Getting areas of team with id ${id}`);
    try {
      const baseURL = config.get("areasApi.url");
      const response = await axios.default({
        baseURL,
        url: `/area/teamAreas/${id}`,
        method: "GET",
        headers: {
          authorization: loggedInUserService.token
        }
      });
      const areas = response.data;
      logger.info("Got areas", areas);
      return areas && areas.data;
    } catch (e) {
      logger.error("Error while fetching areas", e);
    }
  }

  static async createTeamAreaRelation(areaId: string, teamId: string) {
    try {
      const baseURL = config.get("areasApi.url");
      await axios.default({
        baseURL,
        url: `/area/${areaId}/team/${teamId}`,
        method: "POST",
        headers: {
          authorization: loggedInUserService.token
        }
      });
      return null;
    } catch (e) {
      logger.error("Error while creating relation", e);
    }
  }
}
export default AreaService;
