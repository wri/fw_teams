import request from "supertest";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import server from "app";

describe("/v3/teams", () => {
  describe("GET /v3/teams/myinvites", () => {
    // should return 200 for happy case
    // should return 401 when user is not authorised
    // should return an array of teams
    // should return only the teams the authorised user is invited too
    // should return 404 when no invites are pending for the authorised user
  });

  describe("GET /v3/teams/:teamId", () => {
    // should return 200 for happy case
    // should return 401 when user is not authorised
    // should return 401 when the authorised user is not part of the team
    // should return singular team
    // should return the correct team from the database
    // should return 404 when teamId can't be found
  });

  describe("GET /v3/teams/user/:teamId", () => {
    // should return 200 for happy case
    // should return 401 when user is not authorised
    // should return an array of teams
    // should return only the teams the userId is a part of
    // should return the role which the userId has as an attribute on each team
    // should return 404 when userId is not part of any team
  });

  describe("POST /v3/teams", () => {
    // should return 200 for happy case
    // should return 401 when user is not authorised
    // should return the newly created team
    // should add a team-user relation for the authorised user
    // should assign the team-user relation the authorised user's email and id
    // should assign the team-user relation the "administrator" role
    // should assign the team-user relation the "confirmed" status
  });

  describe("PATCH /v3/teams/:teamId", () => {
    // should return 200 for happy case
    // should return 401 when user is not authorised
    // should return 401 when user is not an administrator or manager of the team
    // should return the updated team
    // should change the team's name in the database
    // should return 404 when the teamId can't be found
  });

  describe("DELETE /v3/teams/:teamId", () => {
    // should return 200 for happy case
    // should return 401 when user is not authorised
    // should return 401 when user is not an administrator of the team
    // should return an empty response
    // should remove the team in the database
    // should return all team-user relations from the database
    // should return 404 when the teamId can't be found
  });
});
