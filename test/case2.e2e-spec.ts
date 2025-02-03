import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { of } from 'rxjs';
import { HttpService } from '@nestjs/axios';

describe('Case 1', () => {
  let app: INestApplication;
  let httpService: HttpService;

  const mockReplayData = `|j|☆NacDuBourgPalette
|j|☆Smoukingrad
|html|<table width="100%"><tr><td align="left">NacDuBourgPalette</td><td align="right">Smoukingrad</tr><tr><td align="left"><i class="fa fa-circle-o"></i> <i class="fa fa-circle-o"></i> </td><td align="right"><i class="fa fa-circle-o"></i> <i class="fa fa-circle"></i> </tr></table>
|uhtml|bestof|<h2><strong>Game 2</strong> of <a href="/game-bestof3-gen9vgc2025reggbo3-2292039385">a best-of-3</a></h2>
|t:|1738357572
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
|
|t:|1738357598
|start
|switch|p1a: Torkoal|Torkoal, L50, F|100/100
|switch|p1b: Grimmsnarl|Grimmsnarl, L50, M|100/100
|switch|p2a: Garganacl|Garganacl, L50, M|100/100
|switch|p2b: Arcanine|Arcanine-Hisui, L50, F|100/100
|-ability|p2b: Arcanine|Intimidate|boost
|-fail|p1a: Torkoal|unboost|[from] ability: White Smoke|[of] p1a: Torkoal
|-unboost|p1b: Grimmsnarl|atk|1
|turn|1
|
|t:|1738357621
|move|p2a: Garganacl|Wide Guard|p2a: Garganacl
|-singleturn|p2a: Garganacl|Wide Guard
|move|p1b: Grimmsnarl|Reflect|p1b: Grimmsnarl
|-sidestart|p1: NacDuBourgPalette|Reflect
|move|p2b: Arcanine|Head Smash|p1b: Grimmsnarl
|-damage|p1b: Grimmsnarl|43/100
|-damage|p2b: Arcanine|66/100|[from] Recoil
|move|p1a: Torkoal|Lava Plume|p2b: Arcanine|[spread] p1b
|-activate|p2a: Garganacl|move: Wide Guard
|-activate|p2b: Arcanine|move: Wide Guard
|-damage|p1b: Grimmsnarl|20/100
|
|upkeep
|turn|2
|
|t:|1738357645
|move|p1b: Grimmsnarl|Light Screen|p1b: Grimmsnarl
|-sidestart|p1: NacDuBourgPalette|move: Light Screen
|move|p2b: Arcanine|Close Combat|p1b: Grimmsnarl
|-damage|p1b: Grimmsnarl|0 fnt
|-unboost|p2b: Arcanine|def|1
|-unboost|p2b: Arcanine|spd|1
|faint|p1b: Grimmsnarl
|move|p1a: Torkoal|Will-O-Wisp|p2a: Garganacl
|-immune|p2a: Garganacl|[from] ability: Purifying Salt
|move|p2a: Garganacl|Rest|p2a: Garganacl
|-fail|p2a: Garganacl|heal
|
|upkeep
|inactive|NacDuBourgPalette has 30 seconds left.
|
|t:|1738357675
|switch|p1b: Farigiraf|Farigiraf, L50, M|100/100
|turn|3
|
|t:|1738357686
|switch|p2a: Venusaur|Venusaur, L50, F|100/100
|move|p2b: Arcanine|Raging Fury|p1a: Torkoal
|-resisted|p1a: Torkoal
|-damage|p1a: Torkoal|82/100
|move|p1b: Farigiraf|Hyper Beam|p2a: Venusaur
|-damage|p2a: Venusaur|13/100
|-mustrecharge|p1b: Farigiraf
|move|p1a: Torkoal|Yawn|p2b: Arcanine
|-start|p2b: Arcanine|move: Yawn|[of] p1a: Torkoal
|
|upkeep
|turn|4
|
|t:|1738357701
|move|p2b: Arcanine|Raging Fury|p1b: Farigiraf|[from] lockedmove
|-damage|p1b: Farigiraf|62/100
|-start|p2b: Arcanine|confusion|[fatigue]
|move|p2a: Venusaur|Acid Spray|p1b: Farigiraf
|-damage|p1b: Farigiraf|47/100
|-unboost|p1b: Farigiraf|spd|2
|-damage|p2a: Venusaur|4/100|[from] item: Life Orb
|cant|p1b: Farigiraf|recharge
|move|p1a: Torkoal|Will-O-Wisp|p2a: Venusaur
|-status|p2a: Venusaur|brn
|
|-damage|p2a: Venusaur|0 fnt|[from] brn
|faint|p2a: Venusaur
|-end|p2b: Arcanine|move: Yawn|[silent]
|-status|p2b: Arcanine|slp
|upkeep
|
|t:|1738357715
|switch|p2a: Indeedee|Indeedee-F, L50, F|100/100
|-fieldstart|move: Psychic Terrain|[from] ability: Psychic Surge|[of] p2a: Indeedee
|turn|5
|
|t:|1738357725
|cant|p2b: Arcanine|slp
|move|p2a: Indeedee|Baton Pass|p2a: Indeedee
|
|t:|1738357727
|switch|p2a: Garganacl|Garganacl, L50, M|100/100|[from] Baton Pass
|move|p1b: Farigiraf|Imprison|p1b: Farigiraf
|-start|p1b: Farigiraf|move: Imprison
|move|p1a: Torkoal|Shell Smash|p1a: Torkoal
|-unboost|p1a: Torkoal|def|1
|-unboost|p1a: Torkoal|spd|1
|-boost|p1a: Torkoal|atk|2
|-boost|p1a: Torkoal|spa|2
|-boost|p1a: Torkoal|spe|2
|
|-sideend|p1: NacDuBourgPalette|Reflect
|upkeep
|turn|6
|inactive|NacDuBourgPalette has 30 seconds left.
|
|t:|1738357755
|switch|p1a: Amoonguss|Amoonguss, L50, F|100/100
|switch|p2a: Indeedee|Indeedee-F, L50, F|100/100
|-curestatus|p2b: Arcanine|slp|[msg]
|-activate|p2b: Arcanine|confusion
|move|p2b: Arcanine|Protect|p2b: Arcanine
|-singleturn|p2b: Arcanine|Protect
|move|p1b: Farigiraf|Hyper Voice|p2b: Arcanine|[spread] p2a
|-activate|p2b: Arcanine|move: Protect
|-damage|p2a: Indeedee|68/100
|-enditem|p1b: Farigiraf|Throat Spray
|-boost|p1b: Farigiraf|spa|1|[from] item: Throat Spray
|
|-sideend|p1: NacDuBourgPalette|move: Light Screen
|upkeep
|turn|7
|
|t:|1738357772
|-end|p2b: Arcanine|confusion
|move|p2b: Arcanine|Protect|p2b: Arcanine
|-singleturn|p2b: Arcanine|Protect
|move|p2a: Indeedee|Follow Me|p2a: Indeedee
|-singleturn|p2a: Indeedee|move: Follow Me
|move|p1b: Farigiraf|Imprison||[still]
|-fail|p1b: Farigiraf
|move|p1a: Amoonguss|Pollen Puff|p2a: Indeedee
|-supereffective|p2a: Indeedee
|-damage|p2a: Indeedee|16/100
|
|upkeep
|turn|8
|
|t:|1738357792
|switch|p2b: Garganacl|Garganacl, L50, M|100/100
|move|p2a: Indeedee|Healing Wish|p2a: Indeedee
|faint|p2a: Indeedee
|move|p1b: Farigiraf|Hyper Beam|p2b: Garganacl
|-resisted|p2b: Garganacl
|-damage|p2b: Garganacl|46/100
|-mustrecharge|p1b: Farigiraf
|move|p1a: Amoonguss|Clear Smog|p2b: Garganacl
|-resisted|p2b: Garganacl
|-damage|p2b: Garganacl|36/100
|-clearboost|p2b: Garganacl
|
|upkeep
|
|t:|1738357800
|switch|p2a: Arcanine|Arcanine-Hisui, L50, F|66/100
|-heal|p2a: Arcanine|100/100|[from] move: Healing Wish
|-ability|p2a: Arcanine|Intimidate|boost
|-unboost|p1a: Amoonguss|atk|1
|-unboost|p1b: Farigiraf|atk|1
|turn|9
|-message|Smoukingrad forfeited.
|
|win|NacDuBourgPalette
||Smoukingrad is ready for game 3.`;

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

  it('/format-replay (POST) should format replay correctly / Case 2', () => {
    return request(app.getHttpServer())
      .post('/format-replays')
      .send(["https://replay.pokemonshowdown.com/gen9vgc2025reggbo3-2292043749.log"])
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
DragonCheer, Protect, Tailwind, BodySlam ). \n Le match commence ! \n Le joueur NacDuBourgPalette envoie Torkoal. \n Le
joueur NacDuBourgPalette envoie Grimmsnarl. \n Le joueur Smoukingrad envoie Garganacl. \n Le joueur Smoukingrad envoie
Arcanine. \n Tour 0 :\n Arcanine utilise sont talent : Intimidate. \n La tentative de réduction de statistique sur le
Torkoal de NacDuBourgPalette rate à cause de son talent : White Smoke. \n Grimmsnarl perd un boost de statistique : atk
1. \n Tour 1 :\n Garganacl de Smoukingrad utilise Wide Guard, ce qui protège son équipe des attaques de zones pour ce
tour. \n Grimmsnarl de NacDuBourgPalette utilise Reflect, ce qui réduit de moitié les dégats phyique reçu par son équipe
pour les tours à venir. \n Arcanine de Smoukingrad utilise Head Smash sur Grimmsnarl de NacDuBourgPalette il lui laisse
43/100 de point de vie . \n Arcanine de Smoukingrad subit des dégats de recul, il lui reste 66/100 de point de vie . \n
Torkoal de NacDuBourgPalette utilise Lava Plume (move de zone) sur tous les pokemons du terrain, et inflige des dégats
sur Grimmsnarl de NacDuBourgPalette il lui laisse 20/100 de point de vie . \n Garganacl est protégé grâce à Wide Guard.
\n Arcanine est protégé grâce à Wide Guard. \n Tour 2 :\n Grimmsnarl de NacDuBourgPalette utilise Light Screen, ce qui
réduit de moitié les dégats spéciaux reçu par son équipe pour les tours à venir. \n Arcanine de Smoukingrad utilise
Close Combat sur Grimmsnarl de NacDuBourgPalette , et perd plusieurs boosts de statistique : def 1, spd 1, ça met
Grimmsnarl KO . \n Grimmsnarl est KO! \n Torkoal de NacDuBourgPalette utilise Will-O-Wisp sur Garganacl de Smoukingrad .
\n Garganacl est immunisé contre Will-O-Wisp à cause de son talent : Purifying Salt. \n Garganacl de Smoukingrad utilise
Rest . \n La tentative de soin du Garganacl de Smoukingrad rate. \n Farigiraf est envoyé au combat. \n Tour 3 :\n
Venusaur est envoyé au combat. \n Arcanine de Smoukingrad utilise Raging Fury sur Torkoal de NacDuBourgPalette il lui
laisse 82/100 de point de vie , ça a été résisté par Torkoal. \n Farigiraf de NacDuBourgPalette utilise Hyper Beam sur
Venusaur de Smoukingrad il lui laisse 13/100 de point de vie . \n Torkoal de NacDuBourgPalette utilise Yawn sur Arcanine
de Smoukingrad . \n Arcanine deviens somnolent à cause de Torkoal, il s'endormira s'il attaque une fois de plus. \n Tour
4 :\n Arcanine de Smoukingrad utilise Raging Fury sur Farigiraf de NacDuBourgPalette il lui laisse 62/100 de point de
vie . \n Arcanine deviens confus à cause de la fatigue (un effet de son attaque). \n Venusaur de Smoukingrad utilise
Acid Spray sur Farigiraf de NacDuBourgPalette il lui laisse 47/100 de point de vie . \n Farigiraf perd un boost de
statistique : spd 2. \n Venusaur de Smoukingrad subit des dégats de son item Life Orb, il lui reste 4/100 de point de
vie . \n Farigiraf de NacDuBourgPalette ne peut pas attaquer ce tour-ci car il est en train de se recharger. \n Torkoal
de NacDuBourgPalette utilise Will-O-Wisp sur Venusaur de Smoukingrad . \n Venusaur de Smoukingrad est maintenant brulé.
\n Venusaur de Smoukingrad subit des dégats de sa brûlure, ça met Venusaur KO . \n Venusaur est KO! \n Arcanine de
Smoukingrad est maintenant endormi. \n Indeedee-F est envoyé au combat. \n Tour 5 :\n Arcanine de Smoukingrad ne peut
pas attaquer ce tour-ci car il est endormi. \n Indeedee de Smoukingrad utilise Baton Pass . \n Garganacl est envoyé au
combat. \n Farigiraf de NacDuBourgPalette utilise Imprison, ce qui empêche l'équipe adverse d'utiliser les attaques
qu'il possède pour les tours a venir. \n Torkoal de NacDuBourgPalette utilise Shell Smash , et gagne plusieurs boost de
statistiques : atk 2, spa 2, spe 2, et perd plusieurs boosts de statistique : def 1, spd 1. \n Reflect de
NacDuBourgPalette n'a plus d'effet. \n Tour 6 :\n Amoonguss est envoyé au combat. \n Indeedee-F est envoyé au combat. \n
Arcanine de Smoukingrad est guéri de son statut : sommeil. \n Arcanine de Smoukingrad est confus. \n Arcanine de
Smoukingrad utilise Protect . \n Farigiraf de NacDuBourgPalette utilise Hyper Voice (move de zone) sur Indeedee de
Smoukingrad il lui laisse 68/100 de point de vie . \n Arcanine est protégé grâce à Protect. \n Farigiraf de
NacDuBourgPalette utilise son item Throat Spray , et gagne un boost de statistique : spa 1. \n Light Screen de
NacDuBourgPalette n'a plus d'effet. \n Tour 7 :\n Arcanine de Smoukingrad n'est plus : confus. \n Arcanine de
Smoukingrad utilise Protect . \n Indeedee de Smoukingrad utilise Follow Me . \n Farigiraf de NacDuBourgPalette utilise
Imprison, ce qui empêche l'équipe adverse d'utiliser les attaques qu'il possède pour les tours a venir. \n La tentative
de Imprison du Farigiraf de NacDuBourgPalette rate. \n Amoonguss de NacDuBourgPalette utilise Pollen Puff sur Indeedee
de Smoukingrad il lui laisse 16/100 de point de vie . \n Tour 8 :\n Garganacl est envoyé au combat. \n Indeedee de
Smoukingrad utilise Healing Wish . \n Indeedee est KO! \n Farigiraf de NacDuBourgPalette utilise Hyper Beam sur
Garganacl de Smoukingrad il lui laisse 46/100 de point de vie , ça a été résisté par Garganacl. \n Amoonguss de
NacDuBourgPalette utilise Clear Smog sur Garganacl de Smoukingrad il lui laisse 36/100 de point de vie , ça a été
résisté par Garganacl. \n Garganacl de Smoukingrad n'a plus de boost. \n Arcanine-Hisui est envoyé au combat. \n
Arcanine utilise sont talent : Intimidate. \n Amoonguss perd un boost de statistique : atk 1. \n Farigiraf perd un boost
de statistique : atk 1. \n Tour 9 :\n Smoukingrad a abandonné. \n Le gagnant est NacDuBourgPalette.`.replace(/\s+/g, ' ');
        
        expect(actual).toBe(expected);
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
