import { PrismaClient } from '@prisma/client';

// 実際にテストは動作しているので、型エラーは無視します
import { beforeEach, afterEach, expect, vi } from 'vitest';

// カスタムマッチャーを追加して日付の比較問題を解決
declare global {
  interface ViAssertion {
    toEqualWithDates(expected: any): void;
  }
  
  // Vitestの最新バージョン用の型定義
  interface VitestAssertion {
    toEqualWithDates(expected: any): void;
  }
}

expect.extend({
  toEqualWithDates(received: any, expected: any) {
    // JSONを通して日付をシリアライズして比較
    const serializedReceived = JSON.parse(JSON.stringify(received));
    const serializedExpected = JSON.parse(JSON.stringify(expected));
    
    const pass = this.equals(serializedReceived, serializedExpected);
    
    return {
      pass,
      message: () => `expected ${this.utils.printReceived(received)} ${pass ? 'not ' : ''}to equal ${this.utils.printExpected(expected)} after date serialization`,
    };
  },
});

// Create a mock PrismaClient
vi.mock('@prisma/client', () => {
  const mockPrismaClient = vi.fn(() => ({
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    post: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    $disconnect: vi.fn(),
  }));
  
  return {
    PrismaClient: mockPrismaClient,
  };
});

// Mock the prisma client
vi.mock('../lib/prisma', () => {
  return {
    default: new PrismaClient(),
  };
});

// Reset all mocks before each test
beforeEach(() => {
  vi.resetAllMocks();
});

// Clear all mocks after each test
afterEach(() => {
  vi.clearAllMocks();
});
