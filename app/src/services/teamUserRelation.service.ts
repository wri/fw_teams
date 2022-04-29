import { TeamModel } from "models/team.model";
import { TeamUserRelationModel } from "models/teamUserRelation.model";

class TeamUserRelationService {
  async getTeamsByUserId(userId: string, conditions = {}) {
    const teamUserRelations = await TeamUserRelationModel.find({
      userId,
      ...conditions
    });

    const teamIdsToFind = teamUserRelations.map(teamUserRelation => teamUserRelation.teamId);

    return TeamModel.find({ _id: { $in: teamIdsToFind } });
  }
}

export default new TeamUserRelationService();
