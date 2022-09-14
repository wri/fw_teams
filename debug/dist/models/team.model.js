"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.TeamModel = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const {
  Schema
} = _mongoose.default;
const TeamSchema = new Schema({
  name: {
    type: String,
    required: false,
    trim: true
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  layers: [{
    type: String
  }]
});

const TeamModel = _mongoose.default.model("GFWTeam", TeamSchema);

exports.TeamModel = TeamModel;
var _default = TeamModel;
exports.default = _default;
//# sourceMappingURL=team.model.js.map