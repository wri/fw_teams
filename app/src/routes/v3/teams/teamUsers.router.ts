import Router from "koa-router";
import { authMiddleware, isAdminOrManager, isUser, validateObjectId, validatorMiddleware } from "middlewares";
import createTeamUsersInput from "./dto/create-team-users.input";
import updateTeamUsersInput from "./dto/update-team-user.input";
import {
  EUserRole,
  EUserStatus,
  ITeamUserRelation,
  ITeamUserRelationModel,
  TeamUserRelationModel
} from "models/teamUserRelation.model";
import { Request } from "koa";
import serializeTeamUser from "serializers/teamUserRelation.serializer";
import TeamUserRelationService from "services/teamUserRelation.service";

const router = new Router({
  prefix: "/:teamId/users"
});

type TRequest = {
  query: any;
  body: {
    loggedUser: any;
    users: ITeamUserRelation[];
    role: ITeamUserRelation["role"];
  }; // ToDo: request body
} & Request;

// GET /v3/teams/:teamId/users
// Return all users on a team
router.get("/", authMiddleware, validateObjectId("teamId"), isUser, async ctx => {
  const { teamId } = ctx.params;
  const { query } = <TRequest>ctx.request;
  const { id: userId } = JSON.parse(query.loggedUser); // ToDo: loggedUser Type

  const teamUserRelation = await TeamUserRelationService.findTeamUser(teamId, userId);

  let users: ITeamUserRelationModel[] = [];
  if (teamUserRelation.role === EUserRole.Administrator || teamUserRelation.role === EUserRole.Manager) {
    users = await TeamUserRelationService.findAllUsersOnTeam(teamId);
  } else {
    users = await TeamUserRelationService.findAllUsersOnTeam(teamId).select("-status");
  }

  ctx.body = serializeTeamUser(users);
});

// POST /v3/teams/:teamId/users
// Add users to team, and send invitations
// Only manager or admin can access this router
router.post(
  "/",
  authMiddleware,
  validateObjectId("teamId"),
  validatorMiddleware(createTeamUsersInput),
  isAdminOrManager,
  async ctx => {
    const { teamId } = ctx.params;
    const {
      body: { users }
    } = <TRequest>ctx.request;

    const userEmails: string[] = [];
    for (let i = 0; i < users.length; i++) {
      const userEmail = users[i].email;

      if (!userEmails.includes(userEmail)) {
        userEmails.push(userEmail);
      } else {
        ctx.status = 400;
        throw new Error("Can't have duplicate users on a team");
      }
    }

    // Make sure no duplicate users are added
    const duplicateUsers = await TeamUserRelationModel.count({ teamId, email: { $in: userEmails } });
    if (duplicateUsers > 0) {
      ctx.status = 400;
      throw new Error("Can't have duplicate users on a team");
    }

    const userDocumentsToAdd = users.map<ITeamUserRelation>(user => {
      return {
        teamId,
        email: user.email,
        role: user.role,
        status: EUserStatus.Invited
      };
    });

    const userDocuments = await TeamUserRelationService.createMany(userDocumentsToAdd);

    // ToDo: Send Invitations "userEmails"

    ctx.body = serializeTeamUser(userDocuments);
  }
);

// PATCH /v3/teams/:teamId/users/:teamUserId
// Update a user's role on a team
// body: { role }
// Only manager or admin can access this router
router.patch(
  "/:teamUserId",
  authMiddleware,
  validateObjectId(["teamId", "teamUserId"]),
  validatorMiddleware(updateTeamUsersInput),
  isAdminOrManager,
  async ctx => {
    const { teamUserId } = ctx.params;
    const { body } = <TRequest>ctx.request;

    if (body.role === EUserRole.Administrator) {
      ctx.status = 401;
      throw new Error("Can't set user as administrator");
    }

    const teamUser = await TeamUserRelationService.findById(teamUserId);

    if (teamUser.role === EUserRole.Administrator) {
      ctx.status = 400;
      throw new Error("Can't change the administrator's role");
    }

    teamUser.role = body.role;

    await teamUser.save();

    ctx.body = serializeTeamUser(teamUser);
  }
);

// PATCH /v3/teams/:teamId/users/:userId/accept
// Update user's role to "confirmed"
// Only if JWT's userid match the one in the URL
router.patch("/:userId/accept", authMiddleware, validateObjectId(["teamId", "userId"]), async ctx => {
  const { teamId, userId } = ctx.params;
  const { body } = <TRequest>ctx.request;
  const { id: loggedUserId, email: loggedEmail } = body.loggedUser; // ToDo: loggedUser Type

  if (userId !== loggedUserId) {
    ctx.status = 401;
    throw new Error("Login with the correct user");
  }

  const updatedUser = await TeamUserRelationService.update(teamId, loggedEmail, {
    userId: loggedUserId,
    status: EUserStatus.Confirmed
  });

  ctx.body = serializeTeamUser(updatedUser);
});

// PATCH /v3/teams/:teamId/users/:userId/decline
// Update user's role to "declined"
// Only if JWT's userid match the one in the URL
router.patch("/:userId/decline", authMiddleware, validateObjectId(["teamId", "userId"]), async ctx => {
  const { teamId, userId } = ctx.params;
  const { body } = <TRequest>ctx.request;
  const { id: loggedUserId, email: loggedEmail } = body.loggedUser; // ToDo: loggedUser Type

  if (userId !== loggedUserId) {
    ctx.status = 401;
    throw new Error("Log in with the correct user");
  }

  const updatedUser = await TeamUserRelationService.update(teamId, loggedEmail, {
    status: EUserStatus.Declined
  });

  ctx.body = serializeTeamUser(updatedUser);
});

// PATCH /v3/teams/:teamId/users/:userId/leave
// Update user's role to "left"
// Only if JWT's userid match the one in the URL
// Unless auth user is admin
router.patch("/:userId/leave", authMiddleware, validateObjectId(["teamId", "userId"]), async ctx => {
  const { teamId, userId } = ctx.params;
  const { body } = <TRequest>ctx.request;
  const { id: loggedUserId, email: loggedEmail } = body.loggedUser; // ToDo: loggedUser Type

  if (userId !== loggedUserId) {
    ctx.status = 401;
    throw new Error("Log in with the correct user");
  }

  const teamUserRelation = await TeamUserRelationService.findTeamUser(teamId, userId);

  if (teamUserRelation && teamUserRelation.role === EUserRole.Administrator) {
    ctx.status = 400;
    throw new Error("Administrator can't leave team");
  }

  const updatedUser = await TeamUserRelationService.update(teamId, loggedEmail, {
    role: EUserRole.Left
  });

  ctx.body = serializeTeamUser(updatedUser);
});

export default router;
