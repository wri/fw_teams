import TeamModel, { ITeamModel, ITeam } from "models/team.model";
import TeamUserRelationModel, { EUserRole, EUserStatus, ITeamUserRelationModel } from "models/teamUserRelation.model";
import TeamUserRelationService from "services/teamUserRelation.service";

class TeamService {
  static async create(name: ITeam["name"], loggedUser: any): Promise<ITeamModel> {
    const { id: userId, email: userEmail } = loggedUser; // ToDo: loggedUser Type

    const team = await new TeamModel({ name }).save();

    // Create the Team User relation model
    // The logged-in user will become the "Administrator" of the team
    await new TeamUserRelationModel({
      teamId: team.id,
      userId: userId,
      email: userEmail,
      role: EUserRole.Administrator,
      status: EUserStatus.Confirmed
    }).save();

    return team;
  }

  static update(id: string, name: ITeam["name"]) {
    return TeamModel.findByIdAndUpdate(
      id,
      {
        name
      },
      { new: true }
    );
  }

  static async delete(id: string): Promise<void> {
    await TeamModel.findByIdAndRemove(id);

    // Remove all team user relations
    await TeamUserRelationModel.remove({
      teamId: id
    });
  }

  static findById(id: string) {
    return TeamModel.findById(id);
  }

  static async findAllInvites(userEmail: string): Promise<ITeamModel[]> {
    const teamUserRelations = await TeamUserRelationService.findAllInvitesByUserEmail(userEmail);

    return await TeamService.findAllByTeamUserRelations(teamUserRelations);
  }

  static async findAllByUserId(userId: string): Promise<ITeamModel[]> {
    const teamUserRelations = await TeamUserRelationService.findAllByUserId(userId);

    return await TeamService.findAllByTeamUserRelations(teamUserRelations);
  }

  static async findAllByTeamUserRelations(teamUserRelations: ITeamUserRelationModel[]): Promise<ITeamModel[]> {
    const teams: ITeamModel[] = [];
    for (let i = 0; i < teamUserRelations.length; i++) {
      const teamUser = teamUserRelations[i];

      const team = await TeamService.findById(teamUser.teamId);

      team.userRole = teamUser.role;

      teams.push(team);
    }

    return teams;
  }
}

export default TeamService;
