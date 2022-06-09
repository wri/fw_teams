import mongoose from "mongoose";
import { EUserRole, ITeamUserRelationModel } from "./teamUserRelation.model";

const { Schema } = mongoose;

export interface ITeam {
  name: string;
  userRole?: EUserRole;
  createdAt: string;
  members?: ITeamUserRelationModel[];
  areas?: string[];
}

const TeamSchema = new Schema({
  name: { type: String, required: false, trim: true },
  createdAt: { type: Date, required: true, default: Date.now }
});

export interface ITeamModel extends ITeam, mongoose.Document {}

export const TeamModel = mongoose.model<ITeamModel>("GFWTeam", TeamSchema);

export default TeamModel;
