import { LogColor } from "../constants";
import mysql, { Pool } from "mysql2";
import {
  mysqlPort,
  mysqlHost,
  mysqlUser,
  mysqlPassword,
  mysqlDataBase,
} from "../config";

export class MySqlAdapter {
  private pool: Pool;

  constructor() {
    try {
      this.pool = mysql.createPool({
        host: mysqlHost,
        port: mysqlPort,
        user: mysqlUser,
        password: mysqlPassword,
        database: mysqlDataBase,
        connectionLimit: 10000,
      });

      console.debug(LogColor.INFO, "MySql Adapter Pool generated successfully");
    } catch (error) {
      console.error(LogColor.ERROR, "[mysql.connector][init][Error]: ", error);
      throw new Error("failed to initialized pool");
    }
  }

  public async execute<T>(
    query: string,
    // eslint-disable-next-line @typescript-eslint/ban-types
    params: string[] | Object
  ): Promise<T> {
    try {
      if (!this.pool)
        throw new Error(
          "Pool was not created. Ensure pool is created when running the app."
        );

      return new Promise<T>((resolve, reject) => {
        this.pool.query(query, params, (error, results: any) => {
          if (error) reject(error);
          else resolve(results);
        });
      });
    } catch (error) {
      console.error(
        LogColor.ERROR,
        "[mysql.connector][execute][Error]: ",
        error
      );
      throw new Error("failed to execute MySQL query");
    }
  }
}
