import {
  Sequelize,
  DataTypes,
  Model,
  Optional,
  HasManyGetAssociationsMixin,
  HasManyAddAssociationMixin,
  HasManyHasAssociationMixin,
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin,
  Association,
} from "sequelize";
import { ChannelAttributes } from "../interface";
import { ChannelUser } from "./channelUser";
import { sequelize } from "./index";

export class Channel extends Model<ChannelAttributes> {
  public readonly id!: number;
  public admin!: string;
  public channelName!: string;
  public channelImg!: string;

  public static associations: {
    channelHasManyUsers: Association<Channel, ChannelUser>;
  };
}

Channel.init(
  {
    id: {
      type: DataTypes.NUMBER,
      primaryKey: true,
      get() {
        return this.getDataValue("id");
      },
    },
    admin: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    channelName: {
      type: DataTypes.STRING(45),
      allowNull: false,
      field: "c_name",
    },
    channelImg: {
      type: DataTypes.STRING(200),
      allowNull: true,
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
