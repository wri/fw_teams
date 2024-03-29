import mongoose from "mongoose";

const { Schema } = mongoose;

export enum EUserRole {
  Manager = "manager",
  Monitor = "monitor",
  Invited = "invited"
}

export interface ILegacyTeam {
  name: string;
  userRole?: EUserRole;
  // Managers of the Team
  managers: { id: string; email: string }[];
  // Users who have been invited but have not confirmed their invitation
  users: string[];
  // Deprecated
  sentInvitations: string[];
  areas: string[];
  layers: any[];
  // Users who have accepted their invitation to the team
  confirmedUsers: { id: string; email?: string }[];
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

export interface ILegacyTeamModel extends ILegacyTeam, mongoose.Document {}

export const Legacy_teamModel = mongoose.model<ILegacyTeamModel>("Team", TeamSchema);

export default Legacy_teamModel;
