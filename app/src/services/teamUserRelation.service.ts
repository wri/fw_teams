import { ITeamModel, TeamModel } from "models/team.model";
import { TeamUserRelationModel } from "models/teamUserRelation.model";

class TeamUserRelationService {
  async getTeamsByUserId(userId: string, conditions = {}) {
    const teamUserRelations = await TeamUserRelationModel.find({
      userId,
      ...conditions
    });

    const teams: ITeamModel[] = [];
    for (let i = 0; i < teamUserRelations.length; i++) {
      const teamUser = teamUserRelations[i];

      const team = await TeamModel.findById(teamUser.teamId);

      team.userRole = teamUser.role;

      teams.push(team);
    }

    return teams;
  }
}

export default new TeamUserRelationService();
