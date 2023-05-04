import { Sequelize } from "sequelize";
import { DataTypes, Model, Association } from "sequelize";
import { Channel_UserAttributes } from "../interface";
import { Channel } from "./channel";
import { sequelize } from "../db/sequelize";
import { User } from "./user";

export class ChannelUser extends Model<Channel_UserAttributes> {
  declare channelId: number;
  declare userId: number;
  public static associations: {
    hasUsers: Association<Channel, ChannelUser>;
    hasChannels: Association<Channel, ChannelUser>;
  };
  public static initialize(sequelize: Sequelize): void {
    this.init(
      {
        userId: {
          type: DataTypes.NUMBER,
          allowNull: false,
          field: "user_id",
        },
        // name: {
        //   type: DataTypes.STRING(45),
        //   allowNull: false,
        //   field: "user_name",
        // },

        channelId: {
          type: DataTypes.NUMBER,
          allowNull: false,
          field: "channel_id",
        },
        // channelName: {
        //   type: DataTypes.STRING(45),
        //   allowNull: false,
        //   field: "channel_name",
        // },
      },
      {
        modelName: "channel_user",
        tableName: "channel_user",
        sequelize,
        freezeTableName: true,
        timestamps: false,
      }
    );

    this.belongsTo(Channel);
    Channel.hasMany(ChannelUser, {
      sourceKey: "id",
      foreignKey: "channel_id",
      as: "channelHasManyUsers",
    });

    this.belongsTo(User, { foreignKey: "userId" });
    User.hasMany(ChannelUser, {
      foreignKey: "user_id",
      as: "userHasChannels",
    });
  }
}

ChannelUser.initialize(sequelize);
export const channelUserModel = new ChannelUser();
