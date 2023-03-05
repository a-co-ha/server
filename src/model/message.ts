import { Sequelize, DataTypes, Model, Association } from "sequelize";
import { ChannelAttributes, MessageAttributes } from "../interface";
import { Channel } from "./channel";
import { ChannelUser } from "./channelUser";
import { sequelize } from "./index";
import { User } from "./user";

export class Message extends Model<MessageAttributes> {
  public readonly id!: number;
  public name!: string;
  public githubID!: string;
  public img!: string;
  public text!: string;
  public channelId!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

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
      get() {
        return this.getDataValue("id");
      },
    },
    name: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    githubID: {
      type: DataTypes.STRING(45),
      allowNull: false,
      field: "github_id",
    },
    img: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    text: {
      type: DataTypes.STRING(2000),
      allowNull: true,
    },
    channelId: {
      type: DataTypes.NUMBER,
      primaryKey: true,
      field: "channel_id",
    },
  },
  {
    modelName: "message",
    tableName: "message",
    sequelize,
    freezeTableName: true,
    timestamps: false,
    updatedAt: "updateTimestamp",
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
