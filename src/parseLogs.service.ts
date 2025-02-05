import { Injectable } from '@nestjs/common';
import { Player, Pokemon, ReplayData, Action } from './types/game.types';
import { time } from 'console';

@Injectable()
export class ParseLogsService {

    public parseGameJson(rawData: string): ReplayData | null {
        const lines = rawData.split('\n');
        let replayData: ReplayData = {
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
        let previousTurnPlayer;
        let gameStarted = false;
        for (const line of lines) {
            const parts = line.split('|').filter(Boolean);
            // console.log(parts);
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
                    if(parseInt(parts[1]) > 13){
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
                    const pokemonMoving = this.getPokemonMovingFromTeam(parts, replayData);
                    turnActions.push({
                      player: parts[1].split(':')[0],
                      pokemon: parts[1].split(':')[1], // Le Pokémon qui joue
                      action: 'move',
                      itemPokemonMoving: pokemonMoving?.item,
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
                        playerTarget: parts.length > 3 ? parts[3].split(':')[0] : 'all',
                        target: parts.length > 4 && parts[4].includes('spread')? parts[4] : (parts.length > 3 ? parts[3].split(':')[1] : 'all')
                    });
                    break;
                case '-immune':
                    turnActions.push({
                        action: 'immune',
                        from: parts.length > 2 && parts[2].includes('[from]') ? parts[2].replace('[from]', '') : '',
                        move: turnActions[turnActions.length - 1].move,
                        target : parts[1].split(':')[1],
                        playerTarget: parts[1].split(':')[0],
                    });
                    break;

                case '-enditem':
                    turnActions.push({
                        action: 'enditem',
                        move: parts[2],
                        player : parts[1].split(':')[0],
                        pokemon : parts[1].split(':')[1],
                        target : parts[1].split(':')[1],
                        playerTarget: parts[1].split(':')[0],
                    });
                    break;
                case '-end':
                    if(parts[3] != '[silent]'){
                        turnActions.push({
                            action: 'end',
                            move: parts[2],
                            player : parts[1].split(':')[0],
                            playerTarget : parts[1].split(':')[0],
                            pokemon : parts[1].split(':')[1],
                            target : parts[1].split(':')[1],
                        });
                    }
                    break;

                case 'cant' : 
                    turnActions.push({
                        action: 'cant',
                        from: parts.length > 1 ? parts[2] : '',
                        target : parts[1].split(':')[1],
                        playerTarget: parts[1].split(':')[0],
                    });
                    break;

                case '-curestatus' : 
                    turnActions.push({
                        action: 'curestatus',
                        from: parts.length > 1 ?  parts[2] : '',
                        target : parts[1].split(':')[1],
                        playerTarget: parts[1].split(':')[0],
                    });
                    break;

                case '-start': 
                    turnActions.push({
                        action: 'start',
                        from: parts.length > 3 ? parts[3].replace('[','').replace(']','').replace('of','') : '',
                        move: parts[2],
                        target : parts[1].split(':')[1],
                        playerTarget: parts[1].split(':')[0],
                    });
                    break;

                case '-sideend': 
                    turnActions.push({
                        action: 'sideend',
                        move: parts[2],
                        playerTarget: parts[1].split(':')[1],
                    });
                    break;
                case '-fail':  
                    const previousAction = turnActions[turnActions.length - 1];
                    if(previousAction.playerTarget == '[still]'){
                        turnActions[turnActions.length - 1].playerTarget = parts[1].split(':')[0];
                    }

                    let isSamePlayerWhoFail = false;
                    if(this.getLastIndexTurnActionMove(turnActions) != -1){
                        isSamePlayerWhoFail = turnActions[this.getLastIndexTurnActionMove(turnActions)].playerTarget == parts[1].split(':')[0];
                    }
                    turnActions.push({
                        action: 'fail',
                        from: parts.length > 3 && parts[3].includes('[from]') ? parts[3].replace('[from]', '') : '',
                        move: parts[2] || previousAction.move,
                        target : parts[1].split(':')[1],
                        playerTarget: parts[1].split(':')[0],
                        isSamePlayerWhoFail: isSamePlayerWhoFail
                    });
                    break;
                
                case '-clearboost': 
                    turnActions.push({
                        action: 'clearboost',
                        playerTarget: parts[1].split(':')[0],
                        target: parts[1].split(':')[1],
                    });
                    break;
                
                case '-boost':
                  previousTurnPlayer = turnActions[turnActions.length - 1].player;
                  if(previousTurnPlayer == parts[1].split(':')[0]){
                    // boost is for the same pokemon with move this turn (close combat/make it rain...)
                    if(!!turnActions[turnActions.length - 1].boost){
                        turnActions[turnActions.length - 1].boost += `, ${parts[2]} ${parts[3]}`;
                    }else{
                        turnActions[turnActions.length - 1].boost = `${parts[2]} ${parts[3]}`;
                    }
                  }else{          
                    // boost is due to an other pokemon than the one who's unboosted                   
                    turnActions.push({
                        player: parts[1].split(':')[0],
                        pokemon: parts[1].split(':')[1], // Le Pokémon qui joue
                        action: 'boost',
                        boost: `${parts[2]} ${parts[3]}`,
                        playerTarget: parts[3].split(':')[0],
                        target: parts.length > 4 && parts[4].includes('spread')? parts[4] : parts[3].split(':')[1]
                    });
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
                  break;
            
                case '-unboost':
                  previousTurnPlayer = turnActions[turnActions.length - 1].player;
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
                    if(parts.length > 3 && parts[3].includes('from')){
                        turnActions.push({
                            playerTarget: parts[1].split(':')[0],
                            target: parts[1].split(':')[1],
                            action: 'damageFrom',
                            from: parts[3].replace('[from]', ''),
                            damage: parts[1] + '*' + parts[2]
                        })                        
                    }else{
                        turnActions[this.getLastIndexTurnActionMove(turnActions)].damage = (turnActions[this.getLastIndexTurnActionMove(turnActions)].damage || '') + parts[1] + '*' + parts[2] + ' |';
                    }
                  }
                  break;

                case '-heal': 
                    let isRecoverMove = false;
                    if(this.getLastIndexTurnActionMove(turnActions) != -1){
                        isRecoverMove = turnActions[this.getLastIndexTurnActionMove(turnActions)].move == 'Recover';
                    }
                    if(!isRecoverMove){
                        turnActions.push({
                            action: 'heal',
                            target: parts[1].split(':')[1]?.trim(),
                            playerTarget: parts[1].split(':')[0],
                            from: parts[3]?.replace('[from]',''),
                            pv: parts[2]
                        });
                    }else{
                        if(this.getLastIndexTurnActionMove(turnActions) != -1){
                            turnActions[this.getLastIndexTurnActionMove(turnActions)].pv = parts[2];
                            turnActions[this.getLastIndexTurnActionMove(turnActions)].action = 'heal';
                        }
                    }
                    break;
                
                case '-fieldstart':
                    turnActions.push({
                        action: 'fieldstart',
                        move: parts[1].includes('move') ? parts[1].replace('move: ','') : parts[1],
                        pokemon : parts.length > 3 ? parts[3].split(':')[1]?.trim() : (parts.length > 2 ? parts[2].split(':')[1]?.trim() :  ''),
                        from: parts.length > 2 ? parts[2].replace('[from]','').replace('[of]','') : '', 
                        player: parts.length > 3 ? parts[3].split(':')[0].replace('[of]','') : (parts.length > 2 ? parts[2].split(':')[0].replace('[of]','') : '')
                    });
                    break;
                case '-fieldend':
                    turnActions.push({
                        action: 'fieldend',
                        move: parts[1].split(':')[1],
                    });
                    break;

                case '-status':
                    turnActions.push({
                        playerTarget: parts[1].split(':')[0],
                        target: parts[1].split(': ')[1],
                        action: 'status', 
                        status: parts[2]
                    });
                    break;

                case '-message':
                    if(parts[1].includes('forfeited')){
                        turnActions.push({
                            action: 'forfeit',
                            player: parts[1].split(':')[0],
                        });
                    }
                    break;
    
    
                case 'switch':
                    replayData = this.setNickName(parts,replayData);
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
                case '-crit':
                    turnActions.push({
                        action: 'crit',
                        target: parts[1].split(': ')[1],
                        playerTarget: parts[1].split(':')[0],
                    });
                    break;
                case '-supereffective':
                    turnActions.push({
                        action: 'supereffective',
                        target: parts[1].split(': ')[1],
                        playerTarget: parts[1].split(':')[0],
                    });
                    break;
    
                case '-terastallize':
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
            if(currentTurn > 3){// && turnActions[turnActions.length - 1]?.action == 'heal'){
                // console.log(parts);
                // console.log(turnActions[turnActions.length - 1]);
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

      private setNickName(parts: string[], replayData: ReplayData): ReplayData {
        const playerFromParts = parts[1].split(':')[0];
        const playerIndex = replayData.game.players.findIndex(player=> playerFromParts.replace('a','').replace('b','') == player.id);
        const indexPokemon = playerIndex != -1 ? replayData.game.players[playerIndex].team.findIndex(poke=> poke.pokemon == parts[2].split(', ')[0]) : -1;
        if(indexPokemon != -1){
            const nickname = parts[1].split(':')[1];
            const pokemon = replayData.game.players[playerIndex].team[indexPokemon].pokemon;
            if(nickname.trim() != pokemon.trim()){
                replayData.game.players[playerIndex].team[indexPokemon].nickname = nickname?.trim();
            }
        }
        return replayData;
      }

      private getPokemonMovingFromTeam(parts: string[], replayData: ReplayData): Pokemon {
        const playerFromParts = parts[1].split(':')[0];
        const pokemon = parts[1].split(':')[1];
        const team = replayData.game.players.find(player=> playerFromParts.replace('a','').replace('b','') == player.id)?.team;
        return team?.find(poke=> poke.pokemon == pokemon.trim() || poke.pokemon.includes(pokemon.trim())) as Pokemon;
      }

      private getLastIndexTurnActionMove(turnActions: Action[], action: string = 'move'): number {
        // Si le tableau est vide, retourne -1 pour indiquer qu'aucun move n'a été trouvé
        if(turnActions.length == 0) return -1;
        
        // Parcours le tableau depuis la fin
        for(let i = turnActions.length - 1; i >= 0; i--) {
            if(turnActions[i].action === action) {
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
