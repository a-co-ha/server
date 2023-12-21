import moment from "moment-timezone";
import { Association, DataTypes, Model, Sequelize } from "sequelize";
import { dateFormat } from "../constants";
import { sequelize } from "../db/mysqlSequelize";
import { MessageAttributes } from "../interface";
import { Channel } from "./channel";
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
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        name: {
          type: DataTypes.STRING(45),
          allowNull: false,
        },
        userId: {
          type: DataTypes.INTEGER,
          field: "user_id",
        },
        img: {
          type: DataTypes.STRING(200),
          allowNull: true,
        },
        content: {
          type: DataTypes.STRING(2000),
          allowNull: true,
        },
        roomId: {
          type: DataTypes.STRING(100),
          // primaryKey: true,
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
        createdAt: "createdAt",
        updatedAt: false,
        getterMethods: {
          createdAt() {
            return moment(this.getDataValue("createdAt"))
              .tz("Asia/Seoul")
              .format(dateFormat);
          },
        },
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

Message.initialize(sequelize);
export const messageModel = new Message();
