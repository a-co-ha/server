import { Association, DataTypes, Model, Sequelize } from "sequelize";
import { sequelize } from "../db/mysqlSequelize";
import { CalendarAtributes } from "../interface";

export class Calendar extends Model<CalendarAtributes> {
  declare channelId: number;
  declare userId: number;
  declare userName: string;
  declare date: string;
  declare content: string;

  public static initialize(sequelize: Sequelize): void {
    this.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        channelId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: "channel_id",
        },
        date: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        content: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: "author_id",
        },
        userName: {
          type: DataTypes.STRING,
          allowNull: false,
          field: "author_name",
        },
      },
      {
        modelName: "calendar",
        tableName: "calendar",
        sequelize,
        freezeTableName: true,
        timestamps: false,
      }
    );
  }
}

Calendar.initialize(sequelize);
export const calendarModel = new Calendar();
