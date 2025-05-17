import { Context } from 'hono';

type ErrorResponse = {
  message: string;
  details?: unknown;
};

/**
 * 共通のエラーハンドリング関数
 */
export const handleError = (c: Context, error: unknown, defaultMessage: string, status = 500): Response => {
  console.error(defaultMessage, error);
  
  if (isPrismaError(error) && error.code === 'P2002') {
    return c.json({ message: 'このデータは既に存在します。一意の値を指定してください。' }, 400);
  }
  
  return c.json({ message: defaultMessage }, status);
};

/**
 * Prismaエラーの判定
 */
export const isPrismaError = (error: unknown): error is { code: string } => {
  return typeof error === 'object' && error !== null && 'code' in error;
};
