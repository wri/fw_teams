import {
  EUserStatus,
  EUserRole,
  ITeamUserRelation,
  TeamUserRelationModel,
  ITeamUserRelationModel
} from "models/teamUserRelation.model";
const UserService = require("./user.service");

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

  static async findTeamUser(teamId: string, userId: string) {
    return this.findFullNameForTeamUserRelation(
      await TeamUserRelationModel.findOne({
        teamId,
        userId
      })
    );
  }

  static async findById(id: string) {
    return this.findFullNameForTeamUserRelation(await TeamUserRelationModel.findById(id));
    //return TeamUserRelationModel.findById(id);
  }

  static async findAllUsersOnTeam(teamId: string, teamUserRole: EUserRole) {
    if (teamUserRole === EUserRole.Administrator || teamUserRole === EUserRole.Manager) {
      return this.findFullNameForTeamUserRelations(await TeamUserRelationModel.find({ teamId }));
    } else {
      return this.findFullNameForTeamUserRelations(await TeamUserRelationModel.find({ teamId }).select("-status"));
    }
  }

  static async findAllByUserId(userId: string) {
    return this.findFullNameForTeamUserRelations(
      await TeamUserRelationModel.find({
        userId
      })
    );
  }

  static async findAllInvitesByUserEmail(userEmail: string) {
    return this.findFullNameForTeamUserRelations(
      await TeamUserRelationModel.find({
        email: userEmail,
        status: EUserStatus.Invited
      })
    );
  }

  static async findFullNameForTeamUserRelation(teamUserRelation: ITeamUserRelationModel) {
    if (teamUserRelation) teamUserRelation.name = await UserService.getNameByIdMICROSERVICE(teamUserRelation.userId);
    return teamUserRelation;
  }

  static findFullNameForTeamUserRelations(teamUserRelations: ITeamUserRelationModel[]) {
    return Promise.all(
      teamUserRelations.map(async teamUserRelation => {
        if (teamUserRelation)
          teamUserRelation.name = await UserService.getNameByIdMICROSERVICE(teamUserRelation.userId);
        return teamUserRelation;
      })
    );
  }
}

export default TeamUserRelationService;
