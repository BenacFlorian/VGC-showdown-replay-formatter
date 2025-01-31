import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Observable, from, map, mergeMap, catchError, forkJoin } from 'rxjs';
import { ReplayData, Player, Pokemon, Turn, Action } from './types/game.types';
import { resourceUsage } from 'process';
import { UtilityService } from './utility.service';

@Injectable()
export class AppService {
  constructor(
    private readonly httpService: HttpService,
    private readonly utilityService: UtilityService
  ) {}

  private parseGameJson(rawData: string): ReplayData | null {
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
    let currentTurn: number | null = null;

    for (const line of lines) {
        const parts = line.split('|').filter(Boolean);
        if (parts.length < 2) continue;

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
            
            case '-boost':
              turnActions[turnActions.length - 1].boost = `${parts[2]} ${parts[3]}`;
              break;

            case '-resisted':
              turnActions[turnActions.length - 1].resisted = (turnActions[turnActions.length - 1].resisted || '') + parts[1] + ' |';
              break;

            case '-miss':
              turnActions[turnActions.length - 1].miss = true;
              break;

            case '-unboost':
              turnActions[turnActions.length - 1].unboost = `${parts[2]} ${parts[3]}`;
              break;

            case '-damage':
              turnActions[turnActions.length - 1].damage = (turnActions[turnActions.length - 1].damage || '') + parts[1] + '*' + parts[2] + ' |';
              break;

            case 'switch':
                turnActions.push({
                    player: parts[1].split(':')[0],
                    pokemon: parts[2].split(', ')[0],
                    action: 'switch',
                    status: parts[3]
                });
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

  formatReplay(data: string[]): Observable<string> {
    const requests = data.map(url =>
      this.httpService.get(url).pipe(
        map(response => response.data),
        map(text => this.parseGameJson(text)),
        map(text => this.translateGameInFr(text as ReplayData)),
        catchError(error => {
          console.error(`Erreur pour l'URL ${url}:`, error);
          return from([null]);
        })
      )
    );

    return forkJoin(requests).pipe(
      map(results => JSON.stringify(results)),
      catchError(error => {
        console.error('Erreur lors du traitement:', error);
        throw error;
      })
    );
  }

  translateGameInFr(replayData: ReplayData): string {
    let resultText = '';

    // Description du match et des joueurs
    resultText += `Le match oppose ${replayData.game.players[0].name} et ${replayData.game.players[1].name}. \n `;

    // replayData.game.players[1].name == p2

    // Actions des tours
    replayData.game.game_info.turns.forEach(turn => {
        resultText += `Tour ${turn.turn_number} :\n `;
        turn.actions.forEach(action => {
            if (action.action === 'switch') {
              resultText += `${action.pokemon} est envoyé au combat. \n `;
            } else if (action.action === 'move') {
                const player = action.player?.includes("p2") ? replayData.game.players[1].name : replayData.game.players[0].name;
                const playerTarget = action.playerTarget?.includes("p1") ? replayData.game.players[0].name : replayData.game.players[1].name;
                const resisted = this.getResisted(action);
                const moveEffect = resisted != '' ? this.getMoveEffect(action).replace('\n', '') : this.getMoveEffect(action);
                const missed = action.miss ? ' mais ça rate' : '';
                const targets = this.getActionTarget(action, replayData);
                const boost = action.boost ? `, et augmente ses statistiques : ${action.boost}` : '';
                const unboost = action.unboost ? `, et perd un boost de statistique : ${action.unboost}` : '';
                const redirected = action.redirected ? `est redirigé vers ${action.target} et ` : '';
                resultText += action.playerTarget != action.player ? `${action.pokemon} de ${player} ${redirected} utilise ${action.move} ${targets} ${unboost} ${moveEffect}${missed}${boost}${resisted}. \n ` : `${action.pokemon} de ${player} ${redirected}  utilise ${action.move}${missed}${boost}${unboost}. \n `;
            } else if (action.action === 'terastallize') {
                resultText += `${action.pokemon} Terastallise ${action.pokemon} en type ${action.type}. \n `;
            } else if (action.action === 'faint') {
                resultText += `${action.pokemon} est KO! \n `;
            } else if (action.action === 'boost') {
                resultText += `${action.pokemon} augmente ses statistiques : ${action.boost}. \n `;
            } else if (action.action === 'unboost') {
                resultText += `${action.pokemon} perd un boost de statistique : ${action.boost}. \n `;
            }
        });
    });

    // Résultat final
    resultText += `Le gagnant est ${replayData.game.final_result.winner}.`;
    if (replayData.game.final_result.forfeited) {
        resultText += ` ${replayData.game.final_result.forfeited} a abandonné.`;
    }

    return resultText;
  }

  getActionTarget(action: Action, replayData: ReplayData): string {
    if (action.target?.includes('spread')){
      const playerTarget = action.playerTarget?.includes("p1") ? replayData.game.players[0].name : replayData.game.players[1].name;
      const targets = action.damage?.split(' |').filter(item=> !!item && item != '').map(item=> item.split('*')[0].trim().split(':')[1]) || [];
      return ' sur ' + this.utilityService.formatList(targets) + ' de ' + playerTarget;
    }else{
      const playerTarget = action.playerTarget?.includes("p1") ? replayData.game.players[0].name : replayData.game.players[1].name;
      const actionTarget = action.playerTarget != action.player ? `${action.target} de ${playerTarget}` : '';
      return action.playerTarget == '[still]' ? ' et disparait ' : ' sur ' + actionTarget;
    }

  }

  getMoveEffect(action: Action): string {
    if(!action.damage) return '';
    const damage_list = action.damage?.split(' |').filter(item=> !!item && item != '').map(damage=> {
      const damageTarget = damage.split('*')[0].trim().split(':')[1];
      let damageValue = damage.split('*')[1].trim().replace(' |', '');
      if(damageValue == '0 fnt') damageValue = 'KO';
      return {
        damageTarget: damageTarget.trim(),
        damageValue: damageValue.trim()
      }
    });
    let moveEffect = ', ';
    if(damage_list.length > 1) {
      if(damage_list[0].damageValue == 'KO' && damage_list[1].damageValue == 'KO') {
        moveEffect += `ça met ${damage_list[0].damageTarget} et ${damage_list[1].damageTarget} KO \n `;
      }
      if(damage_list[0].damageValue == 'KO' && damage_list[1].damageValue != 'KO') {
        moveEffect += `ça met ${damage_list[0].damageTarget} KO et laisse ${damage_list[1].damageValue} de point de vie à ${damage_list[1].damageTarget} \n `;
      }
      if(damage_list[0].damageValue != 'KO' && damage_list[1].damageValue == 'KO') {
        moveEffect += `ça met ${damage_list[1].damageTarget} KO et laisse ${damage_list[0].damageValue} de point de vie à ${damage_list[0].damageTarget} \n `;
      }
    }else{
      if(damage_list[0].damageValue == 'KO') {
        moveEffect += `ça met ${damage_list[0].damageTarget} KO `;
      }else{
        moveEffect += `et lui laisse ${damage_list[0].damageValue} de point de vie `;
      }
    }
    return moveEffect;
  }

  getResisted(action: Action): string {
    if(!action.resisted) return '';
    const resisted_list = action.resisted?.split(' |').filter(item=> !!item && item != '').map(item=> item.split(':')[1].trim()) || [];
    return resisted_list?.length > 1 ?  `, et ça a été résisté par ${resisted_list[0]} et ${resisted_list[1]}` : `, et ça a été résisté par ${resisted_list[0]}`;
  }
}
