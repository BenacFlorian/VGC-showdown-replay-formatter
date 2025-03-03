import { Injectable } from '@nestjs/common';
import { Action, ReplayData } from '../../types/game.types';
import { UtilityService } from '../utility/utility.service';
import { DamageTxtForIAService } from './damage-txt-for-IA.service';
@Injectable()
export class ActionTxtForIAService {

    constructor(
        private utilityService: UtilityService,
        private damageTxtForIAService: DamageTxtForIAService
    ) {}

    getActionTarget(action: Action, replayData: ReplayData): string {
        if (action.target?.includes('spread')){
            let resultTxt = "";
            const p1Player = replayData.game.players[0];
            const p2Player = replayData.game.players[1];
            const isZoneTerrainTargeted = action.damage?.includes(action.playerTarget?.includes("p1") ? 'p2' : 'p1');
            if(isZoneTerrainTargeted) resultTxt += ' on all pokemons on the field, and inflict damage ';
            const targets = action.damage?.split(' |').filter(item=> !!item && item != '')
                .map(item=>{
                    const player = item.split('*')[0].trim().split(':')[0]?.includes("p1") ? p1Player.name : p2Player.name;
                    const target = `${ item.split('*')[0].trim().split(':')[1]} of ${player}`;
                    return target;
                }) || [];
            return targets.length > 0 ? resultTxt + ' on ' + this.utilityService.formatList(targets) : resultTxt;
        }else{
            const playerTarget = action.playerTarget?.includes("p1") ? replayData.game.players[0].name : replayData.game.players[1].name;
            const actionTarget = action.playerTarget != action.player ? `${action.target} of ${playerTarget}` : '';
            if(action.playerTarget == '[still]'){
                switch(action.move){
                    case 'Solar Beam': return ' and shines';
                    default: return ' and disappears';
                }
            }else{
                return !!actionTarget ? ' on ' + actionTarget : '';
            };
        }
    }

    getAbility(action: Action, replayData: ReplayData): string {
        const player = action.player?.includes("p2") ? replayData.game.players[1].name : replayData.game.players[0].name;
        let details = '';
        if(action.move == 'Sword of Ruin') details = ', which increases the physical damage inflicted on nearby pokemons';
        const boost = this.getBoost(action);
        const unboost = this.getUnboost(action, '');

        return `\n - ${action.pokemon} of ${player} uses its ability : ${action.move}${details}${boost}${unboost}.  `;
    }

    getBoost(action: Action, moveDamage?: string, replayData?: ReplayData): string {
        if(!action.boost) return '';
        if(action.from == 'external_src'){
            const player = action.playerTarget?.includes("p2") ? replayData?.game.players[1].name : replayData?.game.players[0].name;
            if(action.boost?.split(',').length > 1){
                return `\n - ${action.pokemon} of ${player} gains several boosts of statistics : ${action.boost}.`;
            }
            return `\n - ${action.pokemon} of ${player} gains a boost of statistics : ${action.boost}`;
        }
        if(action.boost?.split(',').length > 1){
            return !!moveDamage ? `, and gains several boosts of statistics : ${action.boost}, ` : `, and gains several boosts of statistics : ${action.boost}`;
        }
        return !!moveDamage ? `, and gains a boost of statistics : ${action.boost}, ` : `, and gains a boost of statistics : ${action.boost}`;
    }


    getUnboost(action: Action, moveDamage: string): string {
        if(!action.unboost) return '';
        if(action.unboost?.split(',').length > 1){
            return !!moveDamage ? `, and loses several boosts of statistics : ${action.unboost}, ` : `, and loses several boosts of statistics : ${action.unboost}`;
        }
        return !!moveDamage ? `, and loses a boost of statistics : ${action.unboost}, ` : `, and loses a boost of statistics : ${action.unboost}`;
    }

