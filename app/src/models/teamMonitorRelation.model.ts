import mongoose from "mongoose";

const { Schema } = mongoose;

export interface ITeamMonitorRelation {
  teamId: string;
  userId: string;
  email: string;
  status: string;
}

const TeamMonitorRelationSchema = new Schema({
  teamId: { type: Schema.Types.ObjectId, required: true },
  userId: { type: Schema.Types.ObjectId, required: true },
  email: { type: String, required: true },
  status: { type: String, required: true }
});

export interface ITeamMonitorRelationModel extends ITeamMonitorRelation, mongoose.Document {}

export const TeamMonitorRelationModel = mongoose.model<ITeamMonitorRelationModel>(
  "TeamMonitorRelation",
  TeamMonitorRelationSchema
);

export default TeamMonitorRelationModel;
