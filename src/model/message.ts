import { Sequelize, DataTypes, Model, Association } from "sequelize";
import { MessageAttributes } from "../interface";
import { Channel } from "./channel";
import { ChannelUser } from "./channelUser";
import { sequelize } from "./index";
import { User } from "./user";

export class Message extends Model<MessageAttributes> {
  declare id: number;
  declare roomId: string;
  public static associations: {
    belongToChannel: Association<Channel, Message>;
    belongToUser: Association<User, Message>;
  };

  public static initialize(sequelize: Sequelize): void {
    this.init(
      {
        id: {
          type: DataTypes.NUMBER,
          primaryKey: true,
          autoIncrement: true,
        },
        name: {
          type: DataTypes.STRING(45),
          allowNull: false,
        },
        userId: {
          type: DataTypes.NUMBER,
          field: "user_id",
        },
        img: {
          type: DataTypes.STRING(200),
          allowNull: true,
        },
        text: {
          type: DataTypes.STRING(2000),
          allowNull: true,
        },
        roomId: {
          type: DataTypes.STRING(100),
          primaryKey: true,
          field: "room_id",
        },
        createdAt: {
          type: DataTypes.DATE,
          field: "create_at",
        },
      },
      {
        modelName: "message",
        tableName: "message",
        sequelize,
        freezeTableName: true,
        timestamps: true,
        createdAt: true,
        updatedAt: false,
      }
    );
    this.belongsTo(User, { foreignKey: "name", targetKey: "name" });
    User.hasMany(Message, {
      sourceKey: "name",
      foreignKey: "name",
      as: "belongToUser",
    });
  }
}

// todo
// Channel.belongsTo(Message, {
//   targetKey: "id",
// });
// User.belongsTo(Message, {
//   targetKey: "githubID",
// });
// Message.hasOne(User);
// Message.hasOne(Channel);
Message.initialize(sequelize);
export const messageModel = new Message();
