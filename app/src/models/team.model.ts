import mongoose from "mongoose";

const { Schema } = mongoose;

export interface ITeam {
  name: string;
  createdAt: string;
}

const TeamSchema = new Schema({
  name: { type: String, required: false, trim: true },
  createdAt: { type: Date, required: true, default: Date.now }
});

export interface ITeamModel extends ITeam, mongoose.Document {}

export const TeamModel = mongoose.model<ITeamModel>("Team", TeamSchema);

export default TeamModel;
