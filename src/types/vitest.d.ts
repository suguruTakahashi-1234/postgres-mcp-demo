// src/types/vitest.d.ts
/// <reference types="vitest" />

declare module "vitest" {
  interface Assertion {
    toEqualWithDates(expected: any): void;
  }
}

// カスタムマッチャー追加のための型定義
declare global {
  namespace Vi {
    interface Assertion {
      toEqualWithDates(expected: any): void;
    }
  }
  
  namespace Vitest {
    interface Assertion {
      toEqualWithDates(expected: any): void;
    }
  }
  
  // 2025年最新版のVitestの互換性対応
  namespace Matchers {
    interface Matchers<R> {
      toEqualWithDates(expected: any): R;
    }
    interface AsyncMatchers<R> {
      toEqualWithDates(expected: any): Promise<R>;
    }
  }
}
