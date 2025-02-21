import { Injectable } from '@nestjs/common';
import { Action, ReplayData } from '../../types/game.types';
import { UtilityService } from '../utility/utility.service';

@Injectable()
export class ActionTxtForIAService {

    constructor(private utilityService: UtilityService) {}

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
            return resultTxt + ' on ' + this.utilityService.formatList(targets);
        }else{
            const playerTarget = action.playerTarget?.includes("p1") ? replayData.game.players[0].name : replayData.game.players[1].name;
            const actionTarget = action.playerTarget != action.player ? `${action.target} of ${playerTarget}` : '';
            if(action.playerTarget == '[still]'){
                switch(action.move){
                    case 'Solar Beam': return ' and shines';
                    default: return ' and disappears';
                }
            }else{
                return ' on ' + actionTarget;
            };
        }
    }

    getAbility(action: Action): string {
        let details = '';
        if(action.move == 'Sword of Ruin') details = ', which increases the physical damage inflicted on nearby pokemons';
        return `${action.pokemon} uses its ability : ${action.move}${details}.  `;
    }

    getBoost(action: Action, moveDamage?: string): string {
        if(!action.boost) return '';
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
        }else{
            switch(action.move){
                case 'confusion': return `${action.target} of ${playerName} is confused.  `;
                default: return ``;
            }
        }
    }


    getStart(action: Action): string {
        const move = action.move?.includes('move:') ? action.move?.replace('move: ', '') : action.move;
        switch(move){
            case 'Yawn': return `${action.target} becomes drowsy because of ${action.from?.split(':')[1]}, it will fall asleep if it attacks again.  `;
            case 'confusion': return `${action.target} becomes confused because of ${action.from === 'fatigue' ? ' fatigue (an effect of its attack)' : action.from}.  `;
        }
        return "";
    }


    getStatus(action: Action, replayData: ReplayData): string {
        const playerName = action.playerTarget?.includes("p1") ? replayData.game.players[0].name : replayData.game.players[1].name;
        return `${action.target} of ${playerName} is now ${this.getStatusFr(action.status || '')}.  `;
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
            case 'flinch': reason = 'it has been frightened';
        }
        const playerName = action.playerTarget?.includes("p1") ? replayData.game.players[0].name : replayData.game.players[1].name;
        return `${action.target} of ${playerName} can't attack this turn because ${reason}.  `;
    }

    getFieldStart(action: Action, replayData: ReplayData): string {
        const playerName = action.player?.includes("p2") ? replayData.game.players[1].name : replayData.game.players[0].name;
        if(action.from?.includes('ability')){
            return `${action.pokemon} of ${playerName} places its ${action.move} because of its ability : ${action.from?.split(':')[1]}.  `;
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
            return `- ${action.target} of ${playerName} uses ${action.move} and heals up to ${action.pv} point of life.  `;
        }else{
            return `- ${action.target} of ${playerName} is healed up to ${action.pv} point of life${reason}.  `;
        }        
    }

    getTerastallize(action: Action, replayData: ReplayData): string {
        const playerName = action.player?.includes("p2") ? replayData.game.players[1].name : replayData.game.players[0].name;
        return `- ${action.pokemon} of ${playerName} becomes terastallized in type ${action.type}.  `;
    }

    getClearboost(action: Action, replayData: ReplayData): string {
        const playerName = action.playerTarget?.includes("p1") ? replayData.game.players[0].name : replayData.game.players[1].name;
        return `- The boosts of ${action.target} of ${playerName} have been canceled.  `;
    }

    getSideend(action: Action): string {
        const move = action.move?.includes('move:') ? action.move?.replace('move: ', '') : action.move;
        return `- ${move} of ${action.playerTarget} has no more effect.  `;
    }

    getEnd(action: Action, replayData: ReplayData): string {
        const playerName = action.player?.includes("p2") ? replayData.game.players[1].name : replayData.game.players[0].name;
        return `- ${action.pokemon} of ${playerName} is no longer : ${this.getEndFr(action.move || '')}.  `;
    }

    getEndFr(end: string): string {
        switch(end){
            case 'confusion': return 'confusion';
        }
        return '';
    }

    getCurestatus(action: Action, replayData: ReplayData): string {
        const playerName = action.playerTarget?.includes("p1") ? replayData.game.players[0].name : replayData.game.players[1].name;
        return `${action.target} of ${playerName} is cured of its status : ${this.getCureStatusFr(action.from || '')}.  `;
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
