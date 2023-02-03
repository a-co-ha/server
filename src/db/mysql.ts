import mysql from "mysql2";
import { port, mongoDBUri, host } from "../config";
// const pool = mysql.createPool({
//   host: host,
//   port: 3306,
//   user: "admin",
//   password: "12341234",
//   database: "acoha",
//   connectionLimit: 10000,
// });

// export const connection = async () => {
//   return pool.getConnection(async (err, conn) => {
//     if (err) {
//       console.error("failed to get connection ⭐️ ");
//     }
//     if (conn) return conn.release();
//   });
// };

// module.exports.query = async () => {
//   try {
//     const connection = await pool.getConnection(async (conn) => conn);
//     try {
//       /* Step 3. */
//       await connection.beginTransaction();
//       const [rows] = await connection.query(sql, arry);
//       await connection.commit(); // COMMIT
//       console.log("Query Success ");
//       connection.release();
//       return rows;
//     } catch (err) {
//       await connection.rollback(); // ROLLBACK
//       console.log("Query Error : ", sql, arry, err);
//       connection.release();
//       return false;
//     }
//   } catch (err) {
//     console.log("DB Error", err);
//     return false;
//   }
// };

const promiseMysql = require("promise-mysql");

const pool = promiseMysql.createPool({
  host: host,
  port: 3306,
  user: "admin",
  password: "12341234",
  database: "acoha",
  connectionLimit: 10000,
});

export const connect =
  (fn: any) =>
  async (...args: any[]) => {
    /* DB 커넥션을 한다. */
    const con: any = await pool.getConnection();

    const result = await fn(con, ...args).catch((error: any) => {
      /* 에러시 con을 닫아준다. */
      con.connection.release();
      throw error;
    });
    /* con을 닫아준다. */
    con.connection.release();
    return result;
  };

export const transaction =
  (fn: any) =>
  async (...args: any[]) => {
    /* DB 커넥션을 한다. */
    const con: any = await pool.getConnection();
    /* 트렌젝션 시작 */
    await con.connection.beginTransaction();
    /* 비지니스 로직에 con을 넘겨준다. */
    const result = await fn(con, ...args).catch(async (error: any) => {
      /* rollback을 진행한다. */
      await con.rollback();
      /* 에러시 con을 닫아준다. */
      con.connection.release();
      throw error;
    });
    /* commit을 해준다. */
    await con.commit();
    /* con을 닫아준다. */
    con.connection.release();
    return result;
  };
