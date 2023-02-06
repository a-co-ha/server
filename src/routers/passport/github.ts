/* eslint @typescript-eslint/no-var-requires: "off" */
import { UserService, userService } from "./../../services/userService";
const GitHubStrategy = require("passport-github2").Strategy;
import passport from "passport";
import { oauthClient, oauthSecret, oauthRedirect } from "../../config";
import { init, execute } from "../../db/mysql";
import { UserType, IUserModel } from "../../interface";

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
        const user: UserType = { name, githubID, githubURL, img };
        init();
        const isGuest = await execute<UserType[]>(
          `select * from user where name = ?
           and githubID = ?
           and githubURL = ?
           and img = ? `,
          [name, githubID, githubURL, img]
        );
        // const isGuest = await userService.get(user);

        if (isGuest.length <= 0) {
          await execute<UserType>(
            `insert into user (name, githubID, githubURL, img) values (?,?,?,?)`,
            [name, githubID, githubURL, img]
          );
        }
        return cb(null, user);
      } catch (err) {
        return cb(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user: UserType, done) => {
  done(null, user);
});
