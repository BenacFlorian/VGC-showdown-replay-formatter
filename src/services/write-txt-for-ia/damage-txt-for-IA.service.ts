import { Injectable } from '@nestjs/common';
import { Action, DamageByTarget, Damage, ReplayData } from '../../types/game.types';
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


    getMoveDamage(action: Action, replayData: ReplayData): string {
        if(!action.damage) return '';
        const damageList: Damage[] = action.damage?.split(' |').filter(item=> !!item && item != '').map(damage=> {
            const damageTarget = damage.split('*')[0].trim().split(':')[1];
            let damageValue = damage.split('*')[1].trim().replace(' |', '');
            if(damageValue == '0 fnt') damageValue = 'KO';
            return {
                damageTarget: damageTarget.trim(),
                damageTargetId: damage.split(':')[0],
                damageValue: damageValue.trim()
            }
        });
        const damageByTarget = this.splitDamageByTarget(damageList);
        // console.log(damageByTarget);
        let moveEffect = ', ';

        let isMultipleHit = damageByTarget.map(damByTar=> damByTar.damages.length > 1).some(item=> item);
        let hasRecoilDamage = damageByTarget.map(damByTar=> damByTar.damages.find(damage=> damage.damageTargetId == action.player)).some(item=> item);
        if(hasRecoilDamage){ 
            const damageClassic = damageList.filter(damage=> damage.damageTargetId != action.player);
            const damageByTargetFilter = this.splitDamageByTarget(damageClassic);
            const damageRecoil = damageList.find(damage=> damage.damageTargetId == action.player);
            moveEffect = this.formatDamage(damageByTargetFilter, undefined, isMultipleHit, replayData) + ' and ' + this.formatDamageRecoil(damageRecoil, action);
        }else{
            moveEffect = this.formatDamage(damageByTarget, undefined, isMultipleHit, replayData);
        }
        return moveEffect;
    }

    splitDamageByTarget(damageList: Damage[]){
        let damageByTarget: DamageByTarget[] = [];
        damageList.forEach(damage=> {
            const index = damageByTarget.findIndex((damageByTarget: DamageByTarget)=> damageByTarget.damageTargetId === damage.damageTargetId);
            if(index === -1){
                damageByTarget.push({damageTargetId: damage.damageTargetId, damages: [damage], damageTarget: damage.damageTarget});
            }else{
                damageByTarget[index].damages.push(damage);
            }
        });
        return damageByTarget;
    }
 
    formatDamageRecoil(damageRecoil: any, action: Action){
        const result = damageRecoil.damageValue == 'KO' ? 'which puts it KO' : `which leaves it with ${damageRecoil.damageValue} point of life`;
        if(action.itemPokemonMoving ===  'LifeOrb'){
            return `${damageRecoil.damageTarget} inflicts damage to itself because of its item ${action.itemPokemonMoving}, ${result}`;
        }
        return `${damageRecoil.damageTarget} inflicts damage to itself because of its attack ${action.move}, ${result}`;
    }

    formatDamage(damageByTarget: DamageByTarget[], way?: string, isMultipleHit?: boolean, replayData?: ReplayData){
        let response = "";
        let countHit = 0;

        if(isMultipleHit){
            response = "and it's a multiple hit. ";
        }
        const hasMultipleTarget = damageByTarget.length > 1;
        damageByTarget.forEach((damageByTarget)=>{

            let moveEffect = '';
            const damages = damageByTarget.damages;
            const target = damageByTarget.damageTarget;
            const targetId = damageByTarget.damageTargetId;
            const playerName = targetId?.includes("p1") ? replayData?.game?.players[0].name : replayData?.game?.players[1].name;
            damages.forEach(damage=>{
                let endSentence = '';
                if(isMultipleHit){
                    countHit++;
                    moveEffect += ` At hit ${countHit}, `;
                    endSentence = '.';
                }
                if(damages.length == countHit){
                    endSentence = '';
                }
                if(hasMultipleTarget){
                    endSentence = '.';
                }
                const targetIsKo = damage.damageValue == 'KO';
                if(targetIsKo){
                    moveEffect += `It puts ${target} of ${playerName} KO `;
                }else{
                    const prefix = way != 'damageFrom' ? ` It leaves ${target} of ${playerName} with ` : ` and ${target} of ${playerName} has now `;
                    moveEffect += `${prefix} ${damage.damageValue} point of life${endSentence}`;
                }
            });
            response += moveEffect;
        });
        return response;
    }
 
  
    getDamageFrom(action: Action, replayData: ReplayData): string {

        const damageTarget = action.damage?.split('*')[0].trim().split(':')[1];
        let damageValue = action.damage?.split('*')[1].trim().replace(' |', '');
        if(damageValue == '0 fnt') damageValue = 'KO';
        const damageList: Damage[] = [{
            damageTarget: damageTarget || '',
            damageTargetId: action.playerTarget || '',
            damageValue: damageValue || ''
        }]; 
        const damageByTarget = this.splitDamageByTarget(damageList);
        const playerName = action.playerTarget?.includes("p1") ? replayData.game.players[0].name : replayData.game.players[1].name;
        return `\n - ${action.target} of ${playerName} suffers damage from ${this.getDamageFromFr(action)}, ${this.formatDamage(damageByTarget, 'damageFrom', false, replayData)}.  `;
    }

    getDamageFromFr(action: Action): string {
        const damageFrom = action.from?.replace('[from]', '').replace('move: ', '').replace('item: ','').trim();
        switch(damageFrom){
            case 'brn': return 'its burn';
            case 'psn': return 'its poison';
            case 'confusion': return 'its confusion';
            case 'Life Orb': return 'its Life Orb';
            case 'Recoil': return 'recoil';
            case 'Salt Cure': return 'Salt Cure';
            default: return damageFrom || '';
        }
    }
}
