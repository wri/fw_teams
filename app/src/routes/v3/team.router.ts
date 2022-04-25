import Router from "koa-router";
import { TeamModel, EUserRole } from "models/team.model";
import { authMiddleware } from "middlewares";
import teamSerializer from "serializers/teamWithUserRole.serializer";

type TQuery = {
  loggedUser: string;
  userRole?: string;
};

const router = new Router();

// GET /v3/teams
router.get("/teams", authMiddleware, async ctx => {
  const query = <TQuery>ctx.request.query;
  const { id: userId, email: userEmail } = JSON.parse(query.loggedUser); // ToDo: loggedUser Type

  const { userRole = Object.values(EUserRole).join(",") } = query;
  const userRoles = userRole.split(",");

  const orFilter: any[] = [];
  userRoles.forEach(filter => {
    switch (filter) {
      case EUserRole.Manager:
        orFilter.push({ "managers.id": userId });
        break;
      case EUserRole.Monitor:
        orFilter.push({ "confirmedUsers.id": userId });
        break;
      case EUserRole.Invited:
        orFilter.push({ users: userEmail });
        break;
    }
  });

  if (!orFilter.length) {
    ctx.status = 400;
    throw new Error("userRole query string incorrect");
  }

  let teams = await TeamModel.find({
    $or: orFilter
  });

  teams = teams.map(team => {
    // Find the role the current user has for this team
    // Is the user a manager?
    if (team.managers.some(manager => manager.id === userId)) {
      team.userRole = EUserRole.Manager;
    }

    // Is the user a confirmedUser? (Monitor)
    if (team.confirmedUsers.some(confirmedUser => confirmedUser.id === userId)) {
      team.userRole = EUserRole.Monitor;
    }

    // Is the user a user? (Invited but not confirmed)
    if (team.users.some(user => user === userEmail)) {
      team.userRole = EUserRole.Invited;
    }

    return team;
  });

  ctx.status = 200;
  ctx.body = teamSerializer(teams);
});

export default router;
