declare module 'cookie-parser' {
  import type { RequestHandler } from 'express';

  interface CookieParseOptions {
    secret?: string;
    decode?(val: string): string;
  }

  interface CookieParserStatic {
    (secret?: string | string[], options?: CookieParseOptions): RequestHandler;
    JSONCookie(val: string): any;
    JSONCookies(obj: Record<string, unknown>): Record<string, unknown>;
    signedCookie(val: string, secret: string | string[]): string | false;
    signedCookies(obj: Record<string, unknown>, secret: string | string[]): Record<string, unknown>;
  }

  const cookieParser: CookieParserStatic;
  export = cookieParser;
}
