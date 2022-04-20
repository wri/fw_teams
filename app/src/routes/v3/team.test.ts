import request from "supertest";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import server from "app";

const TeamResponse = [
  {
    _id: "626001714b1679004969607c",
    name: "20-04-T13:49",
    __v: 0,
    createdAt: "2022-04-20T12:49:53.521Z",
    confirmedUsers: [],
    layers: [],
    areas: [],
    sentInvitations: [],
    users: [],
    managers: [
      {
        id: "62334dae880445001a46c494",
        email: null
      }
    ]
  }
];

jest.mock("models", () => {
  return {
    __esModule: true,
    TeamModel: jest.fn(() => ({
      find: () => TeamResponse
    }))
  };
});

describe("/v3/teams", () => {
  afterAll(() => {
    server.close();
  });

  const exec = () => {
    return request(server).get("/v3/teams");
  };

  it("should return 200 status", async () => {
    const res = await exec();

    expect(res.status).toBe(200);
  });

  it("should return pong", async () => {
    const res = await exec();

    expect(res.body).toBe("test");
  });
});
