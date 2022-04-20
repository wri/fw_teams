import request from "supertest";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import server from "app";

const TeamResponse = [
  {
    id: "1234",
    name: "TestDBResponse",
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
    TeamModel: {
      find: jest.fn(() => TeamResponse)
    }
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

  it("should return one entry in the data array", async () => {
    const res = await exec();

    expect(res.body.data.length).toBe(1);
  });

  it("the returned team id should match the one in the DB", async () => {
    const res = await exec();

    expect(res.body.data[0].id).toBe("1234");
  });
});
