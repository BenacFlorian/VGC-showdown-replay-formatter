import { Injectable } from '@nestjs/common';
import { Pokemon, ReplayData } from '../../types/game.types';
import { Action } from '../../types/game.types';
import { UtilityService } from '../utility/utility.service';
import { PokemonTxtForIAService } from './pokemon-txt-for-IA.service';
import { DamageTxtForIAService } from './damage-txt-for-IA.service';
import { ActionTxtForIAService } from './action-txt-for-IA.service';
import { log } from 'console';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class WriteTextForIAService {

    constructor(
        private pokemonTxtForIAService: PokemonTxtForIAService,
        private damageTxtForIAService: DamageTxtForIAService,
        private actionTxtForIAService: ActionTxtForIAService
    ) {}


    private getTurnToDebug(): number {
        try {
            const debugPath = path.join(process.cwd(), 'debug.json');
            const debugContent = fs.readFileSync(debugPath, 'utf-8');
            const debugData = JSON.parse(debugContent);
            return parseInt(debugData.turn) || 0;
        } catch (error) {
            console.error('Erreur lors de la lecture du fichier debug.json:', error);
            return 13; // valeur par défaut en cas d'erreur
        }
    }

    translateGameInFr(replayData: ReplayData): string {
        let resultText = '';
    
        // Description du match et des joueurs
        resultText += `Battle started between ${replayData.game.players[0].name} and ${replayData.game.players[1].name}! `;
    
        resultText += `${replayData.game.players[0].name} has the following Pokémons : ${replayData.game.players[0].team.map(poke=> this.pokemonTxtForIAService.getPokemonString(poke)).join(' / ')}.  `;
        resultText += `${replayData.game.players[1].name} has the following Pokémons : ${replayData.game.players[1].team.map(poke=> this.pokemonTxtForIAService.getPokemonString(poke)).join(' / ')}.  `;
    
        resultText += this.pokemonTxtForIAService.getNicknames(replayData);
        resultText += 'The battle begins!  \n';

        resultText += this.pokemonTxtForIAService.getLeads(replayData);

        let turnToDebug = this.getTurnToDebug();
    
        // Actions des tours
        replayData.game.game_info.turns.forEach(turn => {
            resultText += `\n \n Turn ${turn.turn_number} : \n`;
            turn.actions.forEach(action => {
                if(turn.turn_number > turnToDebug-1 && turn.turn_number < turnToDebug+1) console.log(action);
                if(turnToDebug && turn.turn_number >= turnToDebug+1) return;
                if (action.action === 'switch') { 
                    const player = action.player?.includes("p2") ? replayData.game.players[1].name : replayData.game.players[0].name;
                    resultText += `\n - ${action.pokemon} of ${player} is sent to the battle.  `;
                } else if (action.action === 'move') {
                    resultText += this.actionTxtForIAService.getMoveDetails(action, replayData);
                } else if (action.action === 'faint') { 
                    resultText += `\n - ${action.pokemon} fainted!`;
                } else if (action.action === 'boost') {  
                    resultText += this.actionTxtForIAService.getBoost(action, '', replayData);
                } else if (action.action === 'unboost') {
                    resultText += `\n - ${action.pokemon} loses a boost of statistics : ${action.unboost}.`;
                } else if (action.action === 'ability') {
                    resultText += this.actionTxtForIAService.getAbility(action, replayData);
                } else if (action.action === 'fail') {  
                    resultText += this.actionTxtForIAService.getFail(action,replayData);
                } else if(action.action === 'immune'){ 
                    resultText += this.actionTxtForIAService.getImmune(action);
                } else if(action.action === 'activate'){
                    resultText += this.actionTxtForIAService.getActivate(action, replayData);
                } else if(action.action === 'start'){
                    resultText += this.actionTxtForIAService.getStart(action, replayData);
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
                    resultText += this.actionTxtForIAService.getEndItem(action, replayData);
                } else if(action.action === 'end'){
                    resultText += this.actionTxtForIAService.getEnd(action, replayData);
                } else if(action.action === 'clearboost'){
                    resultText += this.actionTxtForIAService.getClearboost(action, replayData);
                } else if(action.action === 'forfeit'){
                    resultText += `\n - ${action.player?.replace('forfeited','').replace('.','').trim()} has forfeited.`;
                } else if(action.action === 'fieldstart'){
                    resultText += this.actionTxtForIAService.getFieldStart(action, replayData);
                } else if(action.action === 'terastallize'){
                    resultText += this.actionTxtForIAService.getTerastallize(action, replayData);
                } else if(action.action === 'heal'){
                    resultText += this.actionTxtForIAService.getHeal(action, replayData);
                } else if(action.action === 'supereffective'){
                    resultText += this.damageTxtForIAService.getSupereffective(action, replayData);
                } else if(action.action === 'crit'){
                    resultText += this.damageTxtForIAService.getCrit(action, replayData);
                } else if(action.action === 'fieldend'){
                    resultText += `\n - The field ${action.move} has disappeared.  `;
                } else if(action.action === 'weather'){
                    resultText += this.actionTxtForIAService.getWeather(action, replayData);
                } else if(action.action === 'miss'){
                    resultText += this.actionTxtForIAService.getMiss(action, replayData);
                }
            }); 
        }); 
     
        if(resultText.includes('Turn 0 : \nTurn 1 :')){
            // replace turn 0 if nothing to say 
            resultText = resultText.replace('Turn 0 :', '');
        }

        // Résultat final
        resultText += `\n Game's over! \n`;
        resultText += `\n The winner is ${replayData.game.final_result.winner}.`;
        if (replayData.game.final_result.forfeited) {
            resultText += ` ${replayData.game.final_result.forfeited} has forfeited.`;
        }
        // console.log(resultText);
        return resultText;
    }
}
