import { DataTypes, Model } from "sequelize";
import { Channel_UserAttributes } from "../interface";
import { sequelize } from "./index";

export class ChannelUser extends Model<Channel_UserAttributes> {
  public readonly id!: number;
  public userId: string;
  public channelId: number;
}

ChannelUser.init(
  {
    userId: {
      type: DataTypes.STRING(45),
      allowNull: false,
      field: "user_id",
    },
    channelId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "channel_id",
    },
  },
  {
    modelName: "channel_user",
    tableName: "channel_user",
    sequelize,
    freezeTableName: true,
    timestamps: false,
    updatedAt: "updateTimestamp",
  }
);
