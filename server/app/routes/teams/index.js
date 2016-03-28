/* TEAMS ROUTES */
'use strict';
var router = require('express').Router();
module.exports = router;

var _ = require('lodash'),
    auth = require('../authentication'),

    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Team = mongoose.model('Team'),
    ProjectRouter = require('../projects');

//Get all existing teams
router.get('/', auth.ensureTeamMemberOrAdmin, function(req, res, next) {
	Team.find({})
	.then(teams => {
		res.json(teams);
	})
	.then(null, next);
});

router.post('/', auth.ensureTeamMemberOrAdmin, function(req, res, next) {
	Team.createAndAddMembers(req.body)
	.then(team => {
    console.log("the team!!!", team);
		res.json(team);
	})
	.then(null, next);
});