    getMiss(action: Action, replayData: ReplayData): string {
        const player = action.player?.includes("p2") ? replayData.game.players[1].name : replayData.game.players[0].name;
        const playerTarget = action.playerTarget?.includes("p2") ? replayData.game.players[1].name : replayData.game.players[0].name;
        return `\n - ${action.pokemon} of ${player} misses ${action.target} of ${playerTarget}.`;
    }

    getMoveDetails(action: Action, replayData: ReplayData):string{
        const player = action.player?.includes("p2") ? replayData.game.players[1].name : replayData.game.players[0].name;
        const resisted = this.damageTxtForIAService.getResisted(action);
        const moveDamage = resisted != '' ? this.damageTxtForIAService.getMoveDamage(action, replayData).replace('', '') : this.damageTxtForIAService.getMoveDamage(action, replayData);
        const targets = this.getActionTarget(action, replayData);
        const boost = this.getBoost(action, moveDamage);
        const unboost = this.getUnboost(action, moveDamage);
        const redirected = action.redirected ? `is redirected to ${action.target} and ` : '';
        const move = this.getMove(action)
        return action.playerTarget != action.player ? `\n - ${action.pokemon} of ${player} ${redirected} uses ${move} ${targets} ${unboost} ${moveDamage}${boost}${resisted}.` : `\n - ${action.pokemon} of ${player} ${redirected}  uses ${move}${boost}${unboost}.`;
    }


    getMove(action: Action): string {
        if(action.move === 'Reflect') return `${action.move}, which halves the physical damage received by its team for the next turns`;
        if(action.move === 'Light Screen') return `${action.move}, which halves the special damage received by its team for the next turns`;
        if(action.move === 'Wide Guard') return `${action.move}, which protects its team from zone moves for this turn`;
        if(action.move === 'Imprison') return `${action.move}, which prevents the opposing team from using the moves it possesses for the next turn`;
        if(action.move === 'Tailwind') return `${action.move}, which doubles the speed of its team's pokemons for 4 turns, including this one`;
        if(action.move === 'Mist') return `${action.move}, which blocks the modifications of statistics induced by the opponent for 5 turns`;

        const isZoneMove = action.target?.includes('spread');
        return `${action.move} ${isZoneMove ? '(zone move)' : ''}` || '';
    }


    getFail(action: Action,replayData: ReplayData): string {
        let actionTextFr = '';
        let becauseTextFr = '';
        switch(action.move){
            case 'unboost': actionTextFr = 'statistic reduction';
            break;
            case 'heal': actionTextFr = 'heal';
            break;
            default: actionTextFr = action.move || '';
        }
        if (action.from?.includes('ability')) becauseTextFr = ` because of its ability : ${action.from?.toString().split(':')[1].trim()}`
        const onWho = !action.isSamePlayerWhoFail ? 'on the' : 'of the';

        const playerName = replayData.game.players.find(player=> player.id == action.playerTarget?.replace('a','').replace('b',''))?.name;
        return `The attempt of ${actionTextFr} ${onWho} ${action.target} of ${playerName} fails${becauseTextFr}.  `;
    }

    getImmune(action: Action): string {
        if(action.from?.includes('ability')){
            return `${action.target} is immune to ${action.move} because of its ability : ${action.from?.split(':')[1]}.  `;
        }
        return `${action.target} is immune to ${action.move}.  `;
    }

    getActivate(action: Action, replayData: ReplayData): string {
        const playerName = action.playerTarget?.includes("p1") ? replayData.game.players[0].name : replayData.game.players[1].name;
        if(action.move?.includes('move:')){
            return `${action.target} is protected thanks to ${action.move?.replace('move: ', '')}.  `;
        }else if(action.move?.includes('ability')){
            return `\n - ${action.target} activates its ability : ${action.move?.replace('ability: ', '').trim()}.  `;
        }else{
            switch(action.move){
                case 'confusion': return `${action.target} of ${playerName} is confused.  `;
                default: return ``;
            }
        }
    }


