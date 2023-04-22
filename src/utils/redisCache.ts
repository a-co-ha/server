/* eslint-disable no-var */
import { UserAttributes } from "./../interface/userInterface";
import { redisClient } from "./redisClient";

export default {
  async saveUserSession(userID: number, sessionID: string) {
    await redisClient.setEx(
      `user:${userID}`,
      86400,
      JSON.stringify({ sessionID })
    );
  },

  async getUserSession(userID: number) {
    return JSON.parse(await redisClient.get(`user:${userID}`));
  },

  async findSession(id: string): Promise<UserAttributes> {
    try {
      return JSON.parse(await redisClient.get(`session:${id}`)).user;
    } catch (e) {
      throw Error(`세션을 찾을 수 없습니다. sessionID : ${id}`);
    }
  },

  findMessagesForUser: async (roomId) => {
    return await redisClient
      .lRange(`messages:${roomId}`, 0, -1)
      .then((results) => {
        return results.map((result) => JSON.parse(result));
      });
  },

  findMemberSessions: async (userIDs: number[]): Promise<any> => {
    const userKeys = userIDs.map((userID) => `user:${userID}`);
    const sessionKeys = await redisClient.mGet(userKeys);

    const sessionIDs = sessionKeys
      .map((res) => (res ? JSON.parse(res).sessionID : null))
      .filter((sessionID) => sessionID);

    const sessionPromises = sessionIDs.map((sessionID) =>
      redisClient.get(`session:${sessionID}`)
    );
    const results = await Promise.all(sessionPromises);

    return results.filter((result) => result !== null);
  },

  saveMessage: async (message) => {
    message.createAt = new Date();
    const value = JSON.stringify(message);
    await redisClient
      .multi()
      .rPush(`messages:${message.from}`, value)
      .rPush(`messages:${message.to}`, value)
      .expire(`messages:${message.from}`, 24 * 60 * 60)
      .expire(`messages:${message.to}`, 24 * 60 * 60)
      .exec();
  },
  saveBookmark: async (bookmarkInfo) => {
    bookmarkInfo.createAt = new Date();
    await redisClient.setEx(
      `bookMark:${bookmarkInfo.roomId}`,
      86400,
      JSON.stringify({ bookmarkInfo })
    );
  },
  delete: async (key) => {
    await redisClient.DEL(`session:${key}`);
  },
};
