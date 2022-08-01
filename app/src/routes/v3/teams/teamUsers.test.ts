import request from "supertest";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import server from "app";
import mongoose from "mongoose";
import { ITeamModel, TeamModel } from "models/team.model";
import {
  EUserRole,
  EUserStatus,
  ITeamUserRelation,
  ITeamUserRelationModel,
  TeamUserRelationModel
} from "models/teamUserRelation.model";
import nock from "nock";
const config = require("config");

const { ObjectId } = mongoose.Types;

describe("/teams/:teamId/users", () => {
  let team: ITeamModel;

  afterAll(async () => {
    await TeamModel.remove({});
    await TeamUserRelationModel.remove({});
  });

  beforeAll(async () => {
    team = await new TeamModel({ name: "TestTeam" }).save();
  });

  describe("GET /v3/teams/:teamId/users", () => {
    let teamAuthUser: ITeamUserRelation, teamUserDocuments: ITeamUserRelation[];

    afterEach(async () => {
      await TeamUserRelationModel.remove({});
    });

    beforeEach(async () => {
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
        });
      teamAuthUser = {
        teamId: new ObjectId(team.id),
        userId: new ObjectId("addaddaddaddaddaddaddadd"),
        email: "admin@user.com",
        role: EUserRole.Administrator,
        status: EUserStatus.Confirmed
      };
    });

    const exec = async (teamId?: string) => {
      teamUserDocuments = [
        teamAuthUser,
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
            userId: teamUserDocuments[1].userId?.toString()
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
    let payload: object, teamAuthUser: ITeamUserRelation; // ToDo: TDO type for POST request

    afterEach(async () => {
      await TeamUserRelationModel.remove({});
    });

    beforeEach(async () => {
      teamAuthUser = {
        teamId: new ObjectId(team.id),
        userId: new ObjectId("addaddaddaddaddaddaddadd"),
        email: "admin@user.com",
        role: EUserRole.Administrator,
        status: EUserStatus.Confirmed
      };

      payload = {
        users: [
          {
            email: "member1@user.com",
            role: "manager"
          },
          {
            email: "member2@user.com",
            role: "monitor"
          }
        ]
      };
    });

    const exec = async (teamId?: string) => {
      await new TeamUserRelationModel(teamAuthUser).save();

      return request(server)
        .post(`/v3/teams/${teamId || team.id}/users`)
        .send(payload);
    };

    it("should return 200 for happy case", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
    });

    it("should return 200 when the authorised user is a manager of the team", async () => {
      teamAuthUser = {
        ...teamAuthUser,
        role: EUserRole.Manager
      };

      const res = await exec();

      expect(res.status).toBe(200);
    });

    it("should return the newly added users", async () => {
      const res = await exec();

      expect(res.body.data.length).toBe(2);
      expect(res.body.data[0]).toEqual(
        expect.objectContaining({
          type: "teamUser",
          attributes: expect.objectContaining({
            teamId: team._id.toString(),
            email: "member1@user.com",
            role: EUserRole.Manager,
            status: EUserStatus.Invited
          })
        })
      );
      expect(res.body.data[1]).toEqual(
        expect.objectContaining({
          type: "teamUser",
          attributes: expect.objectContaining({
            teamId: team._id.toString(),
            email: "member2@user.com",
            role: EUserRole.Monitor,
            status: EUserStatus.Invited
          })
        })
      );
    });

    it("should add the team-user relations in the database with their correct email", async () => {
      await exec();

      const member1 = await TeamUserRelationModel.findOne({
        teamId: new ObjectId(team.id),
        email: "member1@user.com"
      });

      const member2 = await TeamUserRelationModel.findOne({
        teamId: new ObjectId(team.id),
        email: "member2@user.com"
      });

      expect(member1).not.toBeNull();
      expect(member2).not.toBeNull();
    });

    it("should assign each team-user relation their correct role", async () => {
      await exec();

      const member1 = await TeamUserRelationModel.findOne({
        teamId: new ObjectId(team.id),
        email: "member1@user.com"
      });

      const member2 = await TeamUserRelationModel.findOne({
        teamId: new ObjectId(team.id),
        email: "member2@user.com"
      });

      expect(member1.role).toEqual(EUserRole.Manager);
      expect(member2.role).toEqual(EUserRole.Monitor);
    });

    it("should assign each team-user relation the 'invited' status", async () => {
      await exec();

      const member1 = await TeamUserRelationModel.findOne({
        teamId: new ObjectId(team.id),
        email: "member1@user.com"
      });

      const member2 = await TeamUserRelationModel.findOne({
        teamId: new ObjectId(team.id),
        email: "member2@user.com"
      });

      expect(member1.status).toEqual(EUserStatus.Invited);
      expect(member2.status).toEqual(EUserStatus.Invited);
    });

    // ToDo: should return 401 when user is not authorised

    it("should return 400 when the body fails validation", async () => {
      payload = {
        ...payload,
        wrongProperty: "qwerty"
      };

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 401 when the authorised user is a monitor of the team", async () => {
      teamAuthUser = {
        ...teamAuthUser,
        role: EUserRole.Monitor
      };

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 401 when the authorised user is not a member of the team", async () => {
      teamAuthUser = {
        ...teamAuthUser,
        userId: new ObjectId()
      };

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 400 if the body request contains duplicate emails", async () => {
      payload = {
        users: [
          {
            email: "member1@user.com",
            role: "manager"
          },
          {
            email: "member1@user.com",
            role: "monitor"
          }
        ]
      };

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if attempting to add duplicate members to the team", async () => {
      await new TeamUserRelationModel({
        teamId: new ObjectId(team.id),
        email: "member1@user.com",
        role: EUserRole.Manager,
        status: EUserStatus.Invited
      }).save();

      const res = await exec();

      expect(res.status).toBe(400);
    });

    // ToDo: it("should return 404 if the team id isn't found", async () => {
    //   const res = await exec(new ObjectId());
    //
    //   expect(res.status).toBe(404);
    // });

    // ToDo: Tests for "Send Invitations 'userEmails'"
  });

  describe("PATCH /v3/teams/:teamId/users/:teamUserId", () => {
    let teamAuthUser: ITeamUserRelation,
      teamUserDocuments: ITeamUserRelation[],
      teamUserRelations: ITeamUserRelationModel[],
      payload: object;

    afterEach(async () => {
      nock.cleanAll();
      await TeamUserRelationModel.remove({});
    });

    beforeEach(async () => {
      const userId = new ObjectId("addaddaddaddaddaddaddadd");

      teamAuthUser = {
        teamId: new ObjectId(team.id),
        userId,
        email: "admin@user.com",
        role: EUserRole.Administrator,
        status: EUserStatus.Confirmed
      };

      payload = {
        role: EUserRole.Manager
      };
    });

    const exec = async ({ teamId, userToUpdate = 1 }: { teamId?: string; userToUpdate?: 0 | 1 } = {}) => {
      teamUserDocuments = [
        teamAuthUser,
        {
          teamId: new ObjectId(team.id),
          userId: new ObjectId(),
          email: "member1@user.com",
          role: EUserRole.Monitor,
          status: EUserStatus.Confirmed
        }
      ];

      teamUserRelations = await TeamUserRelationModel.insertMany(teamUserDocuments);
      // mock call to user microservice
      nock(config.get("usersApi.url"))
        .persist()
        .get(`/user/${teamUserDocuments[0].userId}`)
        .reply(200, {
          data: {
            attributes: {
              firstName: "FirstName",
              lastName: "LastName"
            }
          }
        });
      nock(config.get("usersApi.url"))
        .persist()
        .get(`/user/${teamUserDocuments[1].userId}`)
        .reply(200, {
          data: {
            attributes: {
              firstName: "FirstName",
              lastName: "LastName"
            }
          }
        });
      return request(server)
        .patch(`/v3/teams/${teamId || team.id}/users/${teamUserRelations[userToUpdate].id}`)
        .send(payload);
    };

    it("should return 200 for happy case", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
    });

    it("should return 200 when the authorised user is a manager of the team", async () => {
      teamAuthUser = {
        ...teamAuthUser,
        role: EUserRole.Manager
      };

      const res = await exec();

      expect(res.status).toBe(200);
    });

    it("should return the updated team-user", async () => {
      const res = await exec();

      expect(res.body.data).toEqual(
        expect.objectContaining({
          type: "teamUser",
          attributes: expect.objectContaining({
            userId: teamUserDocuments[1].userId?.toString(),
            role: EUserRole.Manager
          })
        })
      );
    });

    it("should update the team-user's role in the database", async () => {
      await exec();

      const teamUserRelation = await TeamUserRelationModel.findById(teamUserRelations[1]._id);

      expect(teamUserRelation.role).toEqual(EUserRole.Manager);
    });

    it("should return 400 when attempting to update the team's administrator to a different role", async () => {
      const res = await exec({
        userToUpdate: 0
      });

      expect(res.status).toBe(400);
    });

    // ToDo: should return 401 when user is not authorised

    it("should return 400 when the body fails validation", async () => {
      payload = {
        ...payload,
        wrongProperty: "qwerty"
      };

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 401 when the authorised user is a monitor of the team", async () => {
      teamAuthUser = {
        ...teamAuthUser,
        role: EUserRole.Monitor
      };

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 401 when the authorised user is not a member of the team", async () => {
      teamAuthUser = {
        ...teamAuthUser,
        userId: new ObjectId()
      };

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 400 when attempting to update the team-user's role to administrator", async () => {
      payload = {
        role: EUserRole.Administrator
      };

      const res = await exec();

      expect(res.status).toBe(400);
    });

    // ToDo: should return 404 if the team id isn't found
    // ToDo: should return 404 if a team-user relation isn't found
  });

  describe("DELETE /v3/teams/:teamId/users/:teamUserId", () => {
    let teamUserDocumentAuth: ITeamUserRelation,
      teamUserDocumentToDelete: ITeamUserRelation,
      teamUserModelToDelete: ITeamUserRelationModel;

    afterEach(async () => {
      await TeamUserRelationModel.remove({});
    });

    beforeEach(async () => {
      teamUserDocumentAuth = {
        userId: new ObjectId("addaddaddaddaddaddaddadd"),
        teamId: new ObjectId(team.id),
        email: "testAuthUser@test.com",
        role: EUserRole.Administrator,
        status: EUserStatus.Confirmed
      };

      teamUserDocumentToDelete = {
        userId: new ObjectId(),
        teamId: new ObjectId(team.id),
        email: "user@test.com",
        role: EUserRole.Manager,
        status: EUserStatus.Confirmed
      };
    });

    const exec = async ({ teamId, teamUserId }: { teamId?: string; teamUserId?: string } = {}) => {
      [, teamUserModelToDelete] = await TeamUserRelationModel.insertMany([
        teamUserDocumentAuth,
        teamUserDocumentToDelete
      ]);

      return request(server)
        .delete(`/v3/teams/${teamId || team.id}/users/${teamUserId || teamUserModelToDelete.id}`)
        .send();
    };

    it("should return 200 for happy case", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
    });

    it("should return 200 when authenticated user is a manager of the team", async () => {
      teamUserDocumentAuth = {
        ...teamUserDocumentAuth,
        role: EUserRole.Manager
      };

      const res = await exec();

      expect(res.status).toBe(200);
    });

    it("should return the deleted team-user relation", async () => {
      const res = await exec();

      expect(res.body.data).toEqual(
        expect.objectContaining({
          type: "teamUser",
          id: teamUserModelToDelete.id?.toString(),
          attributes: expect.objectContaining({
            userId: teamUserDocumentToDelete.userId?.toString()
          })
        })
      );
    });

    it("should delete the team-user relation from the database", async () => {
      await exec();

      const deletedTeamUser = await TeamUserRelationModel.findById(teamUserModelToDelete._id);

      expect(deletedTeamUser).toBeNull();
    });

    // ToDo: should return 401 when user is not authorised

    it("should return 400 when attempting to delete the administrator", async () => {
      teamUserDocumentToDelete = {
        ...teamUserDocumentToDelete,
        role: EUserRole.Administrator
      };

      const res = await exec();

      expect(res.status).toBe(400);
    });

    // ToDo: should return 404 if the team id isn't found
    // ToDo: should return 404 if a team-user relation isn't found
  });

  describe("PATCH /v3/teams/:teamId/users/:userId/accept", () => {
    let teamUserDocument: ITeamUserRelation, teamUserModel: ITeamUserRelationModel;

    afterEach(async () => {
      await TeamUserRelationModel.remove({});
    });

    beforeEach(async () => {
      teamUserDocument = {
        teamId: new ObjectId(team.id),
        email: "testAuthUser@test.com",
        role: EUserRole.Manager,
        status: EUserStatus.Invited
      };
    });

    const exec = async ({ teamId, userId = "addaddaddaddaddaddaddadd" }: { teamId?: string; userId?: string } = {}) => {
      teamUserModel = await new TeamUserRelationModel(teamUserDocument).save();

      return request(server)
        .patch(`/v3/teams/${teamId || team.id}/users/${userId}/accept`)
        .send();
    };

    it("should return 200 for happy case", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
    });

    it("should return the updated user", async () => {
      const res = await exec();

      expect(res.body.data).toEqual(
        expect.objectContaining({
          type: "teamUser",
          attributes: expect.objectContaining({
            userId: "addaddaddaddaddaddaddadd",
            status: EUserStatus.Confirmed
          })
        })
      );
    });

    it("should set the user's id as the authorised user's id in the database", async () => {
      await exec();

      const confirmedUser = await TeamUserRelationModel.findById(teamUserModel._id);

      expect(confirmedUser.userId?.toString()).toEqual("addaddaddaddaddaddaddadd");
    });

    it("should set the user's status as 'confirmed' in the database", async () => {
      await exec();

      const confirmedUser = await TeamUserRelationModel.findById(teamUserModel._id);

      expect(confirmedUser.status).toEqual(EUserStatus.Confirmed);
    });

    // ToDo: should return 401 when user is not authorised

    it("should return 401 if the path's userId does not match the authorised user's id", async () => {
      const res = await exec({
        userId: new ObjectId()
      });

      expect(res.status).toBe(401);
    });

    // ToDo: it("should return 404 if the team id isn't found", async () => {
    //   const res = await exec({
    //     teamId: new ObjectId()
    //   });
    //
    //   expect(res.status).toBe(404);
    // });

    // ToDo: it("should return 404 if a team-user relation isn't found", async () => {
    //   teamUserDocument = {
    //     ...teamUserDocument,
    //     email: "notme@user.com"
    //   };
    //
    //   const res = await exec();
    //
    //   expect(res.status).toBe(404);
    // });
  });

  describe("PATCH /v3/teams/:teamId/users/:userId/decline", () => {
    let teamUserDocument: ITeamUserRelation, teamUserModel: ITeamUserRelationModel;

    afterEach(async () => {
      await TeamUserRelationModel.remove({});
    });

    beforeEach(async () => {
      teamUserDocument = {
        teamId: new ObjectId(team.id),
        email: "testAuthUser@test.com",
        role: EUserRole.Manager,
        status: EUserStatus.Invited
      };
    });

    const exec = async ({ teamId, userId = "addaddaddaddaddaddaddadd" }: { teamId?: string; userId?: string } = {}) => {
      teamUserModel = await new TeamUserRelationModel(teamUserDocument).save();

      return request(server)
        .patch(`/v3/teams/${teamId || team.id}/users/${userId}/decline`)
        .send();
    };

    it("should return 200 for happy case", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
    });

    it("should return the updated user", async () => {
      const res = await exec();

      expect(res.body.data).toEqual(
        expect.objectContaining({
          type: "teamUser",
          attributes: expect.objectContaining({
            email: "testAuthUser@test.com",
            status: EUserStatus.Declined
          })
        })
      );
    });

    it("should set the user's status as 'declined' in the database", async () => {
      await exec();

      const confirmedUser = await TeamUserRelationModel.findById(teamUserModel._id);

      expect(confirmedUser.status).toEqual(EUserStatus.Declined);
    });

    // ToDo: should return 401 when user is not authorised

    it("should return 401 if the path's userId does not match the authorised user's id", async () => {
      const res = await exec({
        userId: new ObjectId()
      });

      expect(res.status).toBe(401);
    });

    // ToDo: it("should return 404 if the team id isn't found", async () => {
    //   const res = await exec({
    //     teamId: new ObjectId()
    //   });
    //
    //   expect(res.status).toBe(404);
    // });

    // ToDo: it("should return 404 if a team-user relation isn't found", async () => {
    //   teamUserDocument = {
    //     ...teamUserDocument,
    //     email: "notme@user.com"
    //   };
    //
    //   const res = await exec();
    //
    //   expect(res.status).toBe(404);
    // });
  });

  describe("PATCH /v3/teams/:teamId/users/:userId/leave", () => {
    let teamUserDocument: ITeamUserRelation, teamUserModel: ITeamUserRelationModel;

    afterEach(async () => {
      await TeamUserRelationModel.remove({});
    });

    beforeEach(async () => {
      teamUserDocument = {
        teamId: new ObjectId(team.id),
        userId: new ObjectId("addaddaddaddaddaddaddadd"),
        email: "testAuthUser@test.com",
        role: EUserRole.Monitor,
        status: EUserStatus.Confirmed
      };
    });

    const exec = async ({ teamId, userId = "addaddaddaddaddaddaddadd" }: { teamId?: string; userId?: string } = {}) => {
      teamUserModel = await new TeamUserRelationModel(teamUserDocument).save();

      return request(server)
        .patch(`/v3/teams/${teamId || team.id}/users/${userId}/leave`)
        .send();
    };

    it("should return 200 for happy case", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
    });

    it("should return the updated user", async () => {
      const res = await exec();

      expect(res.body.data).toEqual(
        expect.objectContaining({
          type: "teamUser",
          attributes: expect.objectContaining({
            userId: "addaddaddaddaddaddaddadd",
            role: EUserRole.Left
          })
        })
      );
    });

    it("should set the user's role as 'left' in the database", async () => {
      await exec();

      const confirmedUser = await TeamUserRelationModel.findById(teamUserModel._id);

      expect(confirmedUser.role).toEqual(EUserRole.Left);
    });

    // ToDo: should return 401 when user is not authorised

    it("should return 401 if the path's userId does not match the authorised user's id", async () => {
      const res = await exec({
        userId: new ObjectId()
      });

      expect(res.status).toBe(401);
    });

    it("should return 400 if the 'administrator' is trying to leave the team", async () => {
      teamUserDocument = {
        ...teamUserDocument,
        role: EUserRole.Administrator
      };

      const res = await exec();

      expect(res.status).toBe(400);
    });

    // ToDo: it("should return 404 if the team id isn't found", async () => {
    //   const res = await exec({
    //     teamId: new ObjectId()
    //   });
    //
    //   expect(res.status).toBe(404);
    // });

    // ToDo: it("should return 404 if a team-user relation isn't found", async () => {
    //   teamUserDocument = {
    //     ...teamUserDocument,
    //     email: "notme@user.com"
    //   };
    //
    //   const res = await exec();
    //
    //   expect(res.status).toBe(404);
    // });
  });
});
