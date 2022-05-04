import request from "supertest";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import server from "app";
import mongoose from "mongoose";

const { ObjectId } = mongoose.Types;

describe("/teams/:teamId/users", () => {
  describe("GET /v3/teams/:teamId/users", () => {
    // should return 200 for happy case
    // should return all the users of the team
    // ToDo: should return 401 when user is not authorised
    // should return 401 if the authorised user isn't part of the team
    // should return the 'status' attribute is the authorised user is an administrator of the team
    // should return the 'status' attribute is the authorised user is a manager of the team
    // should not return the 'status' attribute is the authorised user is a monitor of the team
    // should return 404 if the team id isn't found
  });

  describe("POST /v3/teams/:teamId/users", () => {
    // should return 200 for happy case
    // should return 200 when the authorised user is a manager of the team
    // should return the newly added users
    // should add the team-user relations in the database
    // should assign each team-user relation their correct email
    // should assign each team-user relation their correct role
    // should assign each team-user relation the 'invited' status
    // ToDo: should return 401 when user is not authorised
    // ToDo: should return 400 when the body fails validation
    // should return 401 when the authorised user is a monitor of the team
    // should return 401 when the authorised user is not a member of the team
    // should return 400 if attempting to add duplicate members to the team
    // should return 404 if the team id isn't found
    // ToDo: Tests for "Send Invitations 'userEmails'"
  });

  describe("PATCH /v3/teams/:teamId/users", () => {
    // should return 200 for happy case
    // should return 200 when the authorised user is a manager of the team
    // should return the updated users
    // should update the team-user relations in the database
    // should assign each team-user relation their updated role
    // ToDo: should return 401 when user is not authorised
    // ToDo: should return 400 when the body fails validation
    // should return 401 when the authorised user is a monitor of the team
    // should return 401 when the authorised user is not a member of the team
    // should return 401 if attempting to set a user's role to 'administrator'
    // should return 404 if a user isn't found on the team
    // should return 404 if the team id isn't found
  });

  describe("PATCH /v3/teams/:teamId/users/:userId/accept", () => {
    // should return 200 for happy case
    // should return the updated user
    // should set the user's id as the authorised user's id in the database
    // should set the user's status as 'confirmed' in the database
    // ToDo: should return 401 when user is not authorised
    // should return 401 if the path's userId does not match the authorised user's id
    // should return 404 if the team id isn't found
    // should return 404 if a team-user relation isn't found
  });

  describe("PATCH /v3/teams/:teamId/users/:userId/decline", () => {
    // should return 200 for happy case
    // should return the updated user
    // should set the user's status as 'declined' in the database
    // ToDo: should return 401 when user is not authorised
    // should return 401 if the path's userId does not match the authorised user's id
    // should return 404 if the team id isn't found
    // should return 404 if a team-user relation isn't found
  });

  describe("PATCH /v3/teams/:teamId/users/:userId/leave", () => {
    // should return 200 for happy case
    // should return the updated user
    // should set the user's status as 'left' in the database
    // ToDo: should return 401 when user is not authorised
    // should return 401 if the path's userId does not match the authorised user's id
    // should return 400 if the 'administrator' is trying to leave the team
    // should return 404 if the team id isn't found
    // should return 404 if a team-user relation isn't found
  });
});
