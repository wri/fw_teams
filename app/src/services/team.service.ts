import TeamModel, { ITeamModel, ITeam } from "models/team.model";
import TeamUserRelationModel, { EUserRole, EUserStatus } from "models/teamUserRelation.model";

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
}

export default TeamService;
