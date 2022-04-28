import Router from "koa-router";
import { authMiddleware, isAdminOrManager } from "middlewares";
import { TeamModel } from "models/team.model";
import { TeamUserRelationModel, ITeamUserRelation, EUserRole, EUserStatus } from "models/teamUserRelation.model";
import { Request } from "koa";

const router = new Router({
  prefix: "/teams/:teamId/users"
});

type TRequest = {
  body: {
    loggedUser: any;
    users: ITeamUserRelation[];
  }; // ToDo: request body
} & Request;

// POST /v3/teams/:teamId/users
// Add users to team, and send invitations
// body: { users: [ { email, role } ] }
// Only manager or admin can access this router
// ToDo: add middleware for managers or admins
router.post("/", authMiddleware, isAdminOrManager, async ctx => {
  const { teamId } = ctx.params;
  const {
    body: { users }
  } = <TRequest>ctx.request;

  const userEmails = users.map(user => user.email);

  // Check for the team
  const team = await TeamModel.count({ _id: teamId });
  if (team === 0) {
    ctx.status = 404;
    throw new Error("Team not found");
  }

  // Make sure no duplicate users are added
  const duplicateUsers = await TeamUserRelationModel.count({ teamId, email: { $in: userEmails } });
  if (duplicateUsers > 0) {
    ctx.status = 400;
    throw new Error("Can't have duplicate users on a team");
  }

  const userDocumentsToAdd = users.map(user => {
    return {
      teamId,
      email: user.email,
      role: user.role,
      status: EUserStatus.Invited
    };
  });

  const userDocuments = await TeamUserRelationModel.insertMany(userDocumentsToAdd);

  // ToDo: Send Invitations "userEmails"

  ctx.body = userDocuments;
});

// PATCH /v3/teams/:teamId/users
// Update a user's role on a team
// body: { users: [{ userId, role }] }
// Only manager or admin can access this router
router.patch("/", authMiddleware, isAdminOrManager, async ctx => {
  const { teamId } = ctx.params;
  const {
    body: { users }
  } = <TRequest>ctx.request;

  // Check for the team
  const team = await TeamModel.count({ _id: teamId });
  if (team === 0) {
    ctx.status = 404;
    throw new Error("Team not found");
  }

  const updatedUsers: ITeamUserRelation[] = [];
  for (let i = 0; i < users.length; i++) {
    const user = users[i];

    if (user.role === EUserRole.Administrator) {
      ctx.status = 401;
      throw new Error("Can't set user as administrator");
    }

    const updatedUser = await TeamUserRelationModel.findOneAndUpdate(
      { teamId, userId: user.userId },
      {
        role: user.role
      },
      { new: true }
    );

    if (!updatedUser) {
      ctx.status = 404;
      throw new Error(`User not found with ID: ${user.userId}`);
    }

    updatedUsers.push(updatedUser);
  }

  ctx.body = updatedUsers;
});

// PATCH /v3/teams/:teamId/users/:userId/accept
// Update user's role to "confirmed"
// Only if JWT's userid match the one in the URL
router.patch("/:userId/accept", authMiddleware, async ctx => {
  const { teamId, userId } = ctx.params;
  const { body } = <TRequest>ctx.request;
  const { id: loggedUserId, email: loggedEmailId } = body.loggedUser; // ToDo: loggedUser Type

  if (userId !== loggedUserId) {
    ctx.status = 401;
    throw new Error("Login with the correct user");
  }

  const updatedUser = await TeamUserRelationModel.findOneAndUpdate(
    { teamId, email: loggedEmailId },
    {
      userId: loggedUserId,
      status: EUserStatus.Confirmed
    },
    { new: true }
  );

  ctx.body = updatedUser;
});

// PATCH /v3/teams/:teamId/users/:userId/decline
// Update user's role to "declined"
// Only if JWT's userid match the one in the URL
router.patch("/:userId/decline", authMiddleware, async ctx => {
  const { teamId, userId } = ctx.params;
  const { body } = <TRequest>ctx.request;
  const { id: loggedUserId, email: loggedEmailId } = body.loggedUser; // ToDo: loggedUser Type

  if (userId !== loggedUserId) {
    ctx.status = 401;
    throw new Error("Log in with the correct user");
  }

  const updatedUser = await TeamUserRelationModel.findOneAndUpdate(
    { teamId, email: loggedEmailId },
    {
      status: EUserStatus.Declined
    },
    { new: true }
  );

  ctx.body = updatedUser;
});

// PATCH /v3/teams/:teamId/users/:userId/leave
// Update user's role to "left"
// Only if JWT's userid match the one in the URL
// Unless auth user is admin
router.patch("/:userId/leave", authMiddleware, async ctx => {
  const { teamId, userId } = ctx.params;
  const { body } = <TRequest>ctx.request;
  const { id: loggedUserId, email: loggedEmailId } = body.loggedUser; // ToDo: loggedUser Type

  if (userId !== loggedUserId) {
    ctx.status = 401;
    throw new Error("Log in with the correct user");
  }

  const teamUserRelation = await TeamUserRelationModel.findOne({
    teamId,
    userId
  });

  if (teamUserRelation && teamUserRelation.role === EUserRole.Administrator) {
    ctx.status = 400;
    throw new Error("Administrator can't leave team");
  }

  const updatedUser = await TeamUserRelationModel.findOneAndUpdate(
    { teamId, email: loggedEmailId },
    {
      role: EUserRole.Left
    },
    { new: true }
  );

  ctx.body = updatedUser;
});

export default router;
