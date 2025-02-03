import { Injectable } from '@nestjs/common';
import { Action, ReplayData } from '../types/game.types';
import { UtilityService } from './utility.service';

@Injectable()
export class DamageTxtForIAService {

    constructor() {}


    getResisted(action: Action): string {
        if(!action.resisted) return '';
        const resisted_list = action.resisted?.split(' |').filter(item=> !!item && item != '').map(item=> item.split(':')[1].trim()) || [];
        return resisted_list?.length > 1 ?  `, ça a été résisté par ${resisted_list[0]} et ${resisted_list[1]}` : `, ça a été résisté par ${resisted_list[0]}`;
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
            moveEffect = this.formatDamage(damageClassic) + ' et ' + this.formatDamageRecoil(damageRecoil, action);
        }else{
            moveEffect = this.formatDamage(damage_list);
        }
        return moveEffect;
    }

    formatDamageRecoil(damageRecoil: any, action: Action){
        const result = damageRecoil.damageValue == 'KO' ? 'ce qui le met KO' : `se retrouvant avec ${damageRecoil.damageValue} de point de vie`;
        if(action.itemPokemonMoving ===  'LifeOrb'){
            return `${damageRecoil.damageTarget} s'inflige des dégats à cause de son item ${action.itemPokemonMoving}, ${result}`;
        }
        return `${damageRecoil.damageTarget} s'inflige des dégats à cause de son attaque ${action.move}, ${result}`;
    }

    formatDamage(damage_list: any, way?: string){
        let moveEffect = '';
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
            const prefix = way != 'damageFrom' ? 'il lui laisse' : 'il lui reste';
            if(damage_list[0].damageValue == 'KO') {
                moveEffect += `ça met ${damage_list[0].damageTarget} KO `;
            }else{
                moveEffect += `${prefix} ${damage_list[0].damageValue} de point de vie `;
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
        return `${action.target} de ${playerName} subit des dégats de ${this.getDamageFromFr(action)}, ${this.formatDamage(damageList, 'damageFrom')}. \n `;//${this.formatDamageRecoil(action)}
    }

    getDamageFromFr(action: Action): string {
        const damageFrom = action.from?.replace('[from]', '').replace('item: ','').trim();
        switch(damageFrom){
            case 'brn': return 'sa brûlure';
            case 'psn': return 'son empoisonnement';
            case 'confusion': return 'sa confusion';
            case 'Life Orb': return 'son item Life Orb';
            case 'Recoil': return 'recul';
            default: return '';
        }
    }
}
