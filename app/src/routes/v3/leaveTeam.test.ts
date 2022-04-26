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
    },
    {
      id: "1234",
      email: "user@test.com"
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

describe("PATCH /v3/teams/leave/:teamId", () => {
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

    return request(server)
      .patch(`/v3/teams/leave/${teamId || team.id}`)
      .send();
  };

  it("should return 200 status", async () => {
    const res = await exec();

    expect(res.status).toBe(200);
  });

  it("should return 404 when team isn't found", async () => {
    const res = await exec("1234NotFound");

    expect(res.status).toBe(404);
  });

  // ToDo: should return 403 when user is not authorised

  it("should return the updated team", async () => {
    const res = await exec();

    expect(res.body.data.id).toBe(team.id);
    expect(res.body.data.type).toBe("team");
    expect(res.body.data.attributes.confirmedUsers).toEqual(
      expect.not.arrayContaining([
        {
          id: "1234TestAuthUser",
          email: "testAuthUser@test.com"
        }
      ])
    );
  });

  it("should remove 1234TestAuthUser from confirmed users array in the DB", async () => {
    await exec();

    const updatedTeam = await TeamModel.findById(team._id);

    expect(updatedTeam.confirmedUsers).toEqual(
      expect.not.arrayContaining([
        {
          id: "1234TestAuthUser",
          email: "testAuthUser@test.com"
        }
      ])
    );
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

    expect(updatedTeam.managers).toEqual(
      expect.not.arrayContaining([
        {
          id: "1234TestAuthUser",
          email: "testAuthUser@test.com"
        }
      ])
    );
  });
});

describe("PATCH /v3/teams/reject/:teamId", () => {
  let teamDocument: TTeamDocument, team: ITeamModel;

  afterAll(async () => {
    await TeamModel.remove({});
    server.close();
  });

  beforeEach(() => {
    teamDocument = {
      ...standardTeamDocument,
      confirmedUsers: [],
      users: ["testAuthUser@test.com", "user@test.com"]
    };
  });

  const exec = async (teamId?: string) => {
    team = await new TeamModel(teamDocument).save();

    return request(server)
      .patch(`/v3/teams/reject/${teamId || team.id}`)
      .send();
  };

  it("should return 200 status", async () => {
    const res = await exec();

    expect(res.status).toBe(200);
  });

  it("should return the updated team", async () => {
    const res = await exec();

    expect(res.body.data.id).toBe(team.id);
    expect(res.body.data.type).toBe("team");
    expect(res.body.data.attributes.users).toEqual(expect.not.arrayContaining(["tesusertAuthUser@test.com"]));
  });

  it("should return 404 when team isn't found", async () => {
    const res = await exec("1234NotFound");

    expect(res.status).toBe(404);
  });

  it("should remove testAuthUser@test.com from users array in the DB", async () => {
    await exec();

    const updatedTeam = await TeamModel.findById(team._id);

    expect(updatedTeam.users).toEqual(expect.not.arrayContaining(["testAuthUser@test.com"]));
  });

  it("should return 400, if authorised user is not invited to the team", async () => {
    teamDocument = {
      ...standardTeamDocument,
      confirmedUsers: [],
      users: ["user@test.com", "user1@test.com"]
    };

    const res = await exec();

    expect(res.status).toBe(400);
  });
});
