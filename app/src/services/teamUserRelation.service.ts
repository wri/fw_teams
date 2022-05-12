import { EUserStatus, ITeamUserRelation, TeamUserRelationModel } from "models/teamUserRelation.model";

class TeamUserRelationService {
  static createMany(teamUsersToAdd: ITeamUserRelation[]) {
    return TeamUserRelationModel.insertMany(teamUsersToAdd);
  }

  static update(teamId: string, userEmail: string, update: Partial<ITeamUserRelation>) {
    return TeamUserRelationModel.findOneAndUpdate({ teamId, email: userEmail }, update, { new: true });
  }

  static findTeamUser(teamId: string, userId: string) {
    return TeamUserRelationModel.findOne({
      teamId,
      userId
    });
  }

  static findById(id: string) {
    return TeamUserRelationModel.findById(id);
  }

  static findAllUsersOnTeam(teamId: string) {
    return TeamUserRelationModel.find({ teamId });
  }

  static findAllByUserId(userId: string) {
    return TeamUserRelationModel.find({
      userId
    });
  }

  static findAllInvitesByUserEmail(userEmail: string) {
    return TeamUserRelationModel.find({
      email: userEmail,
      status: EUserStatus.Invited
    });
  }
}

export default TeamUserRelationService;
