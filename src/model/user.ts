import { DataTypes, Model, Association } from "sequelize";
import { sequelize } from "../db/sequelize";
import { UserAttributes } from "../interface";
import { ChannelUser } from "./channelUser";

export class User extends Model<UserAttributes> {
  public userId!: number;
  public name!: string;
  public githubID!: string;
  public githubURL!: string;
  public img!: string;
  public refreshToken: string;

  public static associations: {
    userHasChannels: Association<User, ChannelUser>;
  };
}

User.init(
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
    sequelize: sequelize,
    freezeTableName: true,
    timestamps: false,
    updatedAt: "updateTimestamp",
  }
);
