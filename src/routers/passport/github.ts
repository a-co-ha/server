const GitHubStrategy = require("passport-github2").Strategy;
import passport from "passport";
import {
  NEXT_PUBLIC_APP_GITHUB_OAUTH_CLIENT_ID,
  NEXT_PUBLIC_APP_GITHUB_OAUTH_CLIENT_SECRET,
  NEXT_PUBLIC_APP_GITHUB_OAUTH_REDIRECT_URL,
} from "../../config";
import { connect } from "../../db/mysql";

passport.use(
  new GitHubStrategy(
    {
      clientID: NEXT_PUBLIC_APP_GITHUB_OAUTH_CLIENT_ID,
      clientSecret: NEXT_PUBLIC_APP_GITHUB_OAUTH_CLIENT_SECRET,
      callbackURL: NEXT_PUBLIC_APP_GITHUB_OAUTH_REDIRECT_URL,
    },
    async (accessToken: any, refreshToken: any, profile: any, cb: any) => {
      try {
        const {
          name,
          login: githubID,
          html_url: githubURL,
          avatar_url: img,
        } = profile._json;

        // connect(async (con: any, id: string) => {
        //   console.log(name, githubID, githubURL);
        //   const result = await con.query("select * from user");
        //   console.log(result);

        return cb(null, profile._json);
        // }
        // );
      } catch (err) {
        return cb(err);
      }
    }
  )
);
passport.serializeUser((user, done) => {
  done(null, user);
});
// 로그인 성공 후, 페이지 접근 시 수행됨. session에 저장된 값을 이용해 DB에서 사용자 정보를 가져와 Request에 넘겨준다
passport.deserializeUser((name: any, done) => {
  console.log(name);
  done(null, name);
});
