const xDBModels = require("../../models/index");
const xServerUtils = require("../../config/xExpressUtil");
const _ = require("lodash");

const {
  expressValidator: { check },
  request,
  middlewareAuth,
} = xServerUtils.xModules;

module.exports = xServerUtils
  .createRouter()
  // API: get all users' profiles
  .get("/", async (req, res) => {
    try {
      const profile = await xDBModels.Profile.find().populate("user", [
        "name",
        "avatar",
      ]);
      res.json(profile);
    } catch (err) {
      xServerUtils.responseError(res, err);
    }
  })
  // API: get current user's profile
  .get("/me", middlewareAuth, async (req, res) => {
    try {
      const profile = await xDBModels.Profile.findOne({
        user: req.user.id,
      }).populate("user", ["name", "avatar"]);
      if (!profile) {
        return res
          .status(400)
          .json({ msg: "There is no profile for this user" });
      }
      res.json(profile);
    } catch (err) {
      xServerUtils.responseError(res, err);
    }
  })
  // API: get profile by user id
  .get("/user/:user_id", async (req, res) => {
    try {
      const profile = await xDBModels.Profile.findOne({
        user: req.params.user_id,
      }).populate("user", ["name", "avatar"]);
      if (!profile) {
        throw { kind: "ObjectId" };
      }
      res.json(profile);
    } catch (err) {
      if (err.kind == "ObjectId") {
        return res.status(400).json("Profile not found");
      }
      xServerUtils.responseError(res, err);
    }
  })
  // API: create & update profile
  .post(
    "/",
    [
      middlewareAuth,
      check("status", "Status is required").notEmpty(),
      check("skills", "Skills is required").notEmpty(),
      xServerUtils.middlewareValidationResult,
    ],
    async (req, res) => {
      const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin,
      } = req.body;
      const profileFields = {};
      profileFields.user = req.user.id;
      if (company) profileFields.company = company;
      if (website) profileFields.website = website;
      if (location) profileFields.location = location;
      if (bio) profileFields.bio = bio;
      if (status) profileFields.status = status;
      if (githubusername) profileFields.githubusername = githubusername;
      if (skills) {
        profileFields.skills = skills.split(",").map((skill) => skill.trim());
      }
      profileFields.social = {};
      if (youtube) profileFields.social.youtube = youtube;
      if (twitter) profileFields.social.twitter = twitter;
      if (facebook) profileFields.social.facebook = facebook;
      if (linkedin) profileFields.social.linkedin = linkedin;
      if (instagram) profileFields.social.instagram = instagram;
      try {
        let profile = await xDBModels.Profile.findOne({ user: req.user.id });
        if (profile) {
          profile = await xDBModels.Profile.findOneAndUpdate(
            { user: req.user.id },
            { $set: profileFields },
            { new: true },
          );
          return res.json(profile);
        }
        profile = new xDBModels.Profile(profileFields);
        await profile.save();
        res.json(profile);
      } catch (err) {
        xServerUtils.responseError(res, err);
      }
    },
  )
  // API: delete profile & user
  .delete("/", middlewareAuth, async (req, res) => {
    try {
      await xDBModels.Profile.findOneAndDelete({ user: req.user.id });
      await xDBModels.User.findOneAndDelete({ _id: req.user.id });
      res.json({ msg: "User deleted" });
    } catch (err) {
      xServerUtils.responseError(res, err);
    }
  })
  // API: add experience
  .put(
    "/experience",
    [
      middlewareAuth,
      check("title", "Title is required").notEmpty(),
      check("company", "Company is required").notEmpty(),
      check("from", "From date is required").notEmpty(),
      xServerUtils.middlewareValidationResult,
    ],
    async (req, res) => {
      const newExp = _.pick(req.body, [
        "title",
        "company",
        "location",
        "from",
        "to",
        "current",
        "description",
      ]);
      try {
        const profile = await xDBModels.Profile.findOne({ user: req.user.id });
        profile.experience.unshift(newExp);
        await profile.save();
        res.json(profile);
      } catch (err) {
        xServerUtils.responseError(res, err);
      }
    },
  )
  // API: delete experience
  .delete("/experience/:exp_id", middlewareAuth, async (req, res) => {
    try {
      const profile = await xDBModels.Profile.findOne({ user: req.user.id });
      profile.experience = profile.experience.filter(
        (i) => i.id != req.params.exp_id,
      );
      await profile.save();
      res.json(profile);
    } catch (err) {
      xServerUtils.responseError(res, err);
    }
  })
  // API: add education
  .put(
    "/education",
    [
      middlewareAuth,
      check("school", "School is required").notEmpty(),
      check("degree", "Degree is required").notEmpty(),
      check("fieldofstudy", "Field of study is required").notEmpty(),
      check("from", "From date is required").notEmpty(),
      xServerUtils.middlewareValidationResult,
    ],
    async (req, res) => {
      const newEdu = _.pick(req.body, [
        "school",
        "degree",
        "fieldofstudy",
        "from",
        "to",
        "current",
        "description",
      ]);
      try {
        const profile = await xDBModels.Profile.findOne({ user: req.user.id });
        profile.education.unshift(newEdu);
        await profile.save();
        res.json(profile);
      } catch (err) {
        xServerUtils.responseError(res, err);
      }
    },
  )
  // API: delete education
  .delete("/education/:edu_id", middlewareAuth, async (req, res) => {
    try {
      const profile = await xDBModels.Profile.findOne({ user: req.user.id });
      profile.education = profile.education.filter(
        (i) => i.id != req.params.edu_id,
      );
      await profile.save();
      res.json(profile);
    } catch (err) {
      xServerUtils.responseError(res, err);
    }
  })
  // API: get github repo by username
  .get("/github/:username", (req, res) => {
    try {
      const options = {
        uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc`,
        method: "GET",
        headers: { "user-agent": "node.js" },
      };
      request(options, (error, response, body) => {
        if (error) console.error(error);
        if (response.statusCode !== 200) {
          return res.status(404).json({ msg: "No Github profile found" });
        }
        res.json(JSON.parse(body));
      });
    } catch (err) {
      xServerUtils.responseError(res, err);
    }
  });
