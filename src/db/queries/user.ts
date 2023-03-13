export const UserQueries = {
  JoinUser: `insert into user (name, githubID, githubURL, img) values (?,?,?,?)`,

  GetUser: `select * from user where name = ?
           and githubID = ?
           and githubURL = ?
           and img = ? `,
};
