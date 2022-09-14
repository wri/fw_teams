"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _legacy_team = _interopRequireDefault(require("../models/legacy_team.model"));

var _team = _interopRequireDefault(require("../models/team.model"));

var _teamUserRelation = require("../models/teamUserRelation.model");

var _teamUserRelation2 = _interopRequireDefault(require("./teamUserRelation.service"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class TeamService {
  static async create(name, loggedUser, layers) {
    const {
      id: userId,
      email: userEmail
    } = loggedUser; // ToDo: loggedUser Type

    const team = await new _team.default({
      name,
      layers
    }).save(); // Create the Team User relation model
    // The logged-in user will become the "Administrator" of the team

    await _teamUserRelation2.default.create({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      teamId: team.id,
      userId: userId,
      email: userEmail,
      role: _teamUserRelation.EUserRole.Administrator,
      status: _teamUserRelation.EUserStatus.Confirmed
    });
    return team;
  }

  static update(id, name) {
    return _team.default.findByIdAndUpdate(id, {
      name
    }, {
      new: true
    });
  }

  static async delete(id) {
    await _team.default.findByIdAndRemove(id); // Remove all team user relations

    await _teamUserRelation2.default.removeAllUsersOnTeam(id);
  }

  static findById(id) {
    return _team.default.findById(id);
  }

  static async findAllInvites(userEmail) {
    const teamUserRelations = await _teamUserRelation2.default.findAllInvitesByUserEmail(userEmail);
    return await TeamService.findAllByTeamUserRelations(teamUserRelations);
  }

  static async findAllByUserId(userId) {
    const teamUserRelations = await _teamUserRelation2.default.findAllByUserId(userId);
    return await TeamService.findAllByTeamUserRelations(teamUserRelations);
  }

  static async findAllByTeamUserRelations(teamUserRelations) {
    const teams = [];

    for (let i = 0; i < teamUserRelations.length; i++) {
      const teamUser = teamUserRelations[i];
      const team = await TeamService.findById(teamUser.teamId);
      team.userRole = teamUser.role;
      teams.push(team);
    }

    return teams;
  }

  static async findAll() {
    return await _legacy_team.default.find({});
  }

}

var _default = TeamService;
exports.default = _default;
//# sourceMappingURL=team.service.js.map