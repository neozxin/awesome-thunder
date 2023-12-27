const xDBModels = require("../../models/index");
const xServerUtils = require("../../config/xExpressUtil");

const {
  expressValidator: { body },
  bcrypt,
  middlewareAuth,
} = xServerUtils.xModules;

module.exports = xServerUtils
  .createRouter()
  // API: get current user info
  .get("/", middlewareAuth, async (req, res) => {
    try {
      const user = await xDBModels.User.findById(req.user.id).select(
        "-password",
      );
      res.json(user);
    } catch (err) {
      xServerUtils.responseError(res, err);
    }
  })
  // API: authenticate user & get token
  .post(
    "/",
    [
      body("email", "Please include a valid email").isEmail(),
      body("password", "Password is required").exists(),
      xServerUtils.middlewareValidationResult,
    ],
    async (req, res) => {
      const { email, password } = req.body;
      try {
        const user = await xDBModels.User.findOne({ email });
        const isMatch = await bcrypt.compare(password, user?.password || "");
        if (!user || !isMatch) {
          return res
            .status(400)
            .json({ errors: [{ msg: "Invalid Credentials" }] });
        }
        const resultJwtSign = await xServerUtils.jwtSign({
          user: { id: user.id },
        });
        res.json(resultJwtSign);
      } catch (err) {
        xServerUtils.responseError(res, err);
      }
    },
  );
