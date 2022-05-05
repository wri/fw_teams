import Joi from "joi";
import { ITeam } from "models/team.model";

export interface DTOCreateTeam {
  name: ITeam["name"];
}

export default Joi.object<DTOCreateTeam>({
  name: Joi.string().min(3).max(1024).required()
});
