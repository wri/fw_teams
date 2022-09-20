import { ITeamModel } from "models/team.model";
import { EUserRole, EUserStatus } from "models/teamUserRelation.model";
import TeamUserRelationService from "services/teamUserRelation.service";
import AreaService from "./areas.service";
import TeamService from "./team.service";
const logger = require("../logger");

class TransformerService {
  static async transform(): Promise<void> {
    const logArray: string[] = [];
    try {
      // get every team
      const legacyTeams = await TeamService.findAll();

      for await (const legacyTeam of legacyTeams) {
        const teamLog: string[] = [];
        const usersToAdd: any[] = [];
        // createAdmin
        teamLog.push(`Adding team ${legacyTeam.name}`);
        legacyTeam.managers.forEach(manager => {
          if (!manager.email) manager.email = `${manager.id}@placeholder.com`;
          if (manager.email && manager.id) usersToAdd.push(manager);
        });
        if (!(usersToAdd[0] && usersToAdd[0].id && usersToAdd[0].email)) {
          teamLog.push(`Invalid team - no valid admin`);
          logArray.push(teamLog.join(","));
          continue;
        }
        teamLog.push(`Chosen admin ${usersToAdd[0].id} ${usersToAdd[0].email}`);
        // create new team from legacy team
        const newTeam: ITeamModel = await TeamService.create(legacyTeam.name, usersToAdd[0], legacyTeam.layers);
        teamLog.push(`GFWTeam added with id ${newTeam.id!} and name ${newTeam.name}`);
        // add managers to team
        usersToAdd.shift();
        for (const user of usersToAdd) {
          teamLog.push(`Adding manager ${user.id} ${user.email}`);
          TeamUserRelationService.create({
            teamId: newTeam.id!,
            userId: user.id,
            email: user.email,
            role: EUserRole.Manager,
            status: EUserStatus.Confirmed
          });
        }
        // add monitors to team
        for (const user of legacyTeam.confirmedUsers) {
          if (!user.email) user.email = `${user.id}@placeholder.com`;
          if (user.email && user.id) {
            teamLog.push(`Adding monitor ${user.id} ${user.email}`);
            TeamUserRelationService.create({
              teamId: newTeam.id!,
              userId: user.id,
              email: user.email!,
              role: EUserRole.Monitor,
              status: EUserStatus.Confirmed
            });
          }
        }

        // add area team relations
        legacyTeam.areas.forEach(area => {
          teamLog.push(`Adding area ${area}`);
          AreaService.createTeamAreaRelation(area, newTeam.id!);
        });
        logArray.push(teamLog.join(","));
      }
      logger.info(logArray);
    } catch (error) {
      logger.info(logArray);
      logger.info(error);
    }
  }
}

export default TransformerService;
