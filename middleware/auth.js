// JWT playground: https://jwt.io/
const xAuthJwtUtil = (() => {
  /** @type {import('jsonwebtoken')} */
  const jwt = require("jsonwebtoken");
  /** @type {import('config')} */
  const config = require("config");
  return {
    xModules: { jwt, config },
    middlewareAuth(req, res, next) {
      const token = req.header("x-auth-token");
      if (!token) {
        return res.status(401).json({ msg: "No token, authorization denied" });
      }
      // Verify token
      try {
        const decoded = jwt.verify(token, config.get("jwtSecret"));
        req.user = decoded.user;
        next();
      } catch (err) {
        res.status(401).json({ msg: "Token is not valid" });
      }
    },
  };
})();

module.exports = xAuthJwtUtil.middlewareAuth;
