import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Observable, from, map, mergeMap, catchError, forkJoin, of, tap, toArray, filter } from 'rxjs';
import * as fs from 'fs/promises';
import * as XLSX from 'xlsx';
import { AppService } from '../../app.service';
import { WriteTextForIAService } from '../write-txt-for-ia/write-text-for-IA.service';
import { ParseLogsService } from '../parse-logs/parse-logs.service';
import { ReplayData, SheetResult } from 'src/types/game.types';
import * as pokemonData from '../../base/pokemon_data_with_translations.json';
import * as abilityData from '../../base/ability_data_with_translations.json';
import * as itemData from '../../base/item_data_with_translations.json';
import * as moveData from '../../base/move_data_with_translations.json';
import * as path from 'path';

@Injectable()
export class CreateReplaysForFinetuningService {
    constructor(
      private httpService: HttpService,
      private parseLogsService: ParseLogsService,
      private writeTextForIAService: WriteTextForIAService
    ) {}

    processSheets(files: any[]): Observable<SheetResult[]> {
      return from(files).pipe(
        mergeMap(file => from(file.sheets)),
        mergeMap((sheet: { data: { Tour: string; Reflexion: string; Replay: string }[] }) => {
          const firstRow = sheet.data[0];
          const replayUrl = firstRow?.Replay;

          if (!replayUrl) {
            console.warn('Pas d\'URL de replay trouvée dans la première ligne');
            return of(null);
          }

          const analyse = sheet.data
            .map(row => `\n Tour ${row.Tour}: ${row.Reflexion}. \n`)
            .join(' ');

          return this.formatReplay([replayUrl]).pipe(
            map(replayResult => {
                const replayResultString = JSON.parse(replayResult)[0];
                return {
                    prompt: replayResultString,
                    response: analyse+ " \n \n ----------------------------------------------- \n " + this.writeDictionaryForThisMatch(replayResultString)
                }
            })
          );
        }),
        filter(result => result !== null),
        toArray(),
        tap(async (results) => {
          try {
            const exportPath = '/home/nac/Documents/Projets/VGC-showdown-replay-formatter/export';
            const filePath = path.join(exportPath, 'replay-annotated-for-training.json');
            
            // Créer le dossier export s'il n'existe pas
            await fs.mkdir(exportPath, { recursive: true });
            
            // Écrire le fichier JSON
            await fs.writeFile(
              filePath,
              JSON.stringify(results, null, 2),
              'utf-8'
            );
            
            console.log(`Fichier JSON créé avec succès: ${filePath}`);
          } catch (error) {
            console.error('Erreur lors de l\'écriture du fichier JSON:', error);
          }
        })
      );
    }

    private writeDictionaryForThisMatch(replayResult: string): string {
        const startBattle = replayResult.split("The battle begins!")[0];
        const teamPart = startBattle.split("has the following Pokémons :");
        const teamA = teamPart?.map((part)=> this.removeLastWord(part?.trim()).trim() )[1];
        const teamB = teamPart?.map((part)=> this.removeLastWord(part?.trim()).trim() )[2];
        const dictionary = {
            pokemon: [] as string[],
            ability: [] as string[],
            item: [] as string[],
            moves: [] as string[]
        }
        
        const pokemonTeamA = this.getPokemonsOfTheMatch(teamA, dictionary.pokemon);
        const pokemonTeamB = this.getPokemonsOfTheMatch(teamB, dictionary.pokemon);
        const pokemonOfTheMatch = [...pokemonTeamA, ...pokemonTeamB];

        dictionary.pokemon = this.getPokemonsWithDetail(pokemonOfTheMatch);
        dictionary.ability = this.getAbilities(pokemonOfTheMatch);
        dictionary.item = this.getItems(pokemonOfTheMatch);
        dictionary.moves = this.getMoves(pokemonOfTheMatch);
        return `Dictionnary for this game :\n
Pokemon: \n${dictionary.pokemon.join('\n')}\n
Abilities: \n${dictionary.ability.join('\n')}\n
Items: \n${dictionary.item.join('\n')}\n
Moves: \n${dictionary.moves.join('\n')}
`;
    }

