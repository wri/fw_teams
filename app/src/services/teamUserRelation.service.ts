import { EUserStatus, ITeamUserRelation, TeamUserRelationModel } from "models/teamUserRelation.model";
import UserService from "./user.service";

class TeamUserRelationService {
  static create(team: ITeamUserRelation) {
    return new TeamUserRelationModel(team).save();
  }

  static createMany(teamUsersToAdd: ITeamUserRelation[]) {
    return TeamUserRelationModel.insertMany(teamUsersToAdd);
  }

  static update(teamId: string, userEmail: string, update: Partial<ITeamUserRelation>) {
    return TeamUserRelationModel.findOneAndUpdate({ teamId, email: userEmail }, update, { new: true });
  }

  static remove(teamUserId: string) {
    return TeamUserRelationModel.findByIdAndRemove(teamUserId);
  }

  static removeAllUsersOnTeam(teamId: string) {
    return TeamUserRelationModel.remove({
      teamId
    });
  }

  static findTeamUser(teamId: string, userId: string) {
    return this.findFullNameForTeamUserRelations(TeamUserRelationModel.findOne({
      teamId,
      userId
    }));
  }

  static findById(id: string) {
    return this.findFullNameForTeamUserRelations(TeamUserRelationModel.findById(id));
  }

  static findAllUsersOnTeam(teamId: string) {
    return this.findFullNameForTeamUserRelations(TeamUserRelationModel.find({ teamId }));
  }

  static findAllByUserId(userId: string) {
    return this.findFullNameForTeamUserRelations(TeamUserRelationModel.find({
      userId
    }));
  }

  static findAllInvitesByUserEmail(userEmail: string) {
    return this.findFullNameForTeamUserRelations(TeamUserRelationModel.find({
      email: userEmail,
      status: EUserStatus.Invited
    }));
  }

  static findFullNameForTeamUserRelations(teamUserRelations) {
    return teamUserRelations.map(teamUserRelation => {
      teamUserRelation.name = UserService.getNameByIdMICROSERVICE(teamUserRelation.userId)
    })
  }
}

export default TeamUserRelationService;
