import { DataTypes, Model, Association } from "sequelize";
import { Channel_UserAttributes } from "../interface";
import { Channel } from "./channel";
import { sequelize } from "./index";
import { User } from "./user";

export class ChannelUser extends Model<Channel_UserAttributes> {
  public readonly id!: number;
  public userId: number;
  public userName: string;
  public channelId: number;
  public channelName: string;
  public static associations: {
    hasUsers: Association<Channel, ChannelUser>;
    hasChannels: Association<Channel, ChannelUser>;
  };
}

ChannelUser.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "user_id",
    },
    userName: {
      type: DataTypes.STRING(45),
      allowNull: false,
      field: "user_name",
    },

    channelId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "channel_id",
    },
    channelName: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "channel_name",
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

ChannelUser.belongsTo(Channel);
ChannelUser.belongsTo(User);

Channel.hasMany(ChannelUser, {
  sourceKey: "id",
  foreignKey: "channel_id",
  as: "channelHasManyUsers",
});
User.hasMany(ChannelUser, {
  sourceKey: "id",
  foreignKey: "user_id",
  as: "userHasChannels",
});