    private getPokemonsWithDetail(pokemonOfTheMatch: string[]): string[] {
        const pokemonDataArray = Object.values(pokemonData);
        
        return pokemonOfTheMatch.map((pokemon) => {
            const name = pokemon.split('(')[0].trim();
            const moves = this.getMoveOfPokemon(pokemon);
            const ability = this.getAbility(pokemon);
            const item = this.getItem(pokemon);
            const sanitizedName = this.sanitizeName(name);
            const pokemonInfo = pokemonDataArray.find(p => p.name?.toLowerCase() === sanitizedName);
            if (pokemonInfo) {
                return `- ${name} (Types: ${pokemonInfo.types.join(', ')} / Ability : ${ability} / Item : ${item} / Base stats: ${pokemonInfo.stats.map((stat)=> `${stat.name}: ${stat.base_stat}`).join(', ')} / Moves : ${moves.join(', ')} / Translations : ${Object.keys(pokemonInfo.translations).map((key)=> `${key}: ${pokemonInfo.translations[key]}`).join(', ')} )`;
            }
            return '***' + pokemon;
        });
    }

    private sanitizeName(name: string): string {
        if(name.split(' ').length > 1) {
            return name.split(' ').map((word)=> word.toLowerCase()).join('-');
        }
        return this.sanitizeNameSpecialCase(name.toLowerCase());
    }

    private sanitizeNameSpecialCase(name: any) {
        if(name === 'basculegion') return 'basculegion-male';
        if(name === 'basculegion-f') return 'basculegion-female';
        if(name === 'indeedee-f') return 'indeedee-female';
        if(name === 'indeedee') return 'indeedee-male';
        if(name === 'urshifu') return 'urshifu-single-strike';
        if(name === 'raging bolt') return 'raging-bolt';
        if(name === 'flutter mane') return 'flutter-mane';
        if(name === 'iron hands') return 'iron-hands';
        if(name === 'iron leaves') return 'iron-leaves';
        if(name === 'iron valiant') return 'iron-valiant';
        if(name === 'iron crown') return 'iron-crown';
        if(name === 'iron boulder') return 'iron-boulder';
        if(name === 'iron jugulis') return 'iron-jugulis';
        if(name === 'roaring moon') return 'roaring-moon';
        if(name === 'brute bonnet') return 'brute-bonnet';
        if(name === 'iron treads') return 'iron-treads';
        if(name === 'scream tail') return 'scream-tail';
        if(name === 'lycanroc') return 'lycanroc-midday';
        if(name === 'mimikyu') return 'mimikyu-disguised';
        if(name === 'toxtricity') return 'toxtricity-amped';
        if(name === 'tatsugiri') return 'tatsugiri-curly';
        if(name === 'maushold') return 'maushold-family-of-four';
        if(name === 'palafin') return 'palafin-zero';
        if(name.includes('ogerpon') && name != 'ogerpon') return `${name.toLowerCase()}-mask`;
        if(['tornadus', 'thundurus', 'landorus'].includes(name)) return `${name}-incarnate`;
        if(name === 'tauros-paldea-blaze') return 'tauros-paldea-blaze-breed';
        if(name === 'tauros-paldea-aqua') return 'tauros-paldea-aqua-breed';
        if(name.includes('necrozma')) return name.replace('-wings','');
        return name;
    }

    private getMoves(pokemonOfTheMatch: string[]): string[] {
        const moveDataArray = Object.values(moveData);
        const moves: string[] = [];
        pokemonOfTheMatch.forEach(pokemon => {
            const move = this.getMoveOfPokemon(pokemon) || [];
            move.forEach(move => {
                if (move && moves.findIndex(m => m.includes(move)) == -1) {
                    const moveInfo = moveDataArray.filter((move)=> !!move.name).find(m => {
                        return m.name === this.sanitizeMove(move)
                    });
                    if (moveInfo) {
                        const moveEffect = moveInfo?.effect_entries?.en || moveInfo?.effect_entries?.de || '';
                        const moveTranslations = moveInfo?.translations || {};
                        moves.push(`- ${move}: ${moveEffect.replace(/\n/g, '')} Damages: ${moveInfo?.power}, Type: ${moveInfo?.type}, Category: ${moveInfo?.category}, Accuracy: ${moveInfo?.accuracy}, PP: ${moveInfo?.pp} (Translations: ${Object.keys(moveTranslations).map((key)=> `${key}: ${moveTranslations[key]}`).join(', ')})`);
                    }else{
                        console.error('Move not found: ', move);
                        moves.push(`- ${move}`);
                    }
                }
            });
        });
        return moves;
    }

    private getMoveOfPokemon(pokemon: string): string[] {
        const strSplit = pokemon?.split('Moves: ');
        const move = strSplit?.length > 0 ? strSplit[1] : '';
        const str2Split = move?.replace(')', '');
        return str2Split.split(',').map((move)=> move.trim());
    }

