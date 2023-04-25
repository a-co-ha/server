import { BookmarkInterface } from "./../interface/bookmarkInterface";
import { SessionData } from "express-session";
import { REDIS_TTL } from "../constants";
import { User, Message, MessageAttributes, PrivateMessage } from "../interface";
import { redisClient } from "./redisClient";

class RedisHelper {
  static async setWithExpiration(key: string, value: any, expiration: number) {
    await redisClient.setEx(key, expiration, JSON.stringify(value));
  }
}

export class RedisHandler {
  static USER_PREFIX = "user:";
  static SESSION_PREFIX = "session:";
  static MESSAGE_PREFIX = "messages:";
  static BOOKMARK_PREFIX = "bookMark:";

  static async saveUserSession(
    userID: number,
    sessionID: string
  ): Promise<void> {
    const key = `${RedisHandler.USER_PREFIX}${userID}`;
    const value = { sessionID };

    await RedisHelper.setWithExpiration(key, value, REDIS_TTL.DAY);
  }

  static async getUserSession(userID: number): Promise<SessionData> {
    const key = `${RedisHandler.USER_PREFIX}${userID}`;
    const value = await redisClient.get(key);

    return value ? JSON.parse(value) : null;
  }

  static async findSession(id: string): Promise<User> {
    const key = `${RedisHandler.SESSION_PREFIX}${id}`;
    const value = await redisClient.get(key);

    if (!value) {
      throw Error(`세션을 찾을 수 없습니다. sessionID : ${id}`);
    }

    return JSON.parse(value).user;
  }

  static async findMessages(roomId: string): Promise<MessageAttributes[]> {
    const key = `${RedisHandler.MESSAGE_PREFIX}${roomId}`;
    const results = await redisClient.lRange(key, 0, -1);

    return results.map((result) => JSON.parse(result));
  }

  static async findMemberSessions(userIDs: number[]): Promise<string[]> {
    const sessionIDs = await this.findMemberSessionIDs(userIDs);

    const sessionPromises = sessionIDs.map((sessionID) =>
      redisClient.get(`${RedisHandler.SESSION_PREFIX}${sessionID}`)
    );

    const results = await Promise.all(sessionPromises);

    return results.filter((result) => result !== null);
  }

  private static async findMemberSessionIDs(
    userIDs: number[]
  ): Promise<string[]> {
    const keys = userIDs.map(
      (userID) => `${RedisHandler.USER_PREFIX}${userID}`
    );
    const sessionKeys = await redisClient.mGet(keys);

    return sessionKeys
      .map((res) => (res ? JSON.parse(res).sessionID : null))
      .filter((sessionID) => sessionID);
  }

  static async savePrivateMessage(data: PrivateMessage): Promise<void> {
    const { from, to } = data;
    const createAt = new Date();
    const value = JSON.stringify({ ...data, createAt });

    const multi = redisClient.multi();
    multi.rPush(`${RedisHandler.MESSAGE_PREFIX}${from}`, value);
    multi.rPush(`${RedisHandler.MESSAGE_PREFIX}${to}`, value);
    multi.expire(`${RedisHandler.MESSAGE_PREFIX}${from}`, REDIS_TTL.DAY);
    multi.expire(`${RedisHandler.MESSAGE_PREFIX}${to}`, REDIS_TTL.DAY);
    await multi.exec();
  }

  static async saveMessage({ roomId, ...data }: Message): Promise<void> {
    const key = `${RedisHandler.MESSAGE_PREFIX}${roomId}`;
    const value = JSON.stringify(data);

    await redisClient.rPush(key, value);
    await redisClient.expire(key, REDIS_TTL.DAY);
  }

  static async saveBookmark(bookmarkInfo: BookmarkInterface): Promise<void> {
    const key = `${RedisHandler.BOOKMARK_PREFIX}${bookmarkInfo.roomId}`;
    const value = JSON.stringify({ bookmarkInfo });

    await redisClient.setEx(key, REDIS_TTL.DAY, value);
  }

  static async delete(key: string): Promise<void> {
    const sessionKey = `${RedisHandler.SESSION_PREFIX}${key}`;
    await redisClient.del(sessionKey);
  }
}

// 데이터베이스 클라이언트는 보통
// 전역으로 사용하기 위해서 static함수로 만듦.
