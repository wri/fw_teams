import mongoose from "mongoose";

const { Schema } = mongoose;

export enum EUserRole {
  Manager = "manager",
  Monitor = "monitor",
  Invited = "invited"
}

export interface ITeam {
  name?: string;
  userRole?: EUserRole;
  managers: never[] | [{ id: string; email?: string }];
  users: string[];
  sentInvitations: string[];
  areas: string[];
  layers: any[];
  confirmedUsers: never[] | [{ id: string; email?: string }];
  createdAt: string;
}

const TeamSchema = new Schema({
  name: { type: String, required: false, trim: true },
  managers: { type: Array, default: [] },
  users: { type: Array, default: [] },
  sentInvitations: { type: Array, default: [] },
  areas: { type: Array, default: [] },
  layers: { type: Array, default: [] },
  confirmedUsers: { type: Array, default: [] },
  createdAt: { type: Date, required: true, default: Date.now }
});

export interface ITeamModel extends ITeam, mongoose.Document {}

export const TeamModel = mongoose.model<ITeamModel>("Team", TeamSchema);

export default TeamModel;
