import mongoose from "mongoose";
import Joi from "joi";

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
  userId: string;
  email: string;
  role: EUserRole;
  status: EUserStatus;
}

const TeamUserJoiSchema = Joi.object<ITeamUserRelation>({
  teamId: Joi.string().hex().required(),
  email: Joi.string().email().required(),
  role: Joi.string()
    .valid(...Object.values(EUserRole))
    .required(),
  status: Joi.string()
    .valid(...Object.values(EUserStatus))
    .required()
});

const TeamUserRelationSchema = new Schema({
  teamId: { type: Schema.Types.ObjectId, required: true },
  userId: { type: Schema.Types.ObjectId, required: true },
  email: { type: String, required: true },
  role: { type: String, required: true },
  status: { type: String, required: true }
});

export interface ITeamUserRelationModel extends ITeamUserRelation, mongoose.Document {}

export const TeamUserRelationModel = mongoose.model<ITeamUserRelationModel>("TeamUserRelation", TeamUserRelationSchema);

export const validateTeamUser = TeamUserJoiSchema.validate;

export default TeamUserRelationModel;
