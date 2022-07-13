import mongoose from "mongoose";

const { Schema } = mongoose;

export enum EUserRole {
  Administrator = "administrator",
  Manager = "manager",
  Monitor = "monitor",
  Left = "left"
}

export enum EUserStatus {
  Confirmed = "confirmed",
  Invited = "invited",
  Declined = "declined"
}

export interface ITeamUserRelation {
  teamId: string;
  userId?: string;
  email: string;
  role: EUserRole;
  status: EUserStatus;
  name?: string;
}

const TeamUserRelationSchema = new Schema({
  teamId: { type: Schema.Types.ObjectId, required: true },
  userId: { type: Schema.Types.ObjectId },
  email: { type: String, required: true },
  role: { type: String, required: true },
  status: { type: String, required: true }
});

export interface ITeamUserRelationModel extends ITeamUserRelation, mongoose.Document {}

export const TeamUserRelationModel = mongoose.model<ITeamUserRelationModel>("TeamUserRelation", TeamUserRelationSchema);

export default TeamUserRelationModel;
