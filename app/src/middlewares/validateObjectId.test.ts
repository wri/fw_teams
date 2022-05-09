import { validateObjectId as originalValidateObjectId } from "./validateObjectId";
import mongoose from "mongoose";

const { ObjectId } = mongoose.Types;

describe("validate ObjectId middleware", () => {
  const next = jest.fn(() => Promise.resolve());
  let params: object;

  beforeEach(() => {
    next.mockClear();
    params = { teamId: new ObjectId() };
  });

  const validateObjectId = (paramToCheck: string | string[]) => {
    return originalValidateObjectId(paramToCheck) as (ctx: object, mockNext: typeof next) => Promise<void>;
  };

  const exec = async (paramToCheck: string | string[] = "teamId") => validateObjectId(paramToCheck)({ params }, next);

  it("calls next() with a single valid objectId param", async () => {
    await exec();

    expect(next).toHaveBeenCalledTimes(1);
  });

  it("calls next() with an array of valid objectId params", async () => {
    params = { teamId: new ObjectId(), userId: new ObjectId() };

    await exec(["teamId", "userId"]);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it("calls next() when passed a missing param", async () => {
    await exec("missing");

    expect(next).toHaveBeenCalledTimes(1);
  });

  it("calls next() when passed an array of missing params", async () => {
    await exec(["missing", "alsoMissing"]);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it("calls next() when passed an array containing one missing params", async () => {
    await exec(["missing", "teamId"]);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it("throws with a single invalid objectId param", async () => {
    params = { teamId: "invalidId" };

    // Reason for eslint disable: https://jestjs.io/docs/asynchronous#asyncawait
    expect.assertions(2);
    try {
      await exec();
    } catch (e) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(e).toBeDefined();
      // eslint-disable-next-line jest/no-conditional-expect
      expect(next).toHaveBeenCalledTimes(0);
    }
  });

  it("throws with an array containing an invalid objectId param", async () => {
    params = { teamId: "invalidId", userId: new ObjectId() };

    // Reason for eslint disable: https://jestjs.io/docs/asynchronous#asyncawait
    expect.assertions(2);
    try {
      await exec(["teamId", "userId"]);
    } catch (e) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(e).toBeDefined();
      // eslint-disable-next-line jest/no-conditional-expect
      expect(next).toHaveBeenCalledTimes(0);
    }
  });
});
