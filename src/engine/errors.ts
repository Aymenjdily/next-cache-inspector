export type EngineErrorCode = "NO_APP_DIR" | "EMPTY_SCAN" | "PARSE_ERROR";

/**
 * Error type used by the engine public API.
 */
export class EngineError extends Error {
  public readonly code: EngineErrorCode;

  public constructor(code: EngineErrorCode, message: string) {
    super(message);
    this.name = "EngineError";
    this.code = code;
  }
}
