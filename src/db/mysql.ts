import mysql, { Pool } from "mysql2";
import {
  mysqlPort,
  mysqlHost,
  mysqlUser,
  mysqlPassword,
  mysqlDataBase,
} from "../config";
import { logger } from "../utils/winston";
import { connectSequelize } from "./mysqlSequelize";

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

      logger.info("MySql Adapter Pool generated successfully");
      connectSequelize();
    } catch (error) {
      logger.error("[mysql.connector][init][Error]: ", error);
      throw new Error("failed to initialized pool");
    }
  }

  // 시퀄라이즈안쓸때만쓰면된다.
  public async execute<T>(
    query: string,
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
      logger.error("[mysql.connector][execute][Error]: ", error);
      throw new Error("failed to execute MySQL query");
    }
  }
}