    getStart(action: Action, replayData: ReplayData): string {
        const playerName = action.player?.includes("p2") ? replayData.game.players[1].name : replayData.game.players[0].name;
        const move = action.move?.includes('move:') ? action.move?.replace('move: ', '') : action.move;
        switch(move){
            case 'Yawn': return `${action.target} of ${playerName} becomes drowsy because of ${action.from?.split(':')[1]}, it will fall asleep if it attacks again.  `;
            case 'confusion': return `${action.target} of ${playerName} becomes confused because of ${action.from === 'fatigue' ? ' fatigue (an effect of its attack)' : action.from}.  `;
            case 'quarkdrivespe': return `${action.target} of ${playerName} gains a boost from his ability Quark Drive : spe   `;
            case 'quarkdriveatt': return `${action.target} of ${playerName} gains a boost from his ability Quark Drive : att   `;
            case 'quarkdrivedef': return `${action.target} of ${playerName} gains a boost from his ability Quark Drive : def   `;
            case 'quarkdrivespa': return `${action.target} of ${playerName} gains a boost from his ability Quark Drive : spa   `;
            case 'quarkdrivespd': return `${action.target} of ${playerName} gains a boost from his ability Quark Drive : spd   `;
            case 'quarkdrivespe': return `${action.target} of ${playerName} gains a boost from his ability Quark Drive : spe   `;
            case 'protosynthesisspe': return `${action.target} of ${playerName} gains a boost from his ability Protosynthesis : spe   `;
            case 'protosynthesisatt': return `${action.target} of ${playerName} gains a boost from his ability Protosynthesis : att   `;
            case 'protosynthesisdef': return `${action.target} of ${playerName} gains a boost from his ability Protosynthesis : def   `;
            case 'protosynthesisspa': return `${action.target} of ${playerName} gains a boost from his ability Protosynthesis : spa   `;
            case 'protosynthesisspd': return `${action.target} of ${playerName} gains a boost from his ability Protosynthesis : spd   `;
        }
        return "";
    }


    getStatus(action: Action, replayData: ReplayData): string {
        const playerName = action.playerTarget?.includes("p1") ? replayData.game.players[0].name : replayData.game.players[1].name;
        return ` ${action.target} of ${playerName} is now ${this.getStatusFr(action.status || '')}.  `;
    }

    getStatusFr(status: string): string {
        switch(status){
            case 'slp': return 'asleep';
            case 'brn': return 'burned';
            case 'frz': return 'frozen';
            case 'psn': return 'poisoned';
            case 'par': return 'paralyzed';
            case 'slp': return 'asleep';
            case 'frz': return 'frozen';
            case 'psn': return 'poisoned';
            default: return '';
        }
    }

    getCant(action: Action, replayData: ReplayData): string {
        let reason = '';
        switch(action.from){
            case 'slp': reason = 'it is asleep'; 
                break;
            case 'recharge': reason = 'it is recharging';
                break;
            case 'flinch': reason = 'it has been flinched';
        }
        const playerName = action.playerTarget?.includes("p1") ? replayData.game.players[0].name : replayData.game.players[1].name;
        return `\n - ${action.target} of ${playerName} can't attack this turn because ${reason}.  `;
    }

    getWeather(action: Action, replayData: ReplayData): string {
        if(action.move?.toLowerCase() == "none") return '\n - The weather return to normal. ';
        if(!action.pokemon) return ` \n - The weather changing to : ${this.getWeatherName(action.move)}`;
        const playerName = action.player?.includes("p1") ? replayData.game.players[0].name : replayData.game.players[1].name;
        return `\n - The weather is ${this.getWeatherName(action.move)} because of ${action.from} ${action.fromDetail} of ${action.pokemon} of ${playerName}.  `;
    }

    getWeatherName(weather: string | undefined): string {
        switch(weather) {
            case 'SunnyDay': return 'sun';
            case 'RainDance': return 'rain';
            case 'Sandstorm': return 'sandstorm';
            case 'Snowscape': return 'snow';
            case 'None': return 'clear';
            default: return '';
        }
    } 

