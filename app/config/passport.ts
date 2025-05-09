import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import UserModel from "../models/user.model";
import { comparePassword } from "../utils/password";

const JWT_SECRET = process.env.JWT_SECRET || "CHANGE_THIS";

// — LocalStrategy: same as before, but no sessions —
passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email, password, done) => {
      try {
        const user = await UserModel.findOne({ email })
        if (!user) return done(null, false, { message: "Invalid credentials" });
        if (!(await comparePassword(password, user.password!)))
          return done(null, false, { message: "Invalid credentials" });
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// — JwtStrategy: verifies the token on protected routes —
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_SECRET,
    },
    async (payload, done) => {
      try {
        const user = await UserModel.findById(payload.sub);
        if (!user) return done(null, false);
        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

export default passport;
