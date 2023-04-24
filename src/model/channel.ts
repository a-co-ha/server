import { DataTypes, Model, Association, Sequelize } from "sequelize";
import { sequelize } from "../db/sequelize";
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
          type: DataTypes.NUMBER,
          primaryKey: true,
          autoIncrement: true,
        },
        userId: {
          type: DataTypes.NUMBER,
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
      },
      {
        modelName: "channel",
        tableName: "channel",
        sequelize,
        freezeTableName: true,
        timestamps: false,
      }
    );

    // this.hasMany(ChannelUser, {
    //   sourceKey: "id",
    //   foreignKey: "channelId",
    //   as: "channelUsers",
    // });
  }
}

Channel.initialize(sequelize);
export const channelModel = new Channel();
