import { Injectable } from '@nestjs/common';
import { Action, ReplayData } from '../types/game.types';
import { UtilityService } from './utility.service';

@Injectable()
export class ActionTxtForIAService {

    constructor(private utilityService: UtilityService) {}

    getActionTarget(action: Action, replayData: ReplayData): string {
        if (action.target?.includes('spread')){
            let resultTxt = "";
            const p1Player = replayData.game.players[0];
            const p2Player = replayData.game.players[1];
            const isZoneTerrainTargeted = action.damage?.includes(action.playerTarget?.includes("p1") ? 'p2' : 'p1');
            if(isZoneTerrainTargeted) resultTxt += ' sur tous les pokemons du terrain, et inflige des dégats ';
            const targets = action.damage?.split(' |').filter(item=> !!item && item != '')
                .map(item=>{
                    const player = item.split('*')[0].trim().split(':')[0]?.includes("p1") ? p1Player.name : p2Player.name;
                    const target = `${ item.split('*')[0].trim().split(':')[1]} de ${player}`;
                    return target;
                }) || [];
            return resultTxt + ' sur ' + this.utilityService.formatList(targets);
        }else{
            const playerTarget = action.playerTarget?.includes("p1") ? replayData.game.players[0].name : replayData.game.players[1].name;
            const actionTarget = action.playerTarget != action.player ? `${action.target} de ${playerTarget}` : '';
            return action.playerTarget == '[still]' ? ' et disparait ' : ' sur ' + actionTarget;
        }
    }

    getBoost(action: Action, moveDamage?: string): string {
        if(!action.boost) return '';
        if(action.boost?.split(',').length > 1){
            return !!moveDamage ? `, et gagne plusieurs boost de statistiques : ${action.boost}, ` : `, et gagne plusieurs boost de statistiques : ${action.boost}`;
        }
        return !!moveDamage ? `, et gagne un boost de statistique : ${action.boost}, ` : `, et gagne un boost de statistique : ${action.boost}`;
    }


    getUnboost(action: Action, moveDamage: string): string {
        if(!action.unboost) return '';
        if(action.unboost?.split(',').length > 1){
            return !!moveDamage ? `, et perd plusieurs boosts de statistique : ${action.unboost}, ` : `, et perd plusieurs boosts de statistique : ${action.unboost}`;
        }
        return !!moveDamage ? `, et perd un boost de statistique : ${action.unboost}, ` : `, et perd un boost de statistique : ${action.unboost}`;
    }


    getMove(action: Action): string {
        if(action.move === 'Reflect') return `${action.move}, ce qui réduit de moitié les dégats phyique reçu par son équipe pour les tours à venir`;
        if(action.move === 'Light Screen') return `${action.move}, ce qui réduit de moitié les dégats spéciaux reçu par son équipe pour les tours à venir`;
        if(action.move === 'Wide Guard') return `${action.move}, ce qui protège son équipe des attaques de zones pour ce tour`;
        if(action.move === 'Imprison') return `${action.move}, ce qui empêche l'équipe adverse d'utiliser les attaques qu'il possède pour les tours a venir`;

        const isZoneMove = action.target?.includes('spread');
        return `${action.move} ${isZoneMove ? '(move de zone)' : ''}` || '';
    }


    getFail(action: Action,replayData: ReplayData): string {
        let actionTextFr = '';
        let becauseTextFr = '';
        switch(action.move){
            case 'unboost': actionTextFr = 'réduction de statistique';
            break;
            case 'heal': actionTextFr = 'soin';
            break;
            default: actionTextFr = action.move || '';
        }
        if (action.from?.includes('ability')) becauseTextFr = ` à cause de son talent : ${action.from?.toString().split(':')[1].trim()}`
        const onWho = !action.isSamePlayerWhoFail ? 'sur le' : 'du';

        const playerName = replayData.game.players.find(player=> player.id == action.playerTarget?.replace('a','').replace('b',''))?.name;
        return `La tentative de ${actionTextFr} ${onWho} ${action.target} de ${playerName} rate${becauseTextFr}. \n `;
    }

