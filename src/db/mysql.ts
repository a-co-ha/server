import mysql, { Pool, RowDataPacket } from "mysql2";
import { port, mongoDBUri, host } from "../config";

/**
 * generates pool connection to be used throughout the app
 */
let pool: Pool;
export const init = () => {
  try {
    pool = mysql.createPool({
      host: host,
      port: 3306,
      user: "admin",
      password: "12341234",
      database: "acoha",
      connectionLimit: 10000,
    });

    console.debug("MySql Adapter Pool generated successfully");
  } catch (error) {
    console.error("[mysql.connector][init][Error]: ", error);
    throw new Error("failed to initialized pool");
  }
};

/**
 * executes SQL queries in MySQL db
 *
 * @param {string} query - provide a valid SQL query
 * @param {string[] | Object} params - provide the parameterized values used
 * in the query
 */

export const execute = <T>(
  query: string,
  params: string[] | Object
): Promise<T> => {
  try {
    if (!pool)
      throw new Error(
        "Pool was not created. Ensure pool is created when running the app."
      );

    return new Promise<T>((resolve, reject) => {
      pool.query(query, params, (error, results: any) => {
        if (error) reject(error);
        else resolve(results);
      });
    });
  } catch (error) {
    console.error("[mysql.connector][execute][Error]: ", error);
    throw new Error("failed to execute MySQL query");
  }
};
