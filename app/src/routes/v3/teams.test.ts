import request from "supertest";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import server from "app";
import mongoose from "mongoose";
import { ITeam, ITeamModel, TeamModel } from "models/team.model";
import {
  EUserRole,
  EUserStatus,
  ITeamUserRelation,
  ITeamUserRelationModel,
  TeamUserRelationModel
} from "models/teamUserRelation.model";

const { ObjectId } = mongoose.Types;

describe("/v3/teams", () => {
  afterAll(async () => {
    await TeamModel.remove({});
    await TeamUserRelationModel.remove({});
    await server.close();
  });

  describe("GET /v3/teams/myinvites", () => {
    let teamUserDocuments: ITeamUserRelation[] = [],
      teams: ITeamModel[] = [];

    beforeAll(async () => {
      teams = await TeamModel.insertMany([{ name: "TestTeam1" }, { name: "TestTeam2" }, { name: "TestTeam3" }]);
    });

    beforeEach(async () => {
      await TeamUserRelationModel.remove({});

      teamUserDocuments = [
        {
          teamId: new ObjectId(teams[0]._id),
          userId: new ObjectId("addaddaddaddaddaddaddadd"),
          email: "admin@user.com",
          role: EUserRole.Manager,
          status: EUserStatus.Invited
        },
        {
          teamId: new ObjectId(teams[1]._id),
          userId: new ObjectId("addaddaddaddaddaddaddadd"),
          email: "admin@user.com",
          role: EUserRole.Monitor,
          status: EUserStatus.Confirmed
        },
        {
          teamId: new ObjectId(teams[2]._id),
          userId: new ObjectId("addaddaddaddaddaddaddadd"),
          email: "admin@user.com",
          role: EUserRole.Monitor,
          status: EUserStatus.Invited
        }
      ];
    });

    const exec = async () => {
      await TeamUserRelationModel.insertMany(teamUserDocuments);

      return request(server).get("/v3/teams/myinvites");
    };

    it("should return 200 for happy case", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
    });

    // ToDo "should return 401 when user is not authorised"

    it("should return an array of teams", async () => {
      const res = await exec();

      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0].type).toBe("team");
    });

    it("should return only the teams the authorised user is invited too", async () => {
      const res = await exec();

      expect(res.body.data.length).toBe(2);
      expect(res.body.data[0].id).toEqual(teams[0].id);
      expect(res.body.data[1].id).toEqual(teams[2].id);
    });

    it("should return an empty array when no invites are pending for the authorised user", async () => {
      teamUserDocuments = [
        {
          ...teamUserDocuments[0],
          userId: new ObjectId()
        },
        {
          ...teamUserDocuments[1],
          userId: new ObjectId()
        },
        {
          ...teamUserDocuments[2],
          userId: new ObjectId()
        }
      ];

      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(0);
    });
  });

  describe("GET /v3/teams/:teamId", () => {
    let team: ITeamModel, teamDocument: Omit<ITeam, "createdAt">, teamUserDocument: ITeamUserRelation;

    beforeEach(() => {
      teamDocument = {
        name: "TestTeam"
      };
      teamUserDocument = {
        userId: new ObjectId("addaddaddaddaddaddaddadd"),
        teamId: "dynamic",
        email: "admin@user.com",
        role: EUserRole.Administrator,
        status: EUserStatus.Confirmed
      };
    });

    const exec = async (teamId?: string) => {
      team = await new TeamModel(teamDocument).save();

      await new TeamUserRelationModel({
        ...teamUserDocument,
        teamId: new ObjectId(team._id)
      }).save();

      return request(server).get(`/v3/teams/${teamId || team.id}`);
    };

    it("should return 200 for happy case", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
    });

    // ToDo: should return 401 when user is not authorised

    it("should return 401 when the authorised user is not part of the team", async () => {
      teamUserDocument = {
        ...teamUserDocument,
        userId: new ObjectId()
      };

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return singular team", async () => {
      const res = await exec();

      expect(Array.isArray(res.body.data)).toBe(false);
    });

    it("should return the correct team from the database", async () => {
      const res = await exec();

      expect(res.body.data).toEqual(
        expect.objectContaining({
          type: "team",
          id: team.id
        })
      );
    });

    it("should return 404 when teamId can't be found", async () => {
      const res = await exec(new ObjectId());

      expect(res.status).toBe(404);
    });
  });

  describe("GET /v3/teams/user/:teamId", () => {
    // should return 200 for happy case
    // should return 401 when user is not authorised
    // should return an array of teams
    // should return only the teams the userId is a part of
    // should return the role which the userId has as an attribute on each team
    // should return 404 when userId is not part of any team
  });

  describe("POST /v3/teams", () => {
    // should return 200 for happy case
    // should return 401 when user is not authorised
    // should return the newly created team
    // should add a team-user relation for the authorised user
    // should assign the team-user relation the authorised user's email and id
    // should assign the team-user relation the "administrator" role
    // should assign the team-user relation the "confirmed" status
  });

  describe("PATCH /v3/teams/:teamId", () => {
    // should return 200 for happy case
    // should return 401 when user is not authorised
    // should return 401 when user is not an administrator or manager of the team
    // should return the updated team
    // should change the team's name in the database
    // should return 404 when the teamId can't be found
  });

  describe("DELETE /v3/teams/:teamId", () => {
    // should return 200 for happy case
    // should return 401 when user is not authorised
    // should return 401 when user is not an administrator of the team
    // should return an empty response
    // should remove the team in the database
    // should return all team-user relations from the database
    // should return 404 when the teamId can't be found
  });
});