    getImmune(action: Action): string {
        if(action.from?.includes('ability')){
            return `${action.target} est immunisé contre ${action.move} à cause de son talent : ${action.from?.split(':')[1]}. \n `;
        }
        return `${action.target} est immunisé contre ${action.move}. \n `;
    }

    getActivate(action: Action, replayData: ReplayData): string {
        const playerName = action.playerTarget?.includes("p1") ? replayData.game.players[0].name : replayData.game.players[1].name;
        if(action.move?.includes('move:')){
            return `${action.target} est protégé grâce à ${action.move?.replace('move: ', '')}. \n `;
        }else{
            switch(action.move){
                case 'confusion': return `${action.target} de ${playerName} est confus. \n `;
                default: return ``;
            }
        }
    }


    getStart(action: Action): string {
        const move = action.move?.includes('move:') ? action.move?.replace('move: ', '') : action.move;
        switch(move){
            case 'Yawn': return `${action.target} deviens somnolent à cause de ${action.from?.split(':')[1]}, il s'endormira s'il attaque une fois de plus. \n `;
            case 'confusion': return `${action.target} deviens confus à cause de ${action.from === 'fatigue' ? ' la fatigue (un effet de son attaque)' : action.from}. \n `;
        }
        return "";
    }


    getStatus(action: Action, replayData: ReplayData): string {
        const playerName = action.playerTarget?.includes("p1") ? replayData.game.players[0].name : replayData.game.players[1].name;
        return `${action.target} de ${playerName} est maintenant ${this.getStatusFr(action.status || '')}. \n `;
    }

    getStatusFr(status: string): string {
        switch(status){
            case 'slp': return 'endormi';
            case 'brn': return 'brulé';
            case 'frz': return 'glacé';
            case 'psn': return 'empoisonné';
            case 'par': return 'paralyse';
            case 'slp': return 'endormi';
            case 'frz': return 'glacé';
            case 'psn': return 'empoisonné';
            default: return '';
        }
    }

    getCant(action: Action, replayData: ReplayData): string {
        let reason = '';
        switch(action.from){
            case 'slp': reason = 'il est endormi'; 
                break;
            case 'recharge': reason = 'il est en train de se recharger';
                break;
        }
        const playerName = action.playerTarget?.includes("p1") ? replayData.game.players[0].name : replayData.game.players[1].name;
        return `${action.target} de ${playerName} ne peut pas attaquer ce tour-ci car ${reason}. \n `;
    }

    getClearboost(action: Action, replayData: ReplayData): string {
        const playerName = action.playerTarget?.includes("p1") ? replayData.game.players[0].name : replayData.game.players[1].name;
        return `${action.target} de ${playerName} n'a plus de boost. \n `;
    }

    getSideend(action: Action): string {
        const move = action.move?.includes('move:') ? action.move?.replace('move: ', '') : action.move;
        return `${move} de ${action.playerTarget} n'a plus d'effet. \n `;
    }

    getEnd(action: Action, replayData: ReplayData): string {
        const playerName = action.player?.includes("p2") ? replayData.game.players[1].name : replayData.game.players[0].name;
        return `${action.pokemon} de ${playerName} n'est plus : ${this.getEndFr(action.move || '')}. \n `;
    }

    getEndFr(end: string): string {
        switch(end){
            case 'confusion': return 'confus';
        }
        return '';
    }

    getCurestatus(action: Action, replayData: ReplayData): string {
        const playerName = action.playerTarget?.includes("p1") ? replayData.game.players[0].name : replayData.game.players[1].name;
        return `${action.target} de ${playerName} est guéri de son statut : ${this.getCureStatusFr(action.from || '')}. \n `;
    }

    getCureStatusFr(status: string): string {
        switch(status){
            case 'slp': return ' sommeil';
            case 'brn': return ' brulé';
            case 'frz': return ' gelé';
            case 'psn': return ' empoisonné';
            case 'par': return ' paralysé';
            default: return '';
        }
    }
    

}
