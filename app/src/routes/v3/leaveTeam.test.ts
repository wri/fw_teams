import request from "supertest";
import { TeamModel, ITeam } from "models/team.model";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import server from "app";

describe("GET /v3/teams/leave/:teamId", () => {
  let teamDocument: Omit<ITeam, "createdAt">;

  afterAll(async () => {
    await TeamModel.remove({});
    server.close();
  });

  beforeEach(() => {
    teamDocument = {
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
  });

  const exec = async () => {
    const team = await new TeamModel(teamDocument).save();

    return request(server).get(`/v3/teams/leave/${team.id}`);
  };

  it("should return 200 status", async () => {
    const res = await exec();

    expect(res.status).toBe(200);
  });
});
