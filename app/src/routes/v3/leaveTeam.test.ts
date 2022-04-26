import request from "supertest";
import { TeamModel, ITeam, ITeamModel } from "models/team.model";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import loggedInUserService from "services/LoggedInUserService";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import server from "app";

type TTeamDocument = Omit<ITeam, "createdAt">;

const standardTeamDocument: TTeamDocument = {
  name: "test",
  confirmedUsers: [
    {
      id: "1234TestAuthUser",
      email: "testAuthUser@test.com"
    }
  ],
  layers: [],
  areas: [],
  sentInvitations: [],
  users: [],
  managers: [
    {
      id: "1234",
      email: "user@test.com"
    }
  ]
};

describe("GET /v3/teams/leave/:teamId", () => {
  let teamDocument: TTeamDocument, team: ITeamModel;

  afterAll(async () => {
    await TeamModel.remove({});
    server.close();
  });

  beforeEach(() => {
    teamDocument = standardTeamDocument;
  });

  const exec = async (teamId?: string) => {
    team = await new TeamModel(teamDocument).save();

    return request(server).get(`/v3/teams/leave/${teamId || team.id}`);
  };

  it("should return 200 status", async () => {
    const res = await exec();

    expect(res.status).toBe(200);
  });

  // should return 403 when user is not authorised

  it("should return the updated team", async () => {
    const res = await exec();

    expect(res.body.data.id).toBe(team.id);
    expect(res.body.data.type).toBe("team");
  });

  it("should remove 1234TestAuthUser from confirmed users array in the DB", async () => {
    await exec();

    const updatedTeam = await TeamModel.findById(team._id);

    expect(updatedTeam.confirmedUsers.length).toBe(0);
  });

  it("should return 404 when team isn't found", async () => {
    const res = await exec("1234NotFound");

    expect(res.status).toBe(404);
  });

  it("should return 400, when authorised user is the only manager of the team", async () => {
    teamDocument = {
      ...standardTeamDocument,
      managers: [
        {
          id: "1234TestAuthUser",
          email: "testAuthUser@test.com"
        }
      ],
      confirmedUsers: [
        {
          id: "1234",
          email: "user@test.com"
        }
      ]
    };

    const res = await exec();

    expect(res.status).toBe(400);
    expect(res.body.errors[0].detail).toContain("only manager");
  });

  it("should return 400, when the authorised user isn't a member of the team", async () => {
    teamDocument = {
      ...standardTeamDocument,
      managers: [
        {
          id: "1234",
          email: "user@test.com"
        }
      ],
      confirmedUsers: [
        {
          id: "1234",
          email: "user@test.com"
        }
      ]
    };

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it("should remove 1234TestAuthUser from managers array in the DB, when authorised user is not the only manager of the team", async () => {
    teamDocument = {
      ...standardTeamDocument,
      managers: [
        {
          id: "1234TestAuthUser",
          email: "testAuthUser@test.com"
        },
        {
          id: "1234",
          email: "user@test.com"
        }
      ],
      confirmedUsers: [
        {
          id: "1234",
          email: "user@test.com"
        }
      ]
    };

    await exec();

    const updatedTeam = await TeamModel.findById(team._id);

    expect(updatedTeam.managers.length).toBe(1);
    expect(updatedTeam.managers[0].id).not.toBe("1234TestAuthUser");
  });
});