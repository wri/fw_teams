import Router from "koa-router";
import { TeamModel, EUserRole } from "models/team.model";
import { authMiddleware } from "middlewares";
import teamSerializer from "serializers/teamWithUserRole.serializer";

type TQuery = {
  loggedUser: string;
  userRole?: string;
};

const router = new Router();

// GET /v3/myteams
router.get("/myteams", authMiddleware, async ctx => {
  const query = <TQuery>ctx.request.query;
  const { id: userId, email: userEmail } = JSON.parse(query.loggedUser);

  const { userRole = "manager,monitor,invitations" } = query;
  const userRoles = userRole.split(",");

  const orFilter: any[] = [];
  userRoles.forEach(filter => {
    switch (filter) {
      case "manager":
        orFilter.push({ "managers.id": userId });
        break;
      case "monitor":
        orFilter.push({ "confirmedUsers.id": userId });
        break;
      case "invitations":
        orFilter.push({ users: userEmail });
        break;
    }
  });

  let teams = await TeamModel.find({
    $or: orFilter
  });

  teams = teams.map(team => {
    // Find the role the current user has for this team
    // team.userRole = EUserRole.Manager; ToDO
    return team;
  });

  ctx.body = teamSerializer(teams);
});

export default router;
