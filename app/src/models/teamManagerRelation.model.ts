import mongoose from "mongoose";

const { Schema } = mongoose;

export interface ITeamManagerRelation {
  teamId: string;
  userId: string;
  email: string;
  status: string;
}

const TeamManagerRelationSchema = new Schema({
  teamId: { type: Schema.Types.ObjectId, required: true },
  userId: { type: Schema.Types.ObjectId, required: true },
  email: { type: String, required: true },
  status: { type: String, required: true }
});

export interface ITeamManagerRelationModel extends ITeamManagerRelation, mongoose.Document {}

export const TeamManagerRelationModel = mongoose.model<ITeamManagerRelationModel>(
  "TeamManagerRelation",
  TeamManagerRelationSchema
);

export default TeamManagerRelationModel;
