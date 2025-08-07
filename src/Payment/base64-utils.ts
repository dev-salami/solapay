/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Base64 Object Encoder/Decoder Utility
 * Converts JavaScript objects to Base64 encoded strings and back
 */
export class Base64Utils {
  /**
   * Encodes any JavaScript object/array to a Base64 string
   * @param data - The data to encode (object, array, string, number, etc.)
   * @returns Base64 encoded string
   * @throws Error if encoding fails
   */
  static encode(data: any): string {
    try {
      const jsonString = JSON.stringify(data);
      return Buffer.from(jsonString, "utf8").toString("base64");
    } catch (error) {
      throw new Error(
        `Failed to encode data: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Decodes a Base64 string back to the original JavaScript object/array
   * @param encodedString - The Base64 encoded string to decode
   * @returns The original decoded data
   * @throws Error if decoding fails or string is invalid
   */
  static decode<T = any>(encodedString: string): T {
    try {
      const jsonString = Buffer.from(encodedString, "base64").toString("utf8");
      return JSON.parse(jsonString) as T;
    } catch (error) {
      throw new Error(
        `Failed to decode Base64 string: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Checks if a string is a valid Base64 encoded string
   * @param str - String to validate
   * @returns true if valid Base64, false otherwise
   */
  static isValidBase64(str: string): boolean {
    try {
      // Check if string matches Base64 pattern
      const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/;
      if (!base64Pattern.test(str)) {
        return false;
      }

      // Try to decode and re-encode to verify
      const decoded = Buffer.from(str, "base64").toString("utf8");
      const reencoded = Buffer.from(decoded, "utf8").toString("base64");
      return reencoded === str;
    } catch {
      return false;
    }
  }

  /**
   * Safely decodes a Base64 string, returning null if invalid
   * @param encodedString - The Base64 encoded string to decode
   * @returns The decoded data or null if invalid
   */
  static safeDecode<T = any>(encodedString: string): T | null {
    try {
      return this.decode<T>(encodedString);
    } catch {
      return null;
    }
  }

  /**
   * Encodes data with URL-safe Base64 (replaces +/= with -_)
   * @param data - The data to encode
   * @returns URL-safe Base64 encoded string
   */
  static encodeUrlSafe(data: any): string {
    try {
      const base64 = this.encode(data);
      return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
    } catch (error) {
      throw new Error(
        `Failed to encode data as URL-safe: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Decodes URL-safe Base64 string back to original data
   * @param urlSafeString - URL-safe Base64 encoded string
   * @returns The original decoded data
   */
  static decodeUrlSafe<T = any>(urlSafeString: string): T {
    try {
      // Add padding back if needed
      const padding = "=".repeat((4 - (urlSafeString.length % 4)) % 4);
      const base64 =
        urlSafeString.replace(/-/g, "+").replace(/_/g, "/") + padding;

      return this.decode<T>(base64);
    } catch (error) {
      throw new Error(
        `Failed to decode URL-safe Base64: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
