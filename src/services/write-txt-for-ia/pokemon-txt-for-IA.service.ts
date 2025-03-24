import { Injectable } from '@nestjs/common';
import { Action, Pokemon, ReplayData } from '../../types/game.types';
import { UtilityService } from '../utility/utility.service';

@Injectable()
export class PokemonTxtForIAService {

    constructor(private utilityService: UtilityService) {}

    getLeads(replayData: ReplayData): string {
        return replayData.game.game_info.leads.map(lead=> {  
            const playerName = replayData.game.players.find(player=> player.id == lead.split(':')[0].replace('a','').replace('b',''))?.name;
            return ` ${playerName} sends ${lead.split(':')[1]}. `
        }).join('') + '  ';
    }
    getLeadsForLangGraph(replayData: ReplayData): string {
        return replayData.game.game_info.leads.map(lead=> {  
            const playerName = replayData.game.players.find(player=> player.id == lead.split(':')[0].replace('a','').replace('b',''))?.name;
            return `<LEAD><PLAYER> ${playerName} </PLAYER>${lead.split(':')[1]}</LEAD> `
        }).join('') + '  ';
    }

    getPokemonString(pokemon: Pokemon): string {
        return `${pokemon.pokemon} ( Level: ${pokemon.level}, Item : ${pokemon.item}, Ability : ${pokemon.ability}, Moves: ${pokemon.moves.join(', ')} )`;
    }

    getNicknames(replayData: ReplayData): string {
        let nicknamesSentence: string[] = [];
        replayData.game.players.forEach(player=> {
            player.team.forEach(pokemon=> {
                if(!!pokemon.nickname && pokemon.nickname?.trim() !== pokemon.pokemon?.trim()) {
                    nicknamesSentence.push(`The pokemon ${pokemon.pokemon} of ${player.name} is renamed for this match ${pokemon.nickname}.`);
                }
            });
        });
        return nicknamesSentence.join('  ')+ '  ';
    }
}
