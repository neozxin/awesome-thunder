const xDBModels = require("../../models/index");
const xServerUtils = require("../../config/xExpressUtil");

const {
  expressValidator: { body },
  bcrypt,
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
      xServerUtils.middlewareValidationResult,
    ],
    async (req, res) => {
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
        const resultJwtSign = await xServerUtils.jwtSign({
          user: { id: user.id },
        });
        res.json(resultJwtSign);
      } catch (err) {
        xServerUtils.responseError(res, err);
      }
    },
  );
