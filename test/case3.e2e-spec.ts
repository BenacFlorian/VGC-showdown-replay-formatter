import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { of } from 'rxjs';
import { HttpService } from '@nestjs/axios';

describe('Case 3', () => {
  let app: INestApplication;
  let httpService: HttpService;

  const mockReplayData = `|j|☆NacDuBourgPalette
|j|☆Smoukingrad
|html|<table width="100%"><tr><td align="left">NacDuBourgPalette</td><td align="right">Smoukingrad</tr><tr><td align="left"><i class="fa fa-circle-o"></i> <i class="fa fa-circle-o"></i> </td><td align="right"><i class="fa fa-circle-o"></i> <i class="fa fa-circle-o"></i> </tr></table>
|uhtml|bestof|<h2><strong>Game 1</strong> of <a href="/game-bestof3-gen9vgc2025reggbo3-2292039385">a best-of-3</a></h2>
|t:|1738357066
|gametype|doubles
|player|p1|NacDuBourgPalette|1|
|player|p2|Smoukingrad|kimonogirl|
|teamsize|p1|6
|teamsize|p2|6
|gen|9
|tier|[Gen 9] VGC 2025 Reg G (Bo3)
|rule|Species Clause: Limit one of each Pokémon
|rule|Item Clause: Limit 1 of each item
|clearpoke
|poke|p1|Grimmsnarl, L50, M|
|poke|p1|Amoonguss, L50, F|
|poke|p1|Chien-Pao, L50|
|poke|p1|Rillaboom, L50, F|
|poke|p1|Torkoal, L50, F|
|poke|p1|Farigiraf, L50, M|
|poke|p2|Calyrex-Ice, L50|
|poke|p2|Indeedee-F, L50, F|
|poke|p2|Venusaur, L50, F|
|poke|p2|Arcanine-Hisui, L50, F|
|poke|p2|Garganacl, L50, M|
|poke|p2|Roaring Moon, L50|
|teampreview|4
|showteam|p1|Grimmsnarl||FocusSash|Prankster|FakeOut,FakeTears,Reflect,LightScreen|||M|||50|,,,,,Dark]Amoonguss||Leftovers|EffectSpore|Spore,RagePowder,PollenPuff,ClearSmog|||F|||50|,,,,,Grass]Chien-Pao||ExpertBelt|SwordofRuin|SuckerPunch,IceSpinner,Recover,Mist||||||50|,,,,,Dark]Rillaboom||AssaultVest|GrassySurge|FakeOut,Endeavor,DrainPunch,Substitute|||F|||50|,,,,,Grass]Torkoal||Charcoal|WhiteSmoke|LavaPlume,Yawn,ShellSmash,WillOWisp|||F|||50|,,,,,Fire]Farigiraf||ThroatSpray|ArmorTail|HyperVoice,HyperBeam,Imprison,FoulPlay|||M|||50|,,,,,Normal
|showteam|p2|Calyrex-Ice||Leftovers|AsOneGlastrier|TrickRoom,Protect,Encore,Curse||||||50|,,,,,Psychic]Indeedee-F||ExpertBelt|PsychicSurge|FollowMe,BatonPass,HealingWish,Psyshock|||F|||50|,,,,,Psychic]Venusaur||LifeOrb|Overgrow|SolarBeam,SludgeBomb,Protect,AcidSpray|||F|||50|,,,,,Grass]Arcanine-Hisui||FocusSash|Intimidate|HeadSmash,RagingFury,Protect,CloseCombat|||F|||50|,,,,,Fire]Garganacl||ScopeLens|PurifyingSalt|WideGuard,SaltCure,Rest,Explosion|||M|||50|,,,,,Dragon]Roaring Moon||IapapaBerry|Protosynthesis|DragonCheer,Protect,Tailwind,BodySlam||||||50|,,,,,Dragon
|inactive|Battle timer is ON: inactive players will automatically lose when time's up. (requested by NacDuBourgPalette)
|inactiveoff|Battle timer is now OFF.
|
|t:|1738357115
|start
|switch|p1a: Grimmsnarl|Grimmsnarl, L50, M|100/100
|switch|p1b: Rillaboom|Rillaboom, L50, F|100/100
|switch|p2a: Garganacl|Garganacl, L50, M|100/100
|switch|p2b: Roaring Moon|Roaring Moon, L50|100/100
|-fieldstart|move: Grassy Terrain|[from] ability: Grassy Surge|[of] p1b: Rillaboom
|turn|1
|
|t:|1738357137
|move|p2b: Roaring Moon|Protect|p2b: Roaring Moon
|-singleturn|p2b: Roaring Moon|Protect
|move|p1b: Rillaboom|Fake Out|p2a: Garganacl
|-resisted|p2a: Garganacl
|-damage|p2a: Garganacl|95/100
|move|p1a: Grimmsnarl|Light Screen|p1a: Grimmsnarl
|-sidestart|p1: NacDuBourgPalette|move: Light Screen
|cant|p2a: Garganacl|flinch
|
|-heal|p2a: Garganacl|100/100|[from] Grassy Terrain
|upkeep
|turn|2
|
|t:|1738357178
|switch|p1b: Chien-Pao|Chien-Pao, L50|100/100
|-ability|p1b: Chien-Pao|Sword of Ruin
|-terastallize|p2a: Garganacl|Dragon
|move|p2a: Garganacl|Wide Guard|p2a: Garganacl
|-singleturn|p2a: Garganacl|Wide Guard
|move|p1a: Grimmsnarl|Fake Tears|p2a: Garganacl
|-unboost|p2a: Garganacl|spd|2
|move|p2b: Roaring Moon|Dragon Cheer|p2a: Garganacl
|-start|p2a: Garganacl|move: Dragon Cheer
|
|upkeep
|turn|3
|
|t:|1738357222
|switch|p1a: Amoonguss|Amoonguss, L50, F|100/100
|move|p2a: Garganacl|Wide Guard|p2a: Garganacl
|-singleturn|p2a: Garganacl|Wide Guard
|move|p1b: Chien-Pao|Sucker Punch||[still]
|-fail|p1b: Chien-Pao
|move|p2b: Roaring Moon|Tailwind|p2b: Roaring Moon
|-sidestart|p2: Smoukingrad|move: Tailwind
|
|upkeep
|turn|4
|
|t:|1738357257
|-end|p2b: Roaring Moon|Protosynthesis|[silent]
|switch|p2b: Venusaur|Venusaur, L50, F|100/100
|move|p1b: Chien-Pao|Mist|p1b: Chien-Pao
|-sidestart|p1: NacDuBourgPalette|Mist
|move|p2a: Garganacl|Salt Cure|p1b: Chien-Pao
|-supereffective|p1b: Chien-Pao
|-crit|p1b: Chien-Pao
|-damage|p1b: Chien-Pao|19/100
|-start|p1b: Chien-Pao|Salt Cure
|move|p1a: Amoonguss|Spore|p2b: Venusaur
|-immune|p2b: Venusaur
|
|-heal|p1b: Chien-Pao|25/100|[from] Grassy Terrain
|-damage|p1b: Chien-Pao|13/100|[from] Salt Cure
|upkeep
|turn|5
|
|t:|1738357286
|move|p2a: Garganacl|Wide Guard|p2a: Garganacl
|-singleturn|p2a: Garganacl|Wide Guard
|move|p2b: Venusaur|Solar Beam||[still]
|-prepare|p2b: Venusaur|Solar Beam
|move|p1b: Chien-Pao|Recover|p1b: Chien-Pao
|-heal|p1b: Chien-Pao|63/100
|move|p1a: Amoonguss|Clear Smog|p2a: Garganacl
|-damage|p2a: Garganacl|59/100
|-clearboost|p2a: Garganacl
|
|-heal|p1b: Chien-Pao|69/100|[from] Grassy Terrain
|-heal|p2a: Garganacl|65/100|[from] Grassy Terrain
|-damage|p1b: Chien-Pao|57/100|[from] Salt Cure
|-sideend|p1: NacDuBourgPalette|move: Light Screen
|-fieldend|move: Grassy Terrain
|upkeep
|turn|6
|
|t:|1738357340
|move|p1b: Chien-Pao|Sucker Punch||[still]
|-fail|p1b: Chien-Pao
|move|p2b: Venusaur|Solar Beam|p1a: Amoonguss|[from] lockedmove
|-resisted|p1a: Amoonguss
|-damage|p1a: Amoonguss|84/100
|-damage|p2b: Venusaur|91/100|[from] item: Life Orb
|move|p2a: Garganacl|Rest||[still]
|-fail|p2a: Garganacl
|move|p1a: Amoonguss|Pollen Puff|p1b: Chien-Pao
|-heal|p1b: Chien-Pao|100/100
|
|-heal|p1a: Amoonguss|90/100|[from] item: Leftovers
|-damage|p1b: Chien-Pao|88/100|[from] Salt Cure
|-sideend|p2: Smoukingrad|move: Tailwind
|upkeep
|turn|7
|
|t:|1738357376
|switch|p1a: Rillaboom|Rillaboom, L50, F|100/100
|-fieldstart|move: Grassy Terrain|[from] ability: Grassy Surge|[of] p1a: Rillaboom
|move|p1b: Chien-Pao|Recover|p1b: Chien-Pao
|-heal|p1b: Chien-Pao|100/100
|move|p2b: Venusaur|Acid Spray|p1b: Chien-Pao
|-damage|p1b: Chien-Pao|60/100
|-damage|p2b: Venusaur|81/100|[from] item: Life Orb
|move|p2a: Garganacl|Salt Cure|p1a: Rillaboom
|-crit|p1a: Rillaboom
|-damage|p1a: Rillaboom|64/100
|-start|p1a: Rillaboom|Salt Cure
|
|-heal|p1b: Chien-Pao|66/100|[from] Grassy Terrain
|-heal|p2b: Venusaur|87/100|[from] Grassy Terrain
|-heal|p1a: Rillaboom|70/100|[from] Grassy Terrain
|-heal|p2a: Garganacl|71/100|[from] Grassy Terrain
|-damage|p1b: Chien-Pao|54/100|[from] Salt Cure
|-damage|p1a: Rillaboom|58/100|[from] Salt Cure
|upkeep
|turn|8
|
|t:|1738357411
|move|p2a: Garganacl|Wide Guard|p2a: Garganacl
|-singleturn|p2a: Garganacl|Wide Guard
|move|p1b: Chien-Pao|Ice Spinner|p2b: Venusaur
|-supereffective|p2b: Venusaur
|-damage|p2b: Venusaur|0 fnt
|-fieldend|move: Grassy Terrain
|faint|p2b: Venusaur
|move|p1a: Rillaboom|Endeavor|p2a: Garganacl
|-damage|p2a: Garganacl|58/100
|
|-damage|p1b: Chien-Pao|42/100|[from] Salt Cure
|-damage|p1a: Rillaboom|46/100|[from] Salt Cure
|-sideend|p1: NacDuBourgPalette|Mist
|upkeep
|
|t:|1738357418
|switch|p2b: Calyrex|Calyrex-Ice, L50|100/100
|-ability|p2b: Calyrex|As One
|-ability|p2b: Calyrex|Unnerve
|turn|9
|
|t:|1738357446
|move|p2b: Calyrex|Protect|p2b: Calyrex
|-singleturn|p2b: Calyrex|Protect
|move|p1a: Rillaboom|Fake Out||[still]
|-hint|Fake Out only works on your first turn out.
|-fail|p1a: Rillaboom
|move|p1b: Chien-Pao|Ice Spinner|p2b: Calyrex
|-activate|p2b: Calyrex|move: Protect
|move|p2a: Garganacl|Explosion|p1b: Chien-Pao|[spread] p1a,p1b
|-activate|p2b: Calyrex|move: Protect
|-crit|p1a: Rillaboom
|-crit|p1b: Chien-Pao
|-damage|p1a: Rillaboom|0 fnt
|-damage|p1b: Chien-Pao|0 fnt
|faint|p2a: Garganacl
|faint|p1a: Rillaboom
|faint|p1b: Chien-Pao
|
|upkeep
|
|t:|1738357460
|switch|p1b: Amoonguss|Amoonguss, L50, F|90/100
|switch|p1a: Grimmsnarl|Grimmsnarl, L50, M|100/100
|switch|p2a: Roaring Moon|Roaring Moon, L50|100/100
|turn|10
|
|t:|1738357491
|move|p1b: Amoonguss|Rage Powder|p1b: Amoonguss
|-singleturn|p1b: Amoonguss|move: Rage Powder
|move|p1a: Grimmsnarl|Fake Tears|p2a: Roaring Moon
|-hint|Since gen 7, Dark is immune to Prankster moves.
|-immune|p2a: Roaring Moon
|move|p2a: Roaring Moon|Dragon Cheer|p2b: Calyrex
|-start|p2b: Calyrex|move: Dragon Cheer
|move|p2b: Calyrex|Curse|p2b: Calyrex
|-unboost|p2b: Calyrex|spe|1
|-boost|p2b: Calyrex|atk|1
|-boost|p2b: Calyrex|def|1
|
|-heal|p1b: Amoonguss|96/100|[from] item: Leftovers
|upkeep
|turn|11
|
|t:|1738357524
|move|p1a: Grimmsnarl|Fake Out||[still]
|-hint|Fake Out only works on your first turn out.
|-fail|p1a: Grimmsnarl
|move|p1b: Amoonguss|Rage Powder|p1b: Amoonguss
|-singleturn|p1b: Amoonguss|move: Rage Powder
|move|p2a: Roaring Moon|Dragon Cheer||[still]
|-fail|p2a: Roaring Moon
|move|p2b: Calyrex|Trick Room|p2b: Calyrex
|-fieldstart|move: Trick Room|[of] p2b: Calyrex
|
|-heal|p1b: Amoonguss|100/100|[from] item: Leftovers
|upkeep
|turn|12
|
|t:|1738357536
|move|p1b: Amoonguss|Rage Powder|p1b: Amoonguss
|-singleturn|p1b: Amoonguss|move: Rage Powder
|move|p1a: Grimmsnarl|Reflect|p1a: Grimmsnarl
|-sidestart|p1: NacDuBourgPalette|Reflect
|move|p2b: Calyrex|Encore|p1b: Amoonguss
|-start|p1b: Amoonguss|Encore
|move|p2a: Roaring Moon|Body Slam|p1b: Amoonguss
|-damage|p1b: Amoonguss|81/100
|-status|p2a: Roaring Moon|slp|[from] ability: Effect Spore|[of] p1b: Amoonguss
|
|-heal|p1b: Amoonguss|87/100|[from] item: Leftovers
|upkeep
|turn|13
|-message|NacDuBourgPalette forfeited.
|
|win|Smoukingrad
||Smoukingrad is ready for game 2.
|inactive|NacDuBourgPalette has 30 seconds to confirm battle start!
||NacDuBourgPalette is ready for game 2.
|uhtml|next|Next: <a href="/battle-gen9vgc2025reggbo3-2292043749"><strong>Game 2 of 3</strong></a>`;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider(HttpService)
    .useValue({
      get: jest.fn(() => of({ data: mockReplayData }))
    })
    .compile();

    app = moduleFixture.createNestApplication();
    httpService = moduleFixture.get<HttpService>(HttpService);
    await app.init();
  });

  it('/format-replay (POST) should format replay correctly / Case 3', () => {
    return request(app.getHttpServer())
      .post('/format-replays')
      .send(["https://replay.pokemonshowdown.com/gen9vgc2025reggbo3-2292039386.log"])
      .expect(200)
      .then(response => {
        expect(response.text).toBeDefined();
        
        const actual = JSON.parse(response.text)[0].replace(/\s+/g, ' ');
        const expected = `Le match oppose NacDuBourgPalette et Smoukingrad. \n Le joueur NacDuBourgPalette a les Pokémons suivants : Grimmsnarl
( Niveau: 50, Item : FocusSash, Ability : Prankster, Moves: FakeOut, FakeTears, Reflect, LightScreen ), Amoonguss (
Niveau: 50, Item : Leftovers, Ability : EffectSpore, Moves: Spore, RagePowder, PollenPuff, ClearSmog ), Chien-Pao (
Niveau: 50, Item : ExpertBelt, Ability : SwordofRuin, Moves: SuckerPunch, IceSpinner, Recover, Mist ), Rillaboom (
Niveau: 50, Item : AssaultVest, Ability : GrassySurge, Moves: FakeOut, Endeavor, DrainPunch, Substitute ), Torkoal (
Niveau: 50, Item : Charcoal, Ability : WhiteSmoke, Moves: LavaPlume, Yawn, ShellSmash, WillOWisp ), Farigiraf ( Niveau:
50, Item : ThroatSpray, Ability : ArmorTail, Moves: HyperVoice, HyperBeam, Imprison, FoulPlay ). \n Le joueur
Smoukingrad a les Pokémons suivants : Calyrex-Ice ( Niveau: 50, Item : Leftovers, Ability : AsOneGlastrier, Moves:
TrickRoom, Protect, Encore, Curse ), Indeedee-F ( Niveau: 50, Item : ExpertBelt, Ability : PsychicSurge, Moves:
FollowMe, BatonPass, HealingWish, Psyshock ), Venusaur ( Niveau: 50, Item : LifeOrb, Ability : Overgrow, Moves:
SolarBeam, SludgeBomb, Protect, AcidSpray ), Arcanine-Hisui ( Niveau: 50, Item : FocusSash, Ability : Intimidate, Moves:
HeadSmash, RagingFury, Protect, CloseCombat ), Garganacl ( Niveau: 50, Item : ScopeLens, Ability : PurifyingSalt, Moves:
WideGuard, SaltCure, Rest, Explosion ), Roaring Moon ( Niveau: 50, Item : IapapaBerry, Ability : Protosynthesis, Moves:
DragonCheer, Protect, Tailwind, BodySlam ). \n Le match commence ! \n Le joueur NacDuBourgPalette envoie Grimmsnarl. \n
Le joueur NacDuBourgPalette envoie Rillaboom. \n Le joueur Smoukingrad envoie Garganacl. \n Le joueur Smoukingrad envoie
Roaring Moon. \n Tour 0 :\n Rillaboom de NacDuBourgPalette place son Grassy Terrain à cause de son talent : Grassy
Surge. \n Tour 1 :\n Roaring Moon de Smoukingrad utilise Protect . \n Rillaboom de NacDuBourgPalette utilise Fake Out
sur Garganacl de Smoukingrad il lui laisse 95/100 de point de vie , ça a été résisté par Garganacl. \n Grimmsnarl de
NacDuBourgPalette utilise Light Screen, ce qui réduit de moitié les dégats spéciaux reçu par son équipe pour les tours à
venir. \n Garganacl de Smoukingrad ne peut pas attaquer ce tour-ci car il a été effrayé. \n Garganacl de Smoukingrad est
soigné jusqu'a 100/100 point de vie grâce à Grassy Terrain. \n Tour 2 :\n Chien-Pao de NacDuBourgPalette est envoyé au
combat. \n Chien-Pao utilise sont talent : Sword of Ruin, ce qui augmente les dégats physiques infligés aux pokemon
alentours. \n Garganacl de Smoukingrad se teracrystalise en type Dragon. \n Garganacl de Smoukingrad utilise Wide Guard,
ce qui protège son équipe des attaques de zones pour ce tour. \n Grimmsnarl de NacDuBourgPalette utilise Fake Tears sur
Garganacl de Smoukingrad . \n Garganacl perd un boost de statistique : spd 2. \n Roaring Moon de Smoukingrad utilise
Dragon Cheer sur Garganacl de Smoukingrad . \n Tour 3 :\n Amoonguss de NacDuBourgPalette est envoyé au combat. \n
Garganacl de Smoukingrad utilise Wide Guard, ce qui protège son équipe des attaques de zones pour ce tour. \n Chien-Pao
de NacDuBourgPalette utilise Sucker Punch . \n La tentative de Sucker Punch du Chien-Pao de NacDuBourgPalette rate. \n
Roaring Moon de Smoukingrad utilise Tailwind, ce qui double la vitesse des pokemon de son équipe pour 4 tours, celui la
compris. \n Tour 4 :\n Venusaur de Smoukingrad est envoyé au combat. \n Chien-Pao de NacDuBourgPalette utilise Mist, ce
qui bloque les modifications de statistiques induites par l'adversaire pendant 5 tours. \n Garganacl de Smoukingrad
utilise Salt Cure sur Chien-Pao de NacDuBourgPalette il lui laisse 19/100 de point de vie . \n C'est super efficace sur
Chien-Pao de NacDuBourgPalette. \n C'est un coup critique sur Chien-Pao de NacDuBourgPalette. \n Amoonguss de
NacDuBourgPalette utilise Spore sur Venusaur de Smoukingrad . \n Venusaur est immunisé contre Spore. \n Chien-Pao de
NacDuBourgPalette est soigné jusqu'a 25/100 point de vie grâce à Grassy Terrain. \n Chien-Pao de NacDuBourgPalette subit
des dégats de Salt Cure, il lui reste 13/100 de point de vie . \n Tour 5 :\n Garganacl de Smoukingrad utilise Wide
Guard, ce qui protège son équipe des attaques de zones pour ce tour. \n Venusaur de Smoukingrad utilise Solar Beam et
rayonne . \n Chien-Pao de NacDuBourgPalette utilise Recover et se soigne jusqu'a 63/100 point de vie. \n Amoonguss de
NacDuBourgPalette utilise Clear Smog sur Garganacl de Smoukingrad il lui laisse 59/100 de point de vie . \n Les boosts
de Garganacl de Smoukingrad ont été annulés. \n Chien-Pao de NacDuBourgPalette est soigné jusqu'a 69/100 point de vie
grâce à Grassy Terrain. \n Garganacl de Smoukingrad est soigné jusqu'a 65/100 point de vie grâce à Grassy Terrain. \n
Chien-Pao de NacDuBourgPalette subit des dégats de Salt Cure, il lui reste 57/100 de point de vie . \n Light Screen de
NacDuBourgPalette n'a plus d'effet. \n Le champ Grassy Terrain a disparu. \n Tour 6 :\n Chien-Pao de NacDuBourgPalette
utilise Sucker Punch . \n La tentative de Sucker Punch du Chien-Pao de NacDuBourgPalette rate. \n Venusaur de
Smoukingrad utilise Solar Beam sur Amoonguss de NacDuBourgPalette il lui laisse 84/100 de point de vie , ça a été
résisté par Amoonguss. \n Venusaur de Smoukingrad subit des dégats de son item Life Orb, il lui reste 91/100 de point de
vie . \n Garganacl de Smoukingrad utilise Rest . \n La tentative de Rest du Garganacl de Smoukingrad rate. \n Amoonguss
de NacDuBourgPalette utilise Pollen Puff sur Chien-Pao de NacDuBourgPalette . \n Chien-Pao de NacDuBourgPalette est
soigné jusqu'a 100/100 point de vie. \n Amoonguss de NacDuBourgPalette est soigné jusqu'a 90/100 point de vie grâce à
item: Leftovers. \n Chien-Pao de NacDuBourgPalette subit des dégats de Salt Cure, il lui reste 88/100 de point de vie .
\n Tailwind de Smoukingrad n'a plus d'effet. \n Tour 7 :\n Rillaboom de NacDuBourgPalette est envoyé au combat. \n
Rillaboom de NacDuBourgPalette place son Grassy Terrain à cause de son talent : Grassy Surge. \n Chien-Pao de
NacDuBourgPalette utilise Recover et se soigne jusqu'a 100/100 point de vie. \n Venusaur de Smoukingrad utilise Acid
Spray sur Chien-Pao de NacDuBourgPalette il lui laisse 60/100 de point de vie . \n Venusaur de Smoukingrad subit des
dégats de son item Life Orb, il lui reste 81/100 de point de vie . \n Garganacl de Smoukingrad utilise Salt Cure sur
Rillaboom de NacDuBourgPalette il lui laisse 64/100 de point de vie . \n C'est un coup critique sur Rillaboom de
NacDuBourgPalette. \n Chien-Pao de NacDuBourgPalette est soigné jusqu'a 66/100 point de vie grâce à Grassy Terrain. \n
Venusaur de Smoukingrad est soigné jusqu'a 87/100 point de vie grâce à Grassy Terrain. \n Rillaboom de NacDuBourgPalette
est soigné jusqu'a 70/100 point de vie grâce à Grassy Terrain. \n Garganacl de Smoukingrad est soigné jusqu'a 71/100
point de vie grâce à Grassy Terrain. \n Chien-Pao de NacDuBourgPalette subit des dégats de Salt Cure, il lui reste
54/100 de point de vie . \n Rillaboom de NacDuBourgPalette subit des dégats de Salt Cure, il lui reste 58/100 de point
de vie . \n Tour 8 :\n Garganacl de Smoukingrad utilise Wide Guard, ce qui protège son équipe des attaques de zones pour
ce tour. \n Chien-Pao de NacDuBourgPalette utilise Ice Spinner sur Venusaur de Smoukingrad ça met Venusaur KO . \n C'est
super efficace sur Venusaur de Smoukingrad. \n Le champ Grassy Terrain a disparu. \n Venusaur est KO! \n Rillaboom de
NacDuBourgPalette utilise Endeavor sur Garganacl de Smoukingrad il lui laisse 58/100 de point de vie . \n Chien-Pao de
NacDuBourgPalette subit des dégats de Salt Cure, il lui reste 42/100 de point de vie . \n Rillaboom de NacDuBourgPalette
subit des dégats de Salt Cure, il lui reste 46/100 de point de vie . \n Mist de NacDuBourgPalette n'a plus d'effet. \n
Calyrex-Ice de Smoukingrad est envoyé au combat. \n Calyrex utilise sont talent : As One. \n Calyrex utilise sont talent
: Unnerve. \n Tour 9 :\n Calyrex de Smoukingrad utilise Protect . \n Rillaboom de NacDuBourgPalette utilise Fake Out .
\n La tentative de Fake Out du Rillaboom de NacDuBourgPalette rate. \n Chien-Pao de NacDuBourgPalette utilise Ice
Spinner sur Calyrex de Smoukingrad . \n Calyrex est protégé grâce à Protect. \n Garganacl de Smoukingrad utilise
Explosion (move de zone) sur Rillaboom de NacDuBourgPalette et Chien-Pao de NacDuBourgPalette ça met Rillaboom et
Chien-Pao KO \n . \n Calyrex est protégé grâce à Protect. \n C'est un coup critique sur Rillaboom de NacDuBourgPalette.
\n C'est un coup critique sur Chien-Pao de NacDuBourgPalette. \n Garganacl est KO! \n Rillaboom est KO! \n Chien-Pao est
KO! \n Amoonguss de NacDuBourgPalette est envoyé au combat. \n Grimmsnarl de NacDuBourgPalette est envoyé au combat. \n
Roaring Moon de Smoukingrad est envoyé au combat. \n Tour 10 :\n Amoonguss de NacDuBourgPalette utilise Rage Powder . \n
Grimmsnarl de NacDuBourgPalette utilise Fake Tears sur Roaring Moon de Smoukingrad . \n Roaring Moon est immunisé contre
Fake Tears. \n Roaring Moon de Smoukingrad utilise Dragon Cheer sur Calyrex de Smoukingrad . \n Calyrex de Smoukingrad
utilise Curse , et gagne plusieurs boost de statistiques : atk 1, def 1, et perd un boost de statistique : spe 1. \n
Amoonguss de NacDuBourgPalette est soigné jusqu'a 96/100 point de vie grâce à item: Leftovers. \n Tour 11 :\n Grimmsnarl
de NacDuBourgPalette utilise Fake Out . \n La tentative de Fake Out du Grimmsnarl de NacDuBourgPalette rate. \n
Amoonguss de NacDuBourgPalette utilise Rage Powder . \n Roaring Moon de Smoukingrad utilise Dragon Cheer . \n La
tentative de Dragon Cheer du Roaring Moon de Smoukingrad rate. \n Calyrex de Smoukingrad utilise Trick Room . \n Pendant
5 tours, l'ordre d'attaque des pokemons est inversé. \n Amoonguss de NacDuBourgPalette est soigné jusqu'a 100/100 point
de vie grâce à item: Leftovers. \n Tour 12 :\n Amoonguss de NacDuBourgPalette utilise Rage Powder . \n Grimmsnarl de
NacDuBourgPalette utilise Reflect, ce qui réduit de moitié les dégats phyique reçu par son équipe pour les tours à
venir. \n Calyrex de Smoukingrad utilise Encore sur Amoonguss de NacDuBourgPalette . \n Roaring Moon de Smoukingrad
utilise Body Slam sur Amoonguss de NacDuBourgPalette il lui laisse 81/100 de point de vie . \n Roaring Moon de
Smoukingrad est maintenant endormi. \n Amoonguss de NacDuBourgPalette est soigné jusqu'a 87/100 point de vie grâce à
item: Leftovers. \n Tour 13 :\n NacDuBourgPalette a abandonné. \n Le gagnant est Smoukingrad.`.replace(/\s+/g, ' ');
        
        expect(actual).toBe(expected);
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
