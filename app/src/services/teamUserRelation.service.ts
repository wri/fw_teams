import { EUserStatus, TeamUserRelationModel } from "models/teamUserRelation.model";

class TeamUserRelationService {
  static findTeamUser(teamId: string, userId: string) {
    return TeamUserRelationModel.findOne({
      teamId,
      userId
    });
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
