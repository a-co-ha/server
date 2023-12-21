import { Model, Association, DataTypes } from "sequelize";
import { sequelize } from "../db/mysqlSequelize";
import { Sequelize } from "sequelize";
import { AnnouncementsAttributes } from "../interface";
import { User } from "./user";

export class Announcements extends Model<AnnouncementsAttributes> {
  public static associations: {
    announcementsCreatUser: Association<Announcements, User>;
  };

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
          field: "channel_id",
        },
        title: {
          type: DataTypes.STRING(45),
          allowNull: false,
        },
        content: {
          type: DataTypes.STRING(200),
          allowNull: false,
        },
        userId: {
          type: DataTypes.INTEGER,
          field: "user_id",
          allowNull: false,
        },
        userName: {
          type: DataTypes.STRING(45),
          field: "user_name",
          allowNull: false,
        },
      },
      {
        modelName: "announcements",
        tableName: "announcements",
        sequelize,
        freezeTableName: true,
        timestamps: false,
      }
    );
  }
}

Announcements.initialize(sequelize);
export const announcementsModel = new Announcements();
