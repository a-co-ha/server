import { Sequelize, Transaction as TransactionType } from "sequelize";
import { sequelize } from "./mysqlSequelize";

export class MysqlTransaction {
  constructor(
    private sequelize: Sequelize,
    private transaction: TransactionType | null = null
  ) {}

  async begin() {
    this.transaction = await this.sequelize.transaction();
  }

  async commit() {
    if (this.transaction) {
      await this.transaction.commit();
      this.transaction = null;
    }
  }

  async rollback() {
    if (this.transaction) {
      await this.transaction.rollback();
      this.transaction = null;
    }
  }

  async execute(func: (transaction: any) => Promise<any>) {
    try {
      await this.begin();
      await func(this.transaction);
      await this.commit();
    } catch (error) {
      await this.rollback();
      throw new Error();
    }
  }
}
export const mysqlTransaction = new MysqlTransaction(sequelize);
