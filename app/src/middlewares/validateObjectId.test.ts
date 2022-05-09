import { validateObjectId } from "./validateObjectId";
import mongoose from "mongoose";

const { ObjectId } = mongoose.Types;

describe("validate ObjectId middleware", () => {
  it("doesn't throw with a single valid objectId param", () => {
    const middleware = validateObjectId("teamId") as (a: object, b: () => void) => void;

    expect(middleware({ params: { teamId: new ObjectId() } }, () => {})).not.toThrow();
  });

  // doesn't throw with an array of a valid objectId params
  // does throw with a single valid objectId param
  // does throw with an array containing an invalid objectId param
});
