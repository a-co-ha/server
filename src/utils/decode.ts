export const decode = (
  target: string,
  encoding: BufferEncoding,
  format: BufferEncoding
): string => {
  return Buffer.from(target, encoding).toString(format);
};

export const enum ENCTYPE {
  BASE64 = "base64",
  UTF8 = "utf-8",
}
