import { DataTypes, Model, Association } from "sequelize";
import { UserAttributes } from "../interface";
import { ChannelUser } from "./channelUser";
import { sequelize } from "./index";

export class User extends Model<UserAttributes> {
  public id!: number;
  public name!: string;
  public githubID!: string;
  public githubURL!: string;
  public img!: string;

  public static associations: {
    userHasChannels: Association<User, ChannelUser>;
  };
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return this.getDataValue("id");
      },
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
  },
  {
    modelName: "user",
    tableName: "user",
    sequelize,
    freezeTableName: true,
    timestamps: false,
    updatedAt: "updateTimestamp",
  }
);