    private getAbilities(pokemonOfTheMatch: string[]): string[] {
        const abilityDataArray = Object.values(abilityData);
        const abilities: string[] = [];
        pokemonOfTheMatch.forEach(pokemon => {
            const ability = this.getAbility(pokemon) || '';
            let sanitizedAbility = this.sanitizeAbility(ability);
            const abilityInfo = abilityDataArray.find(a => a.name?.toLowerCase() === sanitizedAbility);
            const index = abilities.findIndex(a => a.includes(ability));
            if (abilityInfo && index == -1) {
                const abilityEffect = abilityInfo?.effect_entries?.en || abilityInfo?.effect_entries?.de || '';
                const abilityTranslations = abilityInfo?.translations || {};
                abilities.push(`- ${sanitizedAbility}: ${abilityEffect.replace(/\n/g, '')} (Translations: ${Object.keys(abilityTranslations).map((key)=> `${key}: ${abilityTranslations[key]}`).join(', ')})`);
            }
        });
        return abilities;
    }

    private sanitizeMove(move: string): string {
        if(move === "Uturn") return "u-turn";
        if(move === "WillOWisp") return "will-o-wisp";
        if(move === "behemothbash") return "behemoth-bash";
        return this.camelToKebab(move);
    }

    private sanitizeAbility(ability: string): string {
        if(ability === "BeadsofRuin") return "beads-of-ruin";
        return this.camelToKebab(ability);
    }

    private getItems(pokemonOfTheMatch: string[]): string[] {
        const items: string[] = [];
        const itemDataArray = Object.values(itemData);
        pokemonOfTheMatch.forEach(pokemon => {
            const item = this.getItem(pokemon) || '';
            if (!!item && !items.includes(item)) {
                const itemInfo = itemDataArray.filter((item)=> !!item.name).find(i => {
                    return this.camelToKebab(i.name) === this.camelToKebab(item)
                });
                if(!itemInfo) items.push(item); 
                const itemEffect = itemInfo?.descriptions?.en || itemInfo?.descriptions?.de || '';
                const itemTranslations = itemInfo?.translations || {};
                items.push(`- ${item}: ${itemEffect} (Translations: ${Object.keys(itemTranslations).map((key)=> `${key}: ${itemTranslations[key]}`).join(', ')})`.replace(/\n/g, ''));
            }
        });
        return items;
    }

    private camelToKebab(str: string): string {
        return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }

    private getItem(pokemon: string): string {
        const strSplit = pokemon?.split('Item : ');
        const item = strSplit?.length > 0 ? strSplit[1] : '';
        const str2Split = item?.split(',');
        const item2 = str2Split?.length > 0 ? str2Split[0] : '';
        return item2 || '';
    }

    private getAbility(pokemon: string): string {
        const strSplit = pokemon?.split('Ability : ');
        const ability = strSplit?.length > 0 ? strSplit[1] : '';
        const str2Split = ability?.split(',');
        const ability2 = str2Split?.length > 0 ? str2Split[0] : '';
        return ability2 || '';
    }

    private getPokemonsOfTheMatch(team: string, dictionary: string[]): string[] {
        if (!team) {
            return dictionary;
        }
        
        // Diviser l'équipe en lignes individuelles
        const pokemonLines = team.split(' / ');
        pokemonLines[pokemonLines.length - 1] = pokemonLines[pokemonLines.length - 1].split(').')[0]+')';

        return pokemonLines;
    }

    private removeLastWord(string: string): string {
        return string.split(" ").slice(0, -1).join(" ");
    }

    private formatReplay(data: string[]): Observable<string> {
        const requests = data.map(url =>
        this.httpService.get(url).pipe(
            map(response => response.data),
            map(text => this.parseLogsService.parseGameJson(text)),
            map(text => this.writeTextForIAService.translateGameInFr(text as ReplayData)),
            catchError(error => {
            console.error(`Erreur pour l'URL ${url}:`, error);
            return from([null]);
            })
        )
        );

        return forkJoin(requests).pipe(
        map(results => JSON.stringify(results)),
        catchError(error => {
            console.error('Erreur lors du traitement:', error);
            throw error;
        })
        );
    }

    public readReplays(path: string): Observable<any[]> {
        return from(fs.readdir(path)).pipe(
            mergeMap(files => from(files.filter(file => file.endsWith('.xlsx')))),
            mergeMap(file => {
                const filePath = require('path').join(path, file);
                return from(fs.readFile(filePath)).pipe(
                    map(buffer => {
                        const workbook = XLSX.read(buffer);
                        const sheetNames = workbook.SheetNames;

                        // Lire toutes les feuilles
                        const allSheets = sheetNames.map(sheetName => {
                            const sheet = workbook.Sheets[sheetName];
                            const data = XLSX.utils.sheet_to_json(sheet);
                            return {
                                sheetName,
                                data
                            };
                        });

                        return {
                            fileName: file,
                            sheets: allSheets
                        };
                    })
                );
            }),
            toArray()
        );
    }
}
