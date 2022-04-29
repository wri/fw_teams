// setupFilesAfterEnv: ["./app/src/test/jest/setupTests.ts"]
// See: https://jestjs.io/docs/configuration#setupfilesafterenv-array

const user = {
  id: "addaddaddaddaddaddaddadd",
  email: "testAuthUser@test.com"
};

class LoggedInUserServiceMock {
  async setLoggedInUser(ctx: any) {
    if (["GET", "DELETE"].includes(ctx.request.method.toUpperCase())) {
      ctx.request.query = { ...ctx.request.query, loggedUser: JSON.stringify(user) };
    } else if (["POST", "PATCH", "PUT"].includes(ctx.request.method.toUpperCase())) {
      ctx.request.body.loggedUser = user;
      ctx.request.body.token = ctx.request.header.authorization;
    }
  }
}

jest.mock("services/LoggedInUserService", () => new LoggedInUserServiceMock());
