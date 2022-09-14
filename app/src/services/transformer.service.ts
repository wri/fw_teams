import { ITeamModel } from "models/team.model";
import { EUserRole, EUserStatus } from "models/teamUserRelation.model";
import TeamUserRelationService from "services/teamUserRelation.service";
import AreaService from "./areas.service";
import TeamService from "./team.service";

class TransformerService {
  static async transform(): Promise<void> {
    // get every team
    const legacyTeams = await TeamService.findAll();
    for await (const legacyTeam of legacyTeams) {
      const usersToAdd: any[] = [];
      // createAdmin
      legacyTeam.managers.forEach(manager => {
        if (manager.email && manager.id) usersToAdd.push(manager);
      });
      // create new team from legacy team
      const newTeam: ITeamModel = await TeamService.create(legacyTeam.name, usersToAdd[0], legacyTeam.layers);
      // add managers to team
      usersToAdd.shift();
      for await (const user of usersToAdd) {
        await TeamUserRelationService.create({
          teamId: newTeam.id!,
          userId: user.id,
          email: user.email,
          role: EUserRole.Manager,
          status: EUserStatus.Confirmed
        });
      }
      // add monitors to team
      for await (const user of legacyTeam.confirmedUsers) {
        if (user.email && user.id)
          await TeamUserRelationService.create({
            teamId: newTeam.id!,
            userId: user.id,
            email: user.email!,
            role: EUserRole.Monitor,
            status: EUserStatus.Confirmed
          });
      }

      // add area team relations
      legacyTeam.areas.forEach(area => {
        AreaService.createTeamAreaRelation(area, newTeam.id!);
      });
    }
  }
}

export default TransformerService;