    getFieldStart(action: Action, replayData: ReplayData): string {
        if(action.move == "Gravity"){
            return " Gravity is now on; accuracy of moves is augmented, and the flying pokemon must land. ";
        }
        const playerName = action.player?.includes("p2") ? replayData.game.players[1].name : replayData.game.players[0].name;
        if(action.from?.includes('ability')){
            return `\n - ${action.pokemon} of ${playerName} places its ${action.move} because of its ability : ${action.from?.split(':')[1]}.  `;
        }
        // console.log(action);
        if(action.move?.includes('Trick Room')){
            return `For 5 turns, the order of attack of the pokemons is reversed.  `;
        }
        return `${action.pokemon} of ${playerName} places its ${action.move}.  `;
    }

    getHeal(action: Action, replayData: ReplayData): string {
        const playerName = action.playerTarget?.includes("p1") ? replayData.game.players[0].name : replayData.game.players[1].name;
        const reason = !!action.from ? ` because of ${action.from}` : '';
        if(!!action.move){
            return `\n - ${action.target} of ${playerName} uses ${action.move} and heals up to ${action.pv} point of life.  `;
        }else{
            return `\n - ${action.target} of ${playerName} is healed up to ${action.pv} point of life${reason}.  `;
        }        
    }

    getTerastallize(action: Action, replayData: ReplayData): string {
        const playerName = action.player?.includes("p2") ? replayData.game.players[1].name : replayData.game.players[0].name;
        return `\n - ${action.pokemon} of ${playerName} becomes terastallized in type ${action.type}.  `;
    }

    getClearboost(action: Action, replayData: ReplayData): string {
        const playerName = action.playerTarget?.includes("p1") ? replayData.game.players[0].name : replayData.game.players[1].name;
        return `\n - The boosts of ${action.target} of ${playerName} have been canceled.  `;
    }

    getSideend(action: Action): string {
        const move = action.move?.includes('move:') ? action.move?.replace('move: ', '') : action.move;
        return `\n - ${move} of ${action.playerTarget} has no more effect.  `;
    }
 
    getEndItem(action: Action, replayData: ReplayData): string {   
        const boost = this.getBoost(action);
        const unboost = this.getUnboost(action, '');
        const player = action.player?.includes("p2") ? replayData.game.players[1].name : replayData.game.players[0].name;
        if(action.from?.trim() == 'Knock Off'){
            return `\n - ${action.target} of ${player} loose its item ${action.move} because of ${action.from}  `;
        }
        return `\n - ${action.target} of ${player} uses its item ${action.move} ${boost}${unboost}  `;
    }

    getEnd(action: Action, replayData: ReplayData): string {
        const playerName = action.player?.includes("p2") ? replayData.game.players[1].name : replayData.game.players[0].name;
        if(action.move?.includes('ability')){
            const ability = action.move?.split(':')[1]?.trim();
            return `\n - The ability ${ability} of ${action.pokemon} of ${playerName} ended.  `;
        }
        if(action.move === 'Protosynthesis'){
            return `\n - Protosynthesis for ${action.pokemon} of ${playerName} is no longer active.`;
        }
        return `\n - ${action.pokemon} of ${playerName} is no longer : ${action.move?.replace('move:', '')}.  `;
    }

    getCurestatus(action: Action, replayData: ReplayData): string {
        const playerName = action.playerTarget?.includes("p1") ? replayData.game.players[0].name : replayData.game.players[1].name;
        return `\n - ${action.target} of ${playerName} is cured of its status : ${this.getCureStatusFr(action.from || '')}.  `;
    }

    getCureStatusFr(status: string): string {
        switch(status){
            case 'slp': return 'sleep';
            case 'brn': return 'burn';
            case 'frz': return 'frozen';
            case 'psn': return 'poisoned';
            case 'par': return 'paralyzed';
            default: return '';
        }
    }
    

}
