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
import { sequelize } from "./index"; //방금 만들어주었던 sequelize객체 임포트

interface Channel_UserAttributes {
  user_id: string;
  channel_id: string;
}

export class ChannelUser extends Model<Channel_UserAttributes> {
  public readonly id!: number; //굳이 안넣어줘도 될 것 같지만 공식문서에 있으니깐 일단 넣어줌.
  public user_id: string;
  public channel_id: string;
}

// These are all the attributes in the User model
interface ChannelAttributes {
  //   id: number | null;
  admin: string;
  c_name: string;
  c_img: string;
}

export class Channels extends Model<ChannelAttributes> {
  public readonly id!: number; //굳이 안넣어줘도 될 것 같지만 공식문서에 있으니깐 일단 넣어줌.
  public admin!: string;
  public c_name!: string;
  public c_img!: string;

  public static associations: {
    channelHasManyUsers: Association<Channels, ChannelUser>;
  };
}

Channels.init(
  {
    admin: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    c_name: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    c_img: {
      type: DataTypes.STRING(200),
      allowNull: true,
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

ChannelUser.init(
  {
    user_id: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    channel_id: {
      type: DataTypes.STRING(45),
      allowNull: false,
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
Channels.hasMany(ChannelUser, {
  sourceKey: "id",
  foreignKey: "channel_id",
  as: "channelHasManyUsers",
});
