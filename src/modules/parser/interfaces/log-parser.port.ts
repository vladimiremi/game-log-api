import type { ParsedLogEvent } from './log-parser.interface';

export const LOG_PARSER = Symbol('LOG_PARSER');

export interface ILogParser {
  parseLog(logContent: string): ParsedLogEvent[];
}
