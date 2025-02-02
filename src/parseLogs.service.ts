import { Injectable } from '@nestjs/common';
import { Player, Pokemon, ReplayData, Action } from './types/game.types';

@Injectable()
export class ParseLogsService {

    public parseGameJson(rawData: string): ReplayData | null {
        const lines = rawData.split('\n');
        const replayData: ReplayData = {
            annotations: "",
            pov: "",
            game: {
                players: [],
                game_info: {
                    start_time: 0,
                    game_type: "",
                    tier: "",
                    rules: [],
                    leads: [],
                    turns: []
                },
                final_result: {
                    winner: "",
                    forfeited: ""
                }
            }
        };
    
        let players: { [key: string]: Player } = {};
        let turnActions: Action[] = [];
        let currentTurn: number = 0;
        let leadSent = 0;
        let gameStarted = false;
        for (const line of lines) {
            const parts = line.split('|').filter(Boolean);
             console.log(parts);
            if (parts.length < 2 && parts[0] != 'start') continue;
    
            switch (parts[0]) {
                case 't:':
                    replayData.game.game_info.start_time = parseInt(parts[1], 10);
                    break;
    
                case 'gametype':
                    replayData.game.game_info.game_type = parts[1];
                    break;
    
                case 'gen':
                    // On peut ignorer la génération ici, mais elle peut être ajoutée si nécessaire.
                    break;
    
                case 'tier':
                    replayData.game.game_info.tier = parts[1];
                    break;
    
                case 'rule':
                    replayData.game.game_info.rules.push(parts[1]);
                    break;
    
                case 'player':
                    const playerKey = parts[1];
                    players[playerKey] = {
                        name: parts[2],
                        id: parts[1],
                        rating: parts[3] ? parseInt(parts[3], 10) : undefined,
                        new_rating: parts[4] ? parseInt(parts[4], 10) : undefined,
                        team: []
                    };
                    replayData.game.players.push(players[playerKey]);
                    break;
    
                case 'poke':
                    if (players[parts[1]]) {
                        const [pokemonName, level, gender] = parts[2].split(', ');
                        players[parts[1]].team.push({
                            pokemon: pokemonName,
                            level: parseInt(level.replace('L', ''), 10),
                            item: '', // Item non spécifié, à définir si besoin
                            ability: '', // Ability non spécifiée, à définir si besoin
                            moves: [] // Les mouvements doivent être extraits ailleurs
                        });
                    }
                    break;
    
                case 'turn':
                    // pour pouvoir debugger que jusqu'au tour X
                    if(parseInt(parts[1]) > 5){
                        return replayData;
                    }
                    if(parts[1] == '1'){
                        gameStarted = true;
                    }
                    if (currentTurn !== null) {
                        replayData.game.game_info.turns.push({
                            turn_number: currentTurn,
                            actions: [...turnActions]
                        });
                    }
                    currentTurn = parseInt(parts[1], 10);
                    turnActions = [];
                    break;
    
                case 'move':                
                    turnActions.push({
                      player: parts[1].split(':')[0],
                      pokemon: parts[1].split(':')[1], // Le Pokémon qui joue
                      action: 'move',
                      redirected: parts.length > 4 && parts[4].includes('[from]lockedmove') ? true : false,
                      move: parts[2],
                      playerTarget: parts[3].split(':')[0],
                      target: parts.length > 4 && parts[4].includes('spread')? parts[4] : parts[3].split(':')[1]
                    });
                    break;

                case '-ability':  
                    turnActions.push({
                        player: parts[1].split(':')[0],
                        pokemon: parts[1].split(':')[1], // Le Pokémon qui joue
                        action: 'ability',
                        move: parts[2],
                        playerTarget: parts[3].split(':')[0],
                        target: parts.length > 4 && parts[4].includes('spread')? parts[4] : parts[3].split(':')[1]
                    });
                    break;
                case '-immune':
                    turnActions.push({
                        action: 'immune',
                        from: parts.length > 3 && parts[2].includes('[from]') ? parts[2].replace('[from]', '') : '',
                        move: turnActions[turnActions.length - 1].move,
                        target : parts[1].split(':')[1],
                        playerTarget: parts[1].split(':')[0],
                    });
                    break;

                case '-start': 
                    console.log(parts);
                    turnActions.push({
                        action: 'start',
                        from: parts.length > 3 ? parts[3].replace('[','').replace(']','').replace('of','') : '',
                        move: parts[2],
                        target : parts[1].split(':')[1],
                        playerTarget: parts[1].split(':')[0],
                    });
                    break;
                case '-fail':  
                    turnActions.push({
                        action: 'fail',
                        from: parts.length > 3 && parts[3].includes('[from]') ? parts[3].replace('[from]', '') : '',
                        move: parts[2],
                        target : parts[1].split(':')[1],
                        playerTarget: parts[1].split(':')[0],
                    });
                    break;
                
                case '-boost':
                  if(this.getLastIndexTurnActionMove(turnActions) != -1){
                    turnActions[this.getLastIndexTurnActionMove(turnActions)].boost = `${parts[2]} ${parts[3]}`;
                  }
                  break;
    
                case '-resisted':
                  if(this.getLastIndexTurnActionMove(turnActions) != -1){
                    turnActions[this.getLastIndexTurnActionMove(turnActions)].resisted = (turnActions[this.getLastIndexTurnActionMove(turnActions)].resisted || '') + parts[1] + ' |';
                  }
                  break;
    
                case '-miss':
                  if(this.getLastIndexTurnActionMove(turnActions) != -1){
                    turnActions[this.getLastIndexTurnActionMove(turnActions)].miss = true;
                  }
                break;
    
                case '-activate':
                  turnActions.push({
                    action: 'activate',
                    from: parts.length > 3 && parts[3].includes('[from]') ? parts[3].replace('[from]', '') : '',
                    move: parts[2],
                    target : parts[1].split(':')[1],
                    playerTarget: parts[1].split(':')[0],
                  });
                  // turnActions[turnActions.length - 1].activate = true;
                  break;
            
                case '-unboost':
                  const previousTurnPlayer = turnActions[turnActions.length - 1].player;
                  if(previousTurnPlayer == parts[1].split(':')[0]){
                    // unboost is for the same pokemon with move this turn (close combat/make it rain...)
                    if(!!turnActions[turnActions.length - 1].unboost){
                        turnActions[turnActions.length - 1].unboost += `, ${parts[2]} ${parts[3]}`;
                    }else{
                        turnActions[turnActions.length - 1].unboost = `${parts[2]} ${parts[3]}`;
                    }
                  }else{          
                    // unboost is due to an other pokemon than the one who's unboosted                   
                    turnActions.push({
                        player: parts[1].split(':')[0],
                        pokemon: parts[1].split(':')[1], // Le Pokémon qui joue
                        action: 'unboost',
                        unboost: `${parts[2]} ${parts[3]}`,
                        playerTarget: parts[3].split(':')[0],
                        target: parts.length > 4 && parts[4].includes('spread')? parts[4] : parts[3].split(':')[1]
                    });
                  }
                  break;
    
                case '-damage':
                  if(this.getLastIndexTurnActionMove(turnActions) != -1){
                    turnActions[this.getLastIndexTurnActionMove(turnActions)].damage = (turnActions[this.getLastIndexTurnActionMove(turnActions)].damage || '') + parts[1] + '*' + parts[2] + ' |';
                  }
                  break;
    
                case 'switch':
                    if(leadSent < 4){
                        replayData.game.game_info.leads.push(parts[1]);   
                        leadSent++;
                    }else{
                        turnActions.push({
                            player: parts[1].split(':')[0],
                            pokemon: parts[2].split(', ')[0],
                            action: 'switch',
                            status: parts[3]
                        });
                    }
                    break;
    
                case 'faint':
                    turnActions.push({
                        player: parts[1].split(':')[0],
                        pokemon: parts[1].split(': ')[1],
                        action: 'faint'
                    });
                    break;
    
                case 'terastallize':
                    turnActions.push({
                        player: parts[1].split(':')[0],
                        action: 'terastallize',
                        pokemon: parts[1].split(': ')[1],
                        type: parts[2]
                    });
                    break;
    
                case 'win':
                    replayData.game.final_result.winner = parts[1];
                    break;
    
                case 'forfeit':
                    turnActions.push({
                        player: parts[1].split(':')[0],
                        action: 'forfeit'
                    } as Action);
                    replayData.game.final_result.forfeited = parts[1].split(':')[0];
                    break;
    
                case 'showteam': 
                    const indx = replayData.game.players.findIndex(player => player.id == parts[1]);
                    replayData.game.players[indx].team = this.getTeam(parts, replayData.game.players[indx]);
                    break;
                case 'start':
                    leadSent = 0;
                    break;
            }
        }
        if (currentTurn !== null) {
            replayData.game.game_info.turns.push({
                turn_number: currentTurn,
                actions: [...turnActions]
            });
        }
    
        replayData.pov = players['p1'].name;
        return replayData;
      }

      private getLastIndexTurnActionMove(turnActions: Action[]): number {
        // Si le tableau est vide, retourne -1 pour indiquer qu'aucun move n'a été trouvé
        if(turnActions.length == 0) return -1;
        
        // Parcours le tableau depuis la fin
        for(let i = turnActions.length - 1; i >= 0; i--) {
            if(turnActions[i].action === 'move') {
                return i;
            }
        }
        
        // Si aucun move n'est trouvé, retourne -1
        return -1;
      }
    
      private getTeam(parts: string[], player: Player): Pokemon[] {
        const team = parts.filter(part => !part.includes(player.id) && !part.includes('showteam')).join('|').split(']');
        return team.map(poke=>{
          const dataPoke = poke.split('|');
          return {        
            pokemon: dataPoke[0],
            level: ["F","M"].includes(dataPoke[4]) ? parseInt(dataPoke[5]) : parseInt(dataPoke[4]),
            item: dataPoke[1],
            ability: dataPoke[2],
            moves: dataPoke[3].split(',')
          } as Pokemon;
        });
      }
}
