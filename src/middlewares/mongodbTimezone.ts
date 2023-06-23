import moment from "moment-timezone";

export const mongodbTimezone = (schema) => {
  // toJSON 메서드 재정의
  schema.set("toJSON", {
    getters: true,
    virtuals: false,
    transform: function (doc, ret) {
      ret.createdAt = moment(ret.createdAt)
        .tz("Asia/Seoul")
        .format("YYYY-MM-DD HH:mm:ss");
      ret.updatedAt = moment(ret.updatedAt)
        .tz("Asia/Seoul")
        .format("YYYY-MM-DD HH:mm:ss");
    },
  });
};
