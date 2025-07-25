export interface Pokemon {
  pokemon: string;
  level: number;
  item: string;
  ability: string;
  moves: string[];
  nickname?: string;
}

export interface Damage {
  damageTarget: string;
  damageTargetId: string;
  damageValue: string;
}

export interface DamageByTarget {
  damageTargetId: string;
  damages: Damage[];
  damageTarget: string;
}

export interface Player {
  id: string;
  name: string;
  rating?: number;
  new_rating?: number;
  team: Pokemon[];
}

export interface Action {
  player?: string;
  pokemon?: string;
  action: string;
  move?: string;
  target?: string;
  pv?: string;
  targets?: string[];
  status?: string;
  damage?: string; 
  itemPokemonMoving?: string;
  miss?: boolean;
  type?: string;
  boost?: string;
  unboost?: string;
  resisted?: string;
  redirected?: boolean;
  playerTarget?: string;
  from?: string;
  fromDetail?: string;
  isSamePlayerWhoFail?: boolean;
}

export interface Turn {
  turn_number: number;
  actions: Action[];
}

export interface GameInfo {
  game_type: string;
  leads: string[];
  start_time: number;
  tier: string;
  rules: string[];
  turns: Turn[];
}

export interface FinalResult {
  winner: string;
  forfeited?: string;
}

export interface Game {
  players: Player[];
  game_info: GameInfo;
  final_result: FinalResult;
}

export interface ReplayData {
  annotations: string;
  pov: string;
  game: Game;
} 

export interface SheetResult {
  prompt: string;
  response: string;
}
