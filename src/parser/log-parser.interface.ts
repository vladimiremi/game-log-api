export interface ParsedMatchStarted {
  type: 'match_started';
  matchId: number;
  timestamp: Date;
}

export interface ParsedMatchEnded {
  type: 'match_ended';
  matchId: number;
  timestamp: Date;
}

export interface ParsedKill {
  type: 'kill';
  timestamp: Date;
  killer: string;
  victim: string;
  weapon: string;
}

export type ParsedLogEvent = ParsedMatchStarted | ParsedMatchEnded | ParsedKill;
