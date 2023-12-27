const xDBModels = require("../../models/index");
const xServerUtils = require("../../config/xExpressUtil");

const {
  expressValidator: { body, validationResult },
  bcrypt,
  jwt,
  config,
} = xServerUtils.xModules;

const gravatar = require("gravatar");

module.exports = xServerUtils
  .createRouter()
  // API: register user
  .post(
    "/",
    [
      body("name", "Name is required").notEmpty(),
      body("email", "Please include a valid email").isEmail(),
      body("password", "Please enter a password with 6 or more chars").isLength(
        {
          min: 6,
        },
      ),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { name, email, password } = req.body;
      try {
        let user = await xDBModels.User.findOne({ email });
        if (user) {
          return res
            .status(400)
            .json({ errors: [{ msg: "User already exists." }] });
        }
        const avatar = gravatar.url(email, { s: "200", r: "pg", d: "mm" });
        user = new xDBModels.User({ name, email, avatar, password });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        const payload = { user: { id: user.id } };
        jwt.sign(
          payload,
          config.get("jwtSecret"),
          { expiresIn: `${60}m` },
          (err, token) => {
            if (err) throw err;
            res.json({ token });
          },
        );
      } catch (err) {
        xServerUtils.responseError(res, err);
      }
    },
  );
