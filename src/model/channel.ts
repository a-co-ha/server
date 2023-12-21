import { Association, DataTypes, Model, Sequelize } from "sequelize";
import { sequelize } from "../db/mysqlSequelize";
import { ChannelAttributes } from "../interface";
import { ChannelUser } from "./channelUser";

export class Channel extends Model<ChannelAttributes> {
  declare id: number;
  declare channelName: string;
  declare userId: number;
  public static associations: {
    channelHasManyUsers: Association<Channel, ChannelUser>;
  };

  public static initialize(sequelize: Sequelize): void {
    this.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: "admin",
        },
        channelName: {
          type: DataTypes.STRING(45),
          allowNull: false,
          field: "c_name",
        },
        channelImg: {
          type: DataTypes.STRING(200),
          defaultValue: "",
          field: "c_img",
        },
        repoName: {
          type: DataTypes.STRING(200),
          defaultValue: "",
          field: "repo_name",
        },
        repoType: {
          type: DataTypes.STRING(200),
          defaultValue: "",
          field: "repo_type",
        },
      },
      {
        modelName: "channel",
        tableName: "channel",
        sequelize,
        freezeTableName: true,
        timestamps: false,
      }
    );
  }
}

Channel.initialize(sequelize);
export const channelModel = new Channel();
