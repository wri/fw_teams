import mongoose from "mongoose";
import Joi from "joi";
import { EUserRole } from "./teamUserRelation.model";

const { Schema } = mongoose;

export interface ITeam {
  name: string;
  userRole: EUserRole;
  createdAt: string;
}

const TeamJoiSchema = Joi.object<ITeam>({
  name: Joi.string().min(1).max(1024).required()
});

const TeamSchema = new Schema({
  name: { type: String, required: false, trim: true },
  createdAt: { type: Date, required: true, default: Date.now }
});

export interface ITeamModel extends ITeam, mongoose.Document {}

export const TeamModel = mongoose.model<ITeamModel>("GFWTeam", TeamSchema);

export const validateTeam = TeamJoiSchema.validate;

export default TeamModel;
