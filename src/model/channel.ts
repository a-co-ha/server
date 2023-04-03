import { DataTypes, Model, Association, Sequelize } from "sequelize";
import { ChannelAttributes } from "../interface";
import { ChannelUser } from "./channelUser";
import { sequelize } from "./index";

export class Channel extends Model<ChannelAttributes> {
  public readonly id!: number;
  public userId!: number;
  public channelName!: string;
  public channelImg!: string;

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
        updatedAt: "updateTimestamp",
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
