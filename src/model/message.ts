import { Sequelize, DataTypes, Model, Association } from "sequelize";
import { ChannelAttributes, MessageAttributes } from "../interface";
import { Channel } from "./channel";
import { ChannelUser } from "./channelUser";
import { sequelize } from "./index";
import { User } from "./user";

export class Message extends Model<MessageAttributes> {
  public readonly id!: number;
  public name!: string;
  public img!: string;
  public text!: string;
  public roomId!: string;
  public readonly createdAt!: Date;

  public static associations: {
    belongToChannel: Association<Channel, Message>;
    belongToUser: Association<User, Message>;
  };
}

Message.init(
  {
    id: {
      type: DataTypes.NUMBER,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(45),
      allowNull: false,
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
      type: DataTypes.NUMBER,
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
// todo
// Channel.belongsTo(Message, {
//   targetKey: "id",
// });
// User.belongsTo(Message, {
//   targetKey: "githubID",
// });
// Message.hasOne(User);
// Message.hasOne(Channel);
