export const decode = (
  target: string,
  encoding: BufferEncoding,
  format: BufferEncoding
): string => {
  return Buffer.from(target, encoding).toString(format);
};
