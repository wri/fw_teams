import TeamModel from "models/team.model";

class TeamService {
  static async findById(id: string) {
    try {
      return await TeamModel.findById(id);
    } catch (e) {
      throw new Error(`Team not found with id: ${id}`);
    }
  }
}

export default TeamService;
