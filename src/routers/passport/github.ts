/* eslint @typescript-eslint/no-var-requires: "off" */
import { UserService, userService } from "./../../services/userService";
const GitHubStrategy = require("passport-github2").Strategy;
import passport from "passport";
import { oauthClient, oauthSecret, oauthRedirect } from "../../config";
import { UserAttributes, IUserModel } from "../../interface";
import { userController } from "../../controllers";

passport.use(
  new GitHubStrategy(
    {
      clientID: oauthClient,
      clientSecret: oauthSecret,
      callbackURL: oauthRedirect,
    },
    async (accessToken: any, refreshToken: any, profile: any, cb: any) => {
      try {
        const {
          name,
          login: githubID,
          html_url: githubURL,
          avatar_url: img,
        } = profile._json;

        const user: UserAttributes = { name, githubID, githubURL, img };
        const isGuest = await userService.get(user);

        if (isGuest.length === 0) {
          await userService.insert(user);
        }

        return cb(null, user);
      } catch (err) {
        return cb(err, false);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  console.log(`serializeUser : ${user.name}`);
  done(null, user);
});

passport.deserializeUser((user: UserAttributes, done) => {
  console.log(`deserializeUser : ${user.name}`);
  done(null, user);
});
