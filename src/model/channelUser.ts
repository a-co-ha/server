import { Association, DataTypes, Model, Sequelize } from "sequelize";
import { sequelize } from "../db/mysqlSequelize";
import { Channel_UserAttributes } from "../interface";
import { Channel } from "./channel";
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
          type: DataTypes.INTEGER,
          allowNull: false,
          field: "user_id",
        },
        name: {
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
          type: DataTypes.STRING(45),
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
        indexes: [
          {
            name: "channelId_index",
            fields: ["channel_id"],
          },
        ],
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
