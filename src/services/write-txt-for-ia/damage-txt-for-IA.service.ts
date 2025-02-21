import { Injectable } from '@nestjs/common';
import { Action, ReplayData } from '../../types/game.types';
import { UtilityService } from '../utility/utility.service';

@Injectable()
export class DamageTxtForIAService {

    constructor() {}


    getResisted(action: Action): string {
        if(!action.resisted) return '';
        const resisted_list = action.resisted?.split(' |').filter(item=> !!item && item != '').map(item=> item.split(':')[1].trim()) || [];
        return resisted_list?.length > 1 ?  `, it was resisted by ${resisted_list[0]} and ${resisted_list[1]}` : `, it was resisted by ${resisted_list[0]}`;
    }

    getSupereffective(action: Action, replayData: ReplayData): string {
        const playerName = action.playerTarget?.includes("p1") ? replayData.game.players[0].name : replayData.game.players[1].name;
        return `It's super effective on ${action.target} of ${playerName}.  `;
    }

    getCrit(action: Action, replayData: ReplayData): string {
        const playerName = action.playerTarget?.includes("p1") ? replayData.game.players[0].name : replayData.game.players[1].name;
        return `It's a critical hit on ${action.target} of ${playerName}.  `;
    }


    getMoveDamage(action: Action): string {
        if(!action.damage) return '';
        const damage_list = action.damage?.split(' |').filter(item=> !!item && item != '').map(damage=> {
            const damageTarget = damage.split('*')[0].trim().split(':')[1];
            let damageValue = damage.split('*')[1].trim().replace(' |', '');
            if(damageValue == '0 fnt') damageValue = 'KO';
            return {
                damageTarget: damageTarget.trim(),
                damageTargetId: damage.split(':')[0],
                damageValue: damageValue.trim()
            }
        });
        let moveEffect = ', ';

        if(!!action.player && action.damage.includes(action.player)){
            const damageRecoil = damage_list.find(damage=> damage.damageTargetId == action.player);
            const damageClassic = damage_list.filter(damage=> damage.damageTargetId != action.player);
            moveEffect = this.formatDamage(damageClassic) + ' and ' + this.formatDamageRecoil(damageRecoil, action);
        }else{
            moveEffect = this.formatDamage(damage_list);
        }
        return moveEffect;
    }

    formatDamageRecoil(damageRecoil: any, action: Action){
        const result = damageRecoil.damageValue == 'KO' ? 'which puts it KO' : `which leaves it with ${damageRecoil.damageValue} point of life`;
        if(action.itemPokemonMoving ===  'LifeOrb'){
            return `${damageRecoil.damageTarget} inflicts damage to itself because of its item ${action.itemPokemonMoving}, ${result}`;
        }
        return `${damageRecoil.damageTarget} inflicts damage to itself because of its attack ${action.move}, ${result}`;
    }

    formatDamage(damage_list: any, way?: string){
        let moveEffect = '';
        if(damage_list.length > 1) {
            if(damage_list[0].damageValue == 'KO' && damage_list[1].damageValue == 'KO') {
            moveEffect += `it puts ${damage_list[0].damageTarget} and ${damage_list[1].damageTarget} KO  `;
            }
            if(damage_list[0].damageValue == 'KO' && damage_list[1].damageValue != 'KO') {
            moveEffect += `it puts ${damage_list[0].damageTarget} KO and leaves ${damage_list[1].damageValue} point of life to ${damage_list[1].damageTarget}  `;
            }
            if(damage_list[0].damageValue != 'KO' && damage_list[1].damageValue == 'KO') {
            moveEffect += `it puts ${damage_list[1].damageTarget} KO and leaves ${damage_list[0].damageValue} point of life to ${damage_list[0].damageTarget}  `;
            }
        }else{
            if(damage_list[0].damageValue == 'KO') {
                moveEffect += `it puts ${damage_list[0].damageTarget} KO `;
            }else{
                const prefix = way != 'damageFrom' ? ' and leaves it with ' : 'has';
                const sufix = way != 'damageFrom' ? '' : ` to ${damage_list[0].damageTarget}`;
                moveEffect += `${prefix} ${damage_list[0].damageValue} point of life${sufix}`;
            }
        }
        return moveEffect;
    }


    getDamageFrom(action: Action, replayData: ReplayData): string {

        const damageTarget = action.damage?.split('*')[0].trim().split(':')[1];
        let damageValue = action.damage?.split('*')[1].trim().replace(' |', '');
        if(damageValue == '0 fnt') damageValue = 'KO';
        const damageList = [{
            damageTarget: damageTarget,
            damageTargetId: action.playerTarget,
            damageValue: damageValue
        }]; 
        const playerName = action.playerTarget?.includes("p1") ? replayData.game.players[0].name : replayData.game.players[1].name;
        return `${action.target} of ${playerName} suffers damage from ${this.getDamageFromFr(action)}, ${this.formatDamage(damageList, 'damageFrom')}.  `;//${this.formatDamageRecoil(action)}
    }

    getDamageFromFr(action: Action): string {
        const damageFrom = action.from?.replace('[from]', '').replace('item: ','').trim();
        switch(damageFrom){
            case 'brn': return 'its burn';
            case 'psn': return 'its poison';
            case 'confusion': return 'its confusion';
            case 'Life Orb': return 'its Life Orb';
            case 'Recoil': return 'recoil';
            case 'Salt Cure': return 'Salt Cure';
            default: return '';
        }
    }
}
