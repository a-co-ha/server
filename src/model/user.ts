import { DataTypes, Model, Association } from "sequelize";
import { sequelize } from "../db/sequelize";
import { ChannelUser } from "./channelUser";
import { Sequelize } from "sequelize";
import { UserAttributes } from "../interface";

export class User extends Model<UserAttributes> {
  declare refreshToken: string;
  public static associations: {
    userHasChannels: Association<User, ChannelUser>;
  };

  public static initialize(sequelize: Sequelize): void {
    this.init(
      {
        userId: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          field: "user_id",
        },
        name: {
          type: DataTypes.STRING(45),
          allowNull: true,
        },
        githubID: {
          type: DataTypes.STRING(45),
          allowNull: false,
          field: "github_id",
        },
        githubURL: {
          type: DataTypes.STRING(200),
          allowNull: true,
          field: "github_url",
        },
        img: {
          type: DataTypes.STRING(200),
          allowNull: true,
        },
        refreshToken: {
          type: DataTypes.STRING(450),
          allowNull: true,
          field: "refresh_token",
        },
      },
      {
        modelName: "user",
        tableName: "user",
        sequelize,
        freezeTableName: true,
        timestamps: false,
      }
    );
  }
}

User.initialize(sequelize);
export const userModel = new User();
