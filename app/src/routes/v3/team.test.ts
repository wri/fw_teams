import request from "supertest";
import { TeamModel, ITeam } from "models/team.model";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import server from "app";

interface ITeamResponse extends ITeam {
  id: string;
}

const standardTeamResponse: ITeamResponse = {
  id: "123456",
  name: "test",
  createdAt: "2022-04-22T10:11:57.994Z",
  confirmedUsers: [],
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

jest.mock("models/team.model", () => {
  const originalModule = jest.requireActual("models/team.model");

  return {
    __esModule: true,
    ...originalModule,
    TeamModel: {
      find: jest.fn()
    }
  };
});

describe("/v3/teams", () => {
  let teamDBMockedResponse: ITeamResponse[];

  afterAll(() => {
    server.close();
  });

  beforeEach(() => {
    teamDBMockedResponse = [standardTeamResponse];

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    TeamModel.find.mockImplementation(() => teamDBMockedResponse);
  });

  const exec = () => {
    return request(server).get("/v3/myteams");
  };

  it("should return 200 status", async () => {
    const res = await exec();

    expect(res.status).toBe(200);
  });

  it("should return one entry in the data array", async () => {
    const res = await exec();

    expect(res.body.data.length).toBe(1);
  });

  it("the returned team id should match the one in the DB", async () => {
    const res = await exec();

    expect(res.body.data[0].id).toBe("123456");
  });

  it("should return multiple teams", async () => {
    teamDBMockedResponse = [
      standardTeamResponse,
      { ...standardTeamResponse, id: "234567" },
      { ...standardTeamResponse, id: "345678" }
    ];

    const res = await exec();

    expect(res.body.data.length).toBe(3);
    expect(res.body.data[0].id).toBe("123456");
    expect(res.body.data[1].id).toBe("234567");
    expect(res.body.data[2].id).toBe("345678");
  });
});
