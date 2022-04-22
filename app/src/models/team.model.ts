import mongoose from "mongoose";

const { Schema } = mongoose;

export enum EUserRole {
  Manager = "manager",
  Monitor = "monitor",
  Invited = "invited"
}

export interface ITeamModel extends mongoose.Document {
  name?: string;
  userRole?: EUserRole;
  managers: [];
  users: [];
  sentInvitations: [];
  areas: [];
  layers: [];
  confirmedUsers: [];
  createdAt: [];
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

export const TeamModel = mongoose.model<ITeamModel>("Team", TeamSchema);

export default TeamModel;
