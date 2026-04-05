const passport = require("passport");
const { Strategy: LocalStrategy } = require("passport-local");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const bcrypt = require("bcrypt");
const { User } = require("../models/user.model");

// keeping passport logic minimal to avoid tight coupling — verify identity only
function configurePassport() {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        session: false,
      },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email }).select("+password");
          if (!user) {
            return done(null, false, { message: "Invalid email or password" });
          }
          if (user.status !== "active") {
            return done(null, false, { message: "Account is inactive" });
          }
          const match = await bcrypt.compare(password, user.password);
          if (!match) {
            return done(null, false, { message: "Invalid email or password" });
          }
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET,
      },
      async (payload, done) => {
        try {
          if (!payload?.sub) {
            return done(null, false);
          }
          const user = await User.findById(payload.sub);
          if (!user || user.status !== "active") {
            return done(null, false);
          }
          return done(null, user);
        } catch (err) {
          return done(err, false);
        }
      }
    )
  );
}

module.exports = { configurePassport };
