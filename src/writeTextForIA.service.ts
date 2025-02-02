import { Injectable } from '@nestjs/common';
import { Pokemon, ReplayData } from './types/game.types';
import { Action } from './types/game.types';
import { UtilityService } from './utility.service';

@Injectable()
export class WriteTextForIAService {

    constructor(private utilityService: UtilityService) {}

    translateGameInFr(replayData: ReplayData): string {
        let resultText = '';
    
        // Description du match et des joueurs
        resultText += `Le match oppose ${replayData.game.players[0].name} et ${replayData.game.players[1].name}. \n `;
    
        resultText += `Le joueur ${replayData.game.players[0].name} a les Pokémons suivants : ${replayData.game.players[0].team.map(poke=> this.getPokemonString(poke)).join(', ')}. \n `;
        resultText += `Le joueur ${replayData.game.players[1].name} a les Pokémons suivants : ${replayData.game.players[1].team.map(poke=> this.getPokemonString(poke)).join(', ')}. \n `;
    
        resultText += 'Le match commence ! \n ';
        resultText += this.getLeads(replayData);
    
        // Actions des tours
        replayData.game.game_info.turns.forEach(turn => {
            resultText += `Tour ${turn.turn_number} :\n `;
            if(turn.turn_number == 4) console.log(turn);
            turn.actions.forEach(action => {
                if (action.action === 'switch') {
                  resultText += `${action.pokemon} est envoyé au combat. \n `;
                } else if (action.action === 'move') {
                    const player = action.player?.includes("p2") ? replayData.game.players[1].name : replayData.game.players[0].name;
                    const resisted = this.getResisted(action);
                    const moveDamage = resisted != '' ? this.getMoveDamage(action).replace('\n', '') : this.getMoveDamage(action);
                    const missed = action.miss ? ' mais ça rate' : '';
                    const targets = this.getActionTarget(action, replayData);
                    const boost = action.boost ? `, et augmente ses statistiques : ${action.boost}` : '';
                    const unboost = this.getUnboost(action, moveDamage);
                    const redirected = action.redirected ? `est redirigé vers ${action.target} et ` : '';
                    const move = this.getMove(action)
                    resultText += action.playerTarget != action.player ? `${action.pokemon} de ${player} ${redirected} utilise ${move} ${targets} ${unboost} ${moveDamage}${missed}${boost}${resisted}. \n ` : `${action.pokemon} de ${player} ${redirected}  utilise ${move}${missed}${boost}${unboost}. \n `;
                } else if (action.action === 'terastallize') {
                    resultText += `${action.pokemon} Terastallise ${action.pokemon} en type ${action.type}. \n `;
                } else if (action.action === 'faint') {
                    resultText += `${action.pokemon} est KO! \n `;
                } else if (action.action === 'boost') {
                    resultText += `${action.pokemon} augmente ses statistiques : ${action.boost}. \n `;
                } else if (action.action === 'unboost') {
                    resultText += `${action.pokemon} perd un boost de statistique : ${action.unboost}. \n `;
                } else if (action.action === 'ability') {
                    resultText += `${action.pokemon} utilise sont talent : ${action.move}. \n `;
                } else if (action.action === 'fail') {
                    resultText += this.getFail(action,replayData);
                } else if(action.action === 'immune'){
                    resultText += `${action.target} est immunisé contre ${action.move}. \n `;
                } else if(action.action === 'activate'){
                    resultText += this.getActivate(action);
                } else if(action.action === 'start'){
                    resultText += this.getStart(action);
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


    getStart(action: Action): string {
        // console.log(action);
        const move = action.move?.includes('move:') ? action.move?.replace('move: ', '') : action.move;
        switch(move){
            case 'Yawn': return `${action.target} deviens somnolent à cause de ${action.from?.split(':')[1]}, il s'endormira s'il attaque une fois de plus. \n `;
            case 'confusion': return `${action.target} deviens confus à cause de ${action.from === 'fatigue' ? ' la fatigue (un effet de son attaque)' : action.from}. \n `;
        }
        return "";
    }

    getActivate(action: Action): string {
        return `${action.target} est protégé grâce à ${action.move?.replace('move: ', '')}.`;
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
        if(action.move === 'Wide Guard') return `${action.move}, ce qui protège sont équipe des attaques de zones pour ce tour`;

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
        }
        if (action.from?.includes('ability')) becauseTextFr = ` à cause de son talent : ${action.from?.toString().split(':')[1].trim()}`
        

        const playerName = replayData.game.players.find(player=> player.id == action.playerTarget?.replace('a','').replace('b',''))?.name;
        return `La tentative de ${actionTextFr} sur le ${action.target} de ${playerName} rate${becauseTextFr}. \n `;
    }

    getLeads(replayData: ReplayData): string {
        return replayData.game.game_info.leads.map(lead=> {  
            const playerName = replayData.game.players.find(player=> player.id == lead.split(':')[0].replace('a','').replace('b',''))?.name;
            return ` Le joueur ${playerName} envoie ${lead.split(':')[1]}. `
        }).join('\n') + ' \n ';
    }

    getActionTarget(action: Action, replayData: ReplayData): string {
        if (action.target?.includes('spread')){
            let resultTxt = "";
            const p1Player = replayData.game.players[0];
            const p2Player = replayData.game.players[1];
            const playerTarget = action.playerTarget?.includes("p1") ? p1Player.name : p2Player.name;
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
            const damage_recoil = damage_list.find(damage=> damage.damageTargetId == action.player);
            const damage_classic = damage_list.filter(damage=> damage.damageTargetId != action.player);
            moveEffect = this.formatDamage(damage_classic) + ' et ' + this.formatDamageRecoil(damage_recoil);
        }else{
            moveEffect = this.formatDamage(damage_list);
        }
        return moveEffect;
    }

    formatDamageRecoil(damage_recoil: any){
        const result = damage_recoil.damageValue == 'KO' ? 'ce qui le met KO' : `se retrouvant avec ${damage_recoil.damageValue} de point de vie`;
        return `${damage_recoil.damageTarget} s'inflige des dégats, ${result}`;
    }

    formatDamage(damage_list: any){
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
        return resisted_list?.length > 1 ?  `, ça a été résisté par ${resisted_list[0]} et ${resisted_list[1]}` : `, ça a été résisté par ${resisted_list[0]}`;
    }

    getPokemonString(pokemon: Pokemon): string {
        return `${pokemon.pokemon} ( Niveau: ${pokemon.level}, Item : ${pokemon.item}, Ability : ${pokemon.ability}, Moves: ${pokemon.moves.join(', ')} )`;
    }
}
