import request from "supertest";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import server from "app";
import mongoose from "mongoose";
import { ITeam, ITeamModel, TeamModel } from "models/team.model";
import { EUserRole, EUserStatus, ITeamUserRelation, TeamUserRelationModel } from "models/teamUserRelation.model";
import { DTOCreateTeam } from "./dto/create-team.input";
import { DTOUpdateTeam } from "./dto/update-team.input";
import nock from "nock";
const config = require("config");

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

    afterAll(async () => {
      await TeamModel.remove({});
      await TeamUserRelationModel.remove({});
    });

    beforeAll(async () => {
      nock(config.get("usersApi.url"))
        .persist()
        .get(`/user/addaddaddaddaddaddaddadd`)
        .reply(200, {
          data: {
            attributes: {
              firstName: "something",
              lastName: "something"
            }
          }
        }
        );
      teams = await TeamModel.insertMany([{ name: "TestTeam1" }, { name: "TestTeam2" }, { name: "TestTeam3" }]);
    });

    beforeEach(async () => {
      await TeamUserRelationModel.remove({});

      teamUserDocuments = [
        {
          teamId: new ObjectId(teams[0]._id),
          email: "testAuthUser@test.com",
          role: EUserRole.Manager,
          status: EUserStatus.Invited
        },
        {
          teamId: new ObjectId(teams[1]._id),
          userId: new ObjectId("addaddaddaddaddaddaddadd"),
          email: "testAuthUser@test.com",
          role: EUserRole.Monitor,
          status: EUserStatus.Confirmed
        },
        {
          teamId: new ObjectId(teams[2]._id),
          email: "testAuthUser@test.com",
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
          email: "notMe@test.com"
        },
        {
          ...teamUserDocuments[1],
          email: "notMe@test.com"
        },
        {
          ...teamUserDocuments[2],
          email: "notMe@test.com"
        }
      ];

      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(0);
    });
  });

  describe("GET /v3/teams/:teamId", () => {
    let team: ITeamModel, teamDocument: Omit<ITeam, "createdAt">, teamUserDocument: ITeamUserRelation;

    afterEach(async () => {
      await TeamModel.remove({});
      await TeamUserRelationModel.remove({});
    });

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
    let teams: ITeamModel[], teamsDocument: Omit<ITeam, "createdAt">[];

    afterEach(async () => {
      await TeamModel.remove({});
      await TeamUserRelationModel.remove({});
    });

    beforeEach(() => {
      teamsDocument = [
        {
          name: "TestTeam1"
        },
        {
          name: "TestTeam2"
        },
        {
          name: "TestTeam3"
        }
      ];
    });

    const exec = async (userId = "addaddaddaddaddaddaddadd") => {
      teams = await TeamModel.insertMany(teamsDocument);

      await TeamUserRelationModel.insertMany([
        {
          userId: new ObjectId("addaddaddaddaddaddaddadd"),
          teamId: new ObjectId(teams[0].id),
          email: "admin@user.com",
          role: EUserRole.Administrator,
          status: EUserStatus.Confirmed
        },
        {
          userId: new ObjectId("addaddaddaddaddaddaddadd"),
          teamId: new ObjectId(teams[2].id),
          email: "admin@user.com",
          role: EUserRole.Monitor,
          status: EUserStatus.Confirmed
        }
      ]);

      return request(server).get(`/v3/teams/user/${userId}`);
    };

    it("should return 200 for happy case", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
    });

    // ToDo: should return 401 when user is not authorised

    it("should return an array of teams", async () => {
      const res = await exec();

      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0].type).toBe("team");
    });

    it("should return only the teams the userId is a part of", async () => {
      const res = await exec();

      expect(res.body.data.length).toBe(2);
      expect(res.body.data[0].id).toEqual(teams[0].id);
      expect(res.body.data[1].id).toEqual(teams[2].id);
    });

    it("should return the role which the userId has as an attribute on each team", async () => {
      const res = await exec();
      expect(res.body.data[0].attributes.userRole).toEqual(EUserRole.Administrator);
      expect(res.body.data[1].attributes.userRole).toEqual(EUserRole.Monitor);
    });

    it("should return an empty array when userId is not part of any team", async () => {
      const res = await exec(new ObjectId());

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(0);
    });
  });

  describe("POST /v3/teams", () => {
    let payload: DTOCreateTeam & { wrongProperty?: string };

    afterEach(async () => {
      await TeamModel.remove({});
      await TeamUserRelationModel.remove({});
    });

    beforeEach(() => {
      payload = {
        name: "TestTeam"
      };
    });

    const exec = () => {
      return request(server).post("/v3/teams").send(payload);
    };

    it("should return 200 for happy case", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
    });

    // ToDo: should return 401 when user is not authorised

    it("should return 400 is body validation fails", async () => {
      payload.wrongProperty = "qwerty";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return the newly created team", async () => {
      const res = await exec();

      const team = await TeamModel.findOne({ name: "TestTeam" });

      expect(res.body.data).toEqual(
        expect.objectContaining({
          type: "team",
          id: team.id
        })
      );
    });

    it("should add a team-user relation for the authorised user", async () => {
      const res = await exec();

      const teamId = res.body.data.id;

      const teamUserRelation = await TeamUserRelationModel.count({
        teamId,
        userId: new ObjectId("addaddaddaddaddaddaddadd")
      });

      expect(teamUserRelation).toBe(1);
    });

    it("should assign the team-user relation the authorised user's email and id", async () => {
      const res = await exec();

      const teamId = res.body.data.id;

      const teamUserRelation = await TeamUserRelationModel.findOne({
        teamId,
        userId: new ObjectId("addaddaddaddaddaddaddadd")
      });

      expect(teamUserRelation.email).toEqual("testAuthUser@test.com");
      expect(teamUserRelation.userId?.toString()).toEqual("addaddaddaddaddaddaddadd");
    });

    it("should assign the team-user relation the 'administrator' role", async () => {
      const res = await exec();

      const teamId = res.body.data.id;

      const teamUserRelation = await TeamUserRelationModel.findOne({
        teamId,
        userId: new ObjectId("addaddaddaddaddaddaddadd")
      });

      expect(teamUserRelation.role).toEqual(EUserRole.Administrator);
    });

    it("should assign the team-user relation the 'confirmed' status", async () => {
      const res = await exec();

      const teamId = res.body.data.id;

      const teamUserRelation = await TeamUserRelationModel.findOne({
        teamId,
        userId: new ObjectId("addaddaddaddaddaddaddadd")
      });

      expect(teamUserRelation.status).toEqual(EUserStatus.Confirmed);
    });
  });

  describe("PATCH /v3/teams/:teamId", () => {
    let teamDocument: Omit<ITeam, "createdAt">,
      team: ITeamModel,
      teamUserDocument: ITeamUserRelation,
      payload: DTOUpdateTeam & { wrongProperty?: string };

    afterEach(async () => {
      await TeamModel.remove({});
      await TeamUserRelationModel.remove({});
    });

    beforeEach(async () => {
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

      payload = {
        name: "UpdatedTeamName"
      };
    });

    const exec = async (teamId?: string) => {
      team = await new TeamModel(teamDocument).save();

      await new TeamUserRelationModel({
        ...teamUserDocument,
        teamId: new ObjectId(team._id)
      }).save();

      return request(server)
        .patch(`/v3/teams/${teamId || team.id}`)
        .send(payload);
    };

    it("should return 200 for happy case", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
    });

    it("should return 200 when user is a manager of the team", async () => {
      teamUserDocument = {
        ...teamUserDocument,
        role: EUserRole.Manager
      };

      const res = await exec();

      expect(res.status).toBe(200);
    });

    // ToDo: should return 401 when user is not authorised

    it("should return 400 is body validation fails", async () => {
      payload.wrongProperty = "qwerty";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 401 when user is a monitor of the team", async () => {
      teamUserDocument = {
        ...teamUserDocument,
        role: EUserRole.Monitor
      };

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 401 when user is not part of the team", async () => {
      teamUserDocument = {
        ...teamUserDocument,
        userId: new ObjectId()
      };

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return the updated team", async () => {
      const res = await exec();

      expect(res.body.data).toEqual(
        expect.objectContaining({
          type: "team",
          id: team.id,
          attributes: expect.objectContaining({
            name: "UpdatedTeamName"
          })
        })
      );
    });

    it("should change the team's name in the database", async () => {
      await exec();

      const updatedTeam = await TeamModel.findById(team._id);

      expect(updatedTeam.name).toEqual("UpdatedTeamName");
    });

    it("should return 404 when the teamId can't be found", async () => {
      const res = await exec(new ObjectId());

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /v3/teams/:teamId", () => {
    let teamDocument: Omit<ITeam, "createdAt">, team: ITeamModel, teamUserDocument: ITeamUserRelation;

    beforeEach(async () => {
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

      await TeamUserRelationModel.insertMany([
        {
          ...teamUserDocument,
          teamId: new ObjectId(team._id)
        },
        {
          ...teamUserDocument,
          userId: new ObjectId(),
          role: EUserRole.Monitor,
          teamId: new ObjectId(team._id)
        }
      ]);

      return request(server).delete(`/v3/teams/${teamId || team.id}`);
    };

    it("should return 200 for happy case", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
    });

    it("should return an empty response", async () => {
      const res = await exec();

      expect(res.body).toEqual({});
    });

    // ToDo: should return 401 when user is not authorised

    it("should return 401 when user is a manager of the team", async () => {
      teamUserDocument = {
        ...teamUserDocument,
        role: EUserRole.Manager
      };

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 401 when user is a monitor of the team", async () => {
      teamUserDocument = {
        ...teamUserDocument,
        role: EUserRole.Monitor
      };

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 401 when user is not a member of the team", async () => {
      teamUserDocument = {
        ...teamUserDocument,
        userId: new ObjectId()
      };

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should remove the team in the database", async () => {
      await exec();

      const deletedTeam = await TeamModel.findById(team._id);

      expect(deletedTeam).toBeNull();
    });

    it("should return all team-user relations from the database", async () => {
      await exec();

      const deletedTeam = await TeamUserRelationModel.find({
        teamId: team._id
      });

      expect(deletedTeam.length).toBe(0);
    });

    it("should return 404 when the teamId can't be found", async () => {
      const res = await exec(new ObjectId());

      expect(res.status).toBe(404);
    });
  });
});
