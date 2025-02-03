import { Injectable } from '@nestjs/common';
import { Pokemon, ReplayData } from './types/game.types';
import { Action } from './types/game.types';
import { UtilityService } from './services/utility.service';
import { PokemonTxtForIAService } from './services/pokemon-txtForIA.service';
import { DamageTxtForIAService } from './services/damage-txtForIA.service';
import { ActionTxtForIAService } from './services/action-txtForIA.service';

@Injectable()
export class WriteTextForIAService {

    constructor(
        private pokemonTxtForIAService: PokemonTxtForIAService,
        private damageTxtForIAService: DamageTxtForIAService,
        private actionTxtForIAService: ActionTxtForIAService
    ) {}

    translateGameInFr(replayData: ReplayData): string {
        let resultText = '';
    
        // Description du match et des joueurs
        resultText += `Le match oppose ${replayData.game.players[0].name} et ${replayData.game.players[1].name}. \n `;
    
        resultText += `Le joueur ${replayData.game.players[0].name} a les Pokémons suivants : ${replayData.game.players[0].team.map(poke=> this.pokemonTxtForIAService.getPokemonString(poke)).join(', ')}. \n `;
        resultText += `Le joueur ${replayData.game.players[1].name} a les Pokémons suivants : ${replayData.game.players[1].team.map(poke=> this.pokemonTxtForIAService.getPokemonString(poke)).join(', ')}. \n `;
    
        resultText += 'Le match commence ! \n ';
        resultText += this.pokemonTxtForIAService.getLeads(replayData);
    
        // Actions des tours
        replayData.game.game_info.turns.forEach(turn => {
            resultText += `Tour ${turn.turn_number} :\n `;
            // if(turn.turn_number == 4) console.log(turn);
            turn.actions.forEach(action => {
                // if(turn.turn_number > 4) console.log(action);
                if (action.action === 'switch') {
                  resultText += `${action.pokemon} est envoyé au combat. \n `;
                } else if (action.action === 'move') {
                    const player = action.player?.includes("p2") ? replayData.game.players[1].name : replayData.game.players[0].name;
                    const resisted = this.damageTxtForIAService.getResisted(action);
                    const moveDamage = resisted != '' ? this.damageTxtForIAService.getMoveDamage(action).replace('\n', '') : this.damageTxtForIAService.getMoveDamage(action);
                    const missed = action.miss ? ' mais ça rate' : '';
                    const targets = this.actionTxtForIAService.getActionTarget(action, replayData);
                    const boost = this.actionTxtForIAService.getBoost(action, moveDamage);
                    const unboost = this.actionTxtForIAService.getUnboost(action, moveDamage);
                    const redirected = action.redirected ? `est redirigé vers ${action.target} et ` : '';
                    const move = this.actionTxtForIAService.getMove(action)
                    resultText += action.playerTarget != action.player ? `${action.pokemon} de ${player} ${redirected} utilise ${move} ${targets} ${unboost} ${moveDamage}${missed}${boost}${resisted}. \n ` : `${action.pokemon} de ${player} ${redirected}  utilise ${move}${missed}${boost}${unboost}. \n `;
                } else if (action.action === 'terastallize') {
                    resultText += `${action.pokemon} Terastallise ${action.pokemon} en type ${action.type}. \n `;
                } else if (action.action === 'faint') {
                    resultText += `${action.pokemon} est KO! \n `;
                } else if (action.action === 'boost') {
                    resultText += this.actionTxtForIAService.getBoost(action);
                } else if (action.action === 'unboost') {
                    resultText += `${action.pokemon} perd un boost de statistique : ${action.unboost}. \n `;
                } else if (action.action === 'ability') {
                    resultText += `${action.pokemon} utilise sont talent : ${action.move}. \n `;
                } else if (action.action === 'fail') {
                    resultText += this.actionTxtForIAService.getFail(action,replayData);
                } else if(action.action === 'immune'){
                    resultText += this.actionTxtForIAService.getImmune(action);
                } else if(action.action === 'activate'){
                    resultText += this.actionTxtForIAService.getActivate(action, replayData);
                } else if(action.action === 'start'){
                    resultText += this.actionTxtForIAService.getStart(action);
                } else if(action.action === 'status'){
                    resultText += this.actionTxtForIAService.getStatus(action, replayData);
                } else if(action.action === 'damageFrom'){
                    resultText += this.damageTxtForIAService.getDamageFrom(action, replayData);
                } else if(action.action === 'cant'){
                    resultText += this.actionTxtForIAService.getCant(action, replayData);
                } else if(action.action === 'sideend'){
                    resultText += this.actionTxtForIAService.getSideend(action);
                } else if(action.action === 'curestatus'){
                    resultText += this.actionTxtForIAService.getCurestatus(action, replayData);
                } else if(action.action === 'enditem'){
                    const boost = this.actionTxtForIAService.getBoost(action);
                    const unboost = this.actionTxtForIAService.getUnboost(action, '');
                    const player = action.player?.includes("p2") ? replayData.game.players[1].name : replayData.game.players[0].name;
                    resultText += `${action.target} de ${player} utilise son item ${action.move} ${boost}${unboost}. \n `;
                } else if(action.action === 'end'){
                    resultText += this.actionTxtForIAService.getEnd(action, replayData);
                } else if(action.action === 'clearboost'){
                    resultText += this.actionTxtForIAService.getClearboost(action, replayData);
                } else if(action.action === 'forfeit'){
                    resultText += `${action.player?.replace('forfeited','').replace('.','').trim()} a abandonné. \n `;
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
}
