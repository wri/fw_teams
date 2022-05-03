import request from "supertest";
import { Legacy_teamModel, ITeam } from "models/legacy_team.model";
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
      id: "addaddaddaddaddaddaddadd",
      email: "testAuthUser@test.com"
    }
  ]
};

jest.mock("models/legacy_team.model", () => {
  const originalModule = jest.requireActual("models/legacy_team.model");

  return {
    __esModule: true,
    ...originalModule,
    Legacy_teamModel: {
      ...originalModule.Legacy_teamModel,
      find: jest.fn()
    }
  };
});

describe("GET /v3/myteams", () => {
  let teamDBMockedResponse: ITeamResponse[];

  afterAll(() => {
    server.close();
  });

  beforeEach(() => {
    teamDBMockedResponse = [standardTeamResponse];

    (Legacy_teamModel.find as jest.Mock).mockReset();
    (Legacy_teamModel.find as jest.Mock).mockImplementation(() => teamDBMockedResponse);
  });

  const exec = (query = "") => {
    return request(server).get(`/v3/myteams${query}`);
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

  it("should filter the database by 'manager', 'monitor' and 'invited' by default", async () => {
    await exec();

    expect(Legacy_teamModel.find).toHaveBeenLastCalledWith({
      $or: [
        { "managers.id": "addaddaddaddaddaddaddadd" },
        { "confirmedUsers.id": "addaddaddaddaddaddaddadd" },
        { users: "testAuthUser@test.com" }
      ]
    });
  });

  it("should filter the database by 'manager' if query string is '?userRole=manager", async () => {
    await exec("?userRole=manager");

    expect(Legacy_teamModel.find).toHaveBeenLastCalledWith({
      $or: [{ "managers.id": "addaddaddaddaddaddaddadd" }]
    });
  });

  it("should filter the database by 'monitor' and 'invited' if query string is '?userRole=monitor,invited", async () => {
    await exec("?userRole=monitor,invited");

    expect(Legacy_teamModel.find).toHaveBeenLastCalledWith({
      $or: [{ "confirmedUsers.id": "addaddaddaddaddaddaddadd" }, { users: "testAuthUser@test.com" }]
    });
  });

  it("should return 400 error if query string is wrong", async () => {
    const res = await exec("?userRole=NotCorrect");

    expect(res.status).toBe(400);
  });

  it("should mark the standard response as 'userRole: manager'", async () => {
    const res = await exec();

    expect(res.body.data[0].attributes.userRole).toBe("manager");
  });

  it("should mark a response as 'userRole: monitor' if the logged in user is a monitor of the team", async () => {
    teamDBMockedResponse = [
      {
        ...standardTeamResponse,
        managers: [
          {
            id: "1234NotLoggedInUser",
            email: "user@test.com"
          }
        ],
        confirmedUsers: [
          {
            id: "addaddaddaddaddaddaddadd",
            email: "testAuthUser@test.com"
          }
        ]
      }
    ];

    const res = await exec();

    expect(res.body.data[0].attributes.userRole).toBe("monitor");
  });

  it("should mark a response as 'userRole: invited' if the logged in user is invited to the team", async () => {
    teamDBMockedResponse = [
      {
        ...standardTeamResponse,
        managers: [
          {
            id: "1234NotLoggedInUser",
            email: "user@test.com"
          }
        ],
        users: ["testAuthUser@test.com"]
      }
    ];

    const res = await exec();

    expect(res.body.data[0].attributes.userRole).toBe("invited");
  });

  it("should return multiple teams", async () => {
    teamDBMockedResponse = [
      standardTeamResponse,
      {
        ...standardTeamResponse,
        id: "234567",
        managers: [
          {
            id: "1234NotLoggedInUser",
            email: "user@test.com"
          }
        ],
        confirmedUsers: [
          {
            id: "addaddaddaddaddaddaddadd",
            email: "testAuthUser@test.com"
          }
        ]
      },
      {
        ...standardTeamResponse,
        id: "345678",
        managers: [
          {
            id: "1234NotLoggedInUser",
            email: "user@test.com"
          }
        ],
        users: ["testAuthUser@test.com"]
      }
    ];

    const res = await exec();

    expect(res.body.data.length).toBe(3);
    expect(res.body.data[0].id).toBe("123456");
    expect(res.body.data[1].id).toBe("234567");
    expect(res.body.data[2].id).toBe("345678");
    expect(res.body.data[0].attributes.userRole).toBe("manager");
    expect(res.body.data[1].attributes.userRole).toBe("monitor");
    expect(res.body.data[2].attributes.userRole).toBe("invited");
  });
});
