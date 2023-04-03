import { Sequelize } from "sequelize";
import { DataTypes, Model, Association } from "sequelize";
import { Channel_UserAttributes } from "../interface";
import { Channel } from "./channel";
import { sequelize } from "./index";
import { User } from "./user";

export class ChannelUser extends Model<Channel_UserAttributes> {
  public readonly id!: number;
  public userId: number;
  // 유저 네임
  public name: string;
  public channelId: number;
  public channelName: string;
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
        updatedAt: "updateTimestamp",
      }
    );
    // Channel 모델과 연결
    this.belongsTo(Channel);
    Channel.hasMany(ChannelUser, {
      sourceKey: "id",
      foreignKey: "channel_id",
      as: "channelHasManyUsers",
    });

    // User 모델과 연결
    this.belongsTo(User, { foreignKey: "userId" });
    User.hasMany(ChannelUser, {
      foreignKey: "user_id",
      as: "userHasChannels",
    });
  }
}

ChannelUser.initialize(sequelize);
export const channelUserModel = new ChannelUser();
