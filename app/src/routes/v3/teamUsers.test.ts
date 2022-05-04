import request from "supertest";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import server from "app";
import mongoose from "mongoose";
import { ITeamModel, TeamModel } from "models/team.model";
import { EUserRole, EUserStatus, ITeamUserRelation, TeamUserRelationModel } from "../../models/teamUserRelation.model";

const { ObjectId } = mongoose.Types;

describe("/teams/:teamId/users", () => {
  describe("GET /v3/teams/:teamId/users", () => {
    let team: ITeamModel, teamAuthUser: ITeamUserRelation, teamUserDocuments: ITeamUserRelation[];

    beforeAll(async () => {
      team = await new TeamModel({ name: "TestTeam" }).save();
    });

    beforeEach(async () => {
      await TeamUserRelationModel.remove({});

      teamAuthUser = {
        teamId: "dynamic",
        userId: new ObjectId("addaddaddaddaddaddaddadd"),
        email: "admin@user.com",
        role: EUserRole.Administrator,
        status: EUserStatus.Confirmed
      };
    });

    const exec = async (teamId?: string) => {
      teamUserDocuments = [
        {
          ...teamAuthUser,
          teamId: new ObjectId(team.id)
        },
        {
          teamId: new ObjectId(team.id),
          userId: new ObjectId(),
          email: "member1@user.com",
          role: EUserRole.Manager,
          status: EUserStatus.Confirmed
        },
        {
          teamId: new ObjectId(),
          userId: new ObjectId(),
          email: "member2@user.com",
          role: EUserRole.Monitor,
          status: EUserStatus.Confirmed
        }
      ];

      await TeamUserRelationModel.insertMany(teamUserDocuments);

      return request(server).get(`/v3/teams/${teamId || team.id}/users`);
    };

    it("should return 200 for happy case", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
    });

    it("should return 200 if the authorised user is a manager", async () => {
      teamAuthUser = {
        ...teamAuthUser,
        role: EUserRole.Manager
      };

      const res = await exec();

      expect(res.status).toBe(200);
    });

    it("should return 200 if the authorised user is a monitor", async () => {
      teamAuthUser = {
        ...teamAuthUser,
        role: EUserRole.Monitor
      };

      const res = await exec();

      expect(res.status).toBe(200);
    });

    it("should return all the users of the team", async () => {
      const res = await exec();

      expect(res.body.data.length).toBe(2);
      expect(res.body.data[0]).toEqual(
        expect.objectContaining({
          type: "teamUser",
          attributes: expect.objectContaining({
            userId: "addaddaddaddaddaddaddadd"
          })
        })
      );
      expect(res.body.data[1]).toEqual(
        expect.objectContaining({
          type: "teamUser",
          attributes: expect.objectContaining({
            userId: teamUserDocuments[1].userId.toString()
          })
        })
      );
    });

    // ToDo: should return 401 when user is not authorised

    it("should return 401 if the authorised user has left the team", async () => {
      teamAuthUser = {
        ...teamAuthUser,
        role: EUserRole.Left
      };

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 401 if the authorised user isn't part of the team", async () => {
      teamAuthUser = {
        ...teamAuthUser,
        userId: new ObjectId()
      };

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return the 'status' attribute is the authorised user is an administrator of the team", async () => {
      const res = await exec();

      expect(res.body.data[0]).toEqual(
        expect.objectContaining({
          type: "teamUser",
          attributes: expect.objectContaining({
            status: expect.any(String)
          })
        })
      );
    });

    it("should return the 'status' attribute is the authorised user is a manager of the team", async () => {
      teamAuthUser = {
        ...teamAuthUser,
        role: EUserRole.Manager
      };

      const res = await exec();

      expect(res.body.data[0]).toEqual(
        expect.objectContaining({
          type: "teamUser",
          attributes: expect.objectContaining({
            status: expect.any(String)
          })
        })
      );
    });

    it("should not return the 'status' attribute is the authorised user is a monitor of the team", async () => {
      teamAuthUser = {
        ...teamAuthUser,
        role: EUserRole.Monitor
      };

      const res = await exec();

      expect(res.body.data[0]).toEqual(
        expect.objectContaining({
          type: "teamUser",
          attributes: expect.not.objectContaining({
            status: expect.any(String)
          })
        })
      );
    });

    // TODO: it("should return 404 if the team id isn't found", async () => {
    //   const res = await exec(new ObjectId());
    //
    //   expect(res.status).toBe(404);
    // });
  });

  describe("POST /v3/teams/:teamId/users", () => {
    // should return 200 for happy case
    // should return 200 when the authorised user is a manager of the team
    // should return the newly added users
    // should add the team-user relations in the database
    // should assign each team-user relation their correct email
    // should assign each team-user relation their correct role
    // should assign each team-user relation the 'invited' status
    // ToDo: should return 401 when user is not authorised
    // ToDo: should return 400 when the body fails validation
    // should return 401 when the authorised user is a monitor of the team
    // should return 401 when the authorised user is not a member of the team
    // should return 400 if attempting to add duplicate members to the team
    // should return 404 if the team id isn't found
    // ToDo: Tests for "Send Invitations 'userEmails'"
  });

  describe("PATCH /v3/teams/:teamId/users", () => {
    // should return 200 for happy case
    // should return 200 when the authorised user is a manager of the team
    // should return the updated users
    // should update the team-user relations in the database
    // should assign each team-user relation their updated role
    // ToDo: should return 401 when user is not authorised
    // ToDo: should return 400 when the body fails validation
    // should return 401 when the authorised user is a monitor of the team
    // should return 401 when the authorised user is not a member of the team
    // should return 401 if attempting to set a user's role to 'administrator'
    // should return 404 if a user isn't found on the team
    // should return 404 if the team id isn't found
  });

  describe("PATCH /v3/teams/:teamId/users/:userId/accept", () => {
    // should return 200 for happy case
    // should return the updated user
    // should set the user's id as the authorised user's id in the database
    // should set the user's status as 'confirmed' in the database
    // ToDo: should return 401 when user is not authorised
    // should return 401 if the path's userId does not match the authorised user's id
    // should return 404 if the team id isn't found
    // should return 404 if a team-user relation isn't found
  });

  describe("PATCH /v3/teams/:teamId/users/:userId/decline", () => {
    // should return 200 for happy case
    // should return the updated user
    // should set the user's status as 'declined' in the database
    // ToDo: should return 401 when user is not authorised
    // should return 401 if the path's userId does not match the authorised user's id
    // should return 404 if the team id isn't found
    // should return 404 if a team-user relation isn't found
  });

  describe("PATCH /v3/teams/:teamId/users/:userId/leave", () => {
    // should return 200 for happy case
    // should return the updated user
    // should set the user's status as 'left' in the database
    // ToDo: should return 401 when user is not authorised
    // should return 401 if the path's userId does not match the authorised user's id
    // should return 400 if the 'administrator' is trying to leave the team
    // should return 404 if the team id isn't found
    // should return 404 if a team-user relation isn't found
  });
});
