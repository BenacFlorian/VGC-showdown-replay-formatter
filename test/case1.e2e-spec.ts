import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { of } from 'rxjs';
import { HttpService } from '@nestjs/axios';

describe('Case 1', () => {
  let app: INestApplication;
  let httpService: HttpService;

  const mockReplayData = `|j|☆Boscolachupagratis
|j|☆NacDuBourgPalette
|html|<table width="100%"><tr><td align="left">Boscolachupagratis</td><td align="right">NacDuBourgPalette</tr><tr><td align="left"><i class="fa fa-circle-o"></i> <i class="fa fa-circle-o"></i> </td><td align="right"><i class="fa fa-circle-o"></i> <i class="fa fa-circle-o"></i> </tr></table>
|uhtml|bestof|<h2><strong>Game 1</strong> of <a href="/game-bestof3-gen9vgc2024reghbo3-2215811427-om5jzpy36a2ejbrbgt6gbw25cn3ik2ipw">a best-of-3</a></h2>
|t:|1728052721
|gametype|doubles
|player|p1|Boscolachupagratis|265|1105
|player|p2|NacDuBourgPalette|170|1208
|teamsize|p1|6
|teamsize|p2|6
|gen|9
|tier|[Gen 9] VGC 2024 Reg H (Bo3)
|rated|
|rule|Species Clause: Limit one of each Pokémon
|rule|Item Clause: Limit 1 of each item
|clearpoke
|poke|p1|Magmar, L50, F|
|poke|p1|Dragapult, L50, M|
|poke|p1|Sneasler, L50, M|
|poke|p1|Rillaboom, L50, M|
|poke|p1|Kingambit, L50, F|
|poke|p1|Primarina, L50, F|
|poke|p2|Gholdengo, L50|
|poke|p2|Dragapult, L50, F|
|poke|p2|Rillaboom, L50, M|
|poke|p2|Clefable, L50, M|
|poke|p2|Incineroar, L50, M|
|poke|p2|Sneasler, L50, F|
|teampreview|4
|inactive|Battle timer is ON: inactive players will automatically lose when time's up. (requested by NacDuBourgPalette)
|inactive|Boscolachupagratis has 60 seconds left.
|inactive|NacDuBourgPalette has 60 seconds left.
|inactive|Boscolachupagratis has 30 seconds left.
|inactive|NacDuBourgPalette has 30 seconds left.
|inactive|NacDuBourgPalette has 20 seconds left.
|inactive|NacDuBourgPalette has 15 seconds left.
|inactive|NacDuBourgPalette has 10 seconds left.
|
|t:|1728052802
|start
|switch|p1a: Magmar|Magmar, L50, F|100/100
|switch|p1b: Dragapult|Dragapult, L50, M, shiny|100/100
|switch|p2a: Gholdengo|Gholdengo, L50|100/100
|switch|p2b: Clefable|Clefable, L50, M|100/100
|turn|1
|inactive|Boscolachupagratis has 30 seconds left.
|
|t:|1728052836
|move|p2b: Clefable|Follow Me|p2b: Clefable
|-singleturn|p2b: Clefable|move: Follow Me
|move|p1b: Dragapult|U-turn|p2b: Clefable
|-resisted|p2b: Clefable
|-damage|p2b: Clefable|86/100
|
|t:|1728052844
|switch|p1b: Kingambit|Kingambit, L50, F|100/100|[from] U-turn
|move|p2a: Gholdengo|Nasty Plot|p2a: Gholdengo
|-boost|p2a: Gholdengo|spa|2
|move|p1a: Magmar|Overheat|p2b: Clefable|[miss]
|-miss|p1a: Magmar|p2b: Clefable
|
|upkeep
|turn|2
|inactive|NacDuBourgPalette has 30 seconds left.
|
|t:|1728052873
|move|p1a: Magmar|Follow Me|p1a: Magmar
|-singleturn|p1a: Magmar|move: Follow Me
|move|p2b: Clefable|Follow Me|p2b: Clefable
|-singleturn|p2b: Clefable|move: Follow Me
|move|p2a: Gholdengo|Nasty Plot|p2a: Gholdengo
|-boost|p2a: Gholdengo|spa|2
|move|p1b: Kingambit|Swords Dance|p1b: Kingambit
|-boost|p1b: Kingambit|atk|2
|
|upkeep
|turn|3
|
|t:|1728052889
|-terastallize|p2a: Gholdengo|Steel
|move|p1a: Magmar|Follow Me|p1a: Magmar
|-singleturn|p1a: Magmar|move: Follow Me
|move|p2b: Clefable|Follow Me|p2b: Clefable
|-singleturn|p2b: Clefable|move: Follow Me
|move|p2a: Gholdengo|Make It Rain|p1a: Magmar|[spread] p1a,p1b
|-resisted|p1a: Magmar
|-resisted|p1b: Kingambit
|-damage|p1a: Magmar|16/100
|-damage|p1b: Kingambit|0 fnt
|-unboost|p2a: Gholdengo|spa|1
|faint|p1b: Kingambit
|
|upkeep
|
|t:|1728052908
|switch|p1b: Primarina|Primarina, L50, F, shiny|100/100
|turn|4
|inactive|NacDuBourgPalette has 30 seconds left.
|
|t:|1728052936
|move|p2b: Clefable|Protect|p2b: Clefable
|-singleturn|p2b: Clefable|Protect
|move|p1a: Magmar|Follow Me|p1a: Magmar
|-singleturn|p1a: Magmar|move: Follow Me
|move|p2a: Gholdengo|Make It Rain|p1b: Primarina|[spread] p1a,p1b
|-resisted|p1a: Magmar
|-damage|p1a: Magmar|0 fnt
|-damage|p1b: Primarina|0 fnt
|-unboost|p2a: Gholdengo|spa|1
|faint|p1a: Magmar
|faint|p1b: Primarina
|
|upkeep
|
|t:|1728052951
|switch|p1b: Dragapult|Dragapult, L50, M, shiny|100/100
|turn|5
|
|t:|1728052963
|-terastallize|p1b: Dragapult|Dragon
|move|p2b: Clefable|Follow Me|p2b: Clefable
|-singleturn|p2b: Clefable|move: Follow Me
|move|p1b: Dragapult|Phantom Force||[still]
|-prepare|p1b: Dragapult|Phantom Force
|move|p2a: Gholdengo|Make It Rain|p1b: Dragapult|[miss]
|-miss|p2a: Gholdengo|p1b: Dragapult
|
|upkeep
|turn|6
|
|t:|1728052974
|move|p2b: Clefable|Follow Me|p2b: Clefable
|-singleturn|p2b: Clefable|move: Follow Me
|move|p1b: Dragapult|Phantom Force|p2b: Clefable|[from]lockedmove
|-damage|p2b: Clefable|26/100
|-enditem|p2b: Clefable|Sitrus Berry|[eat]
|-heal|p2b: Clefable|51/100|[from] item: Sitrus Berry
|move|p2a: Gholdengo|Make It Rain|p1b: Dragapult
|-damage|p1b: Dragapult|0 fnt
|-unboost|p2a: Gholdengo|spa|1
|faint|p1b: Dragapult
|
|win|NacDuBourgPalette
||NacDuBourgPalette is ready for game 2.
|inactive|Boscolachupagratis has 30 seconds to confirm battle start!
||Boscolachupagratis is ready for game 2.
|uhtml|next|Next: <a href="/battle-gen9vgc2024reghbo3-2215814435-e2mtr24dvt7gpfj21qmmzaz0c1ad7acpw"><strong>Game 2 of 3</strong></a>
|l|☆Boscolachupagratis
|player|p1|`;

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

  it('/format-replay (POST) should format replay correctly / Case 1', () => {
    return request(app.getHttpServer())
      .post('/format-replays')
      .send(["https://replay.pokemonshowdown.com/gen9vgc2024reghbo3-2215811428-l9imjq5vo28buk78fuiprybu891ikn0pw.log"])
      .expect(200)
      .then(response => {
        expect(response.text).toBeDefined();
        
        const actual = JSON.parse(response.text)[0].replace(/\s+/g, ' ');
        const expected = "Le match oppose Boscolachupagratis et NacDuBourgPalette. Le joueur Boscolachupagratis a les Pokémons suivants : Magmar ( Niveau: 50, Item : , Ability : , Moves: ), Dragapult ( Niveau: 50, Item : , Ability : , Moves: ), Sneasler ( Niveau: 50, Item : , Ability : , Moves: ), Rillaboom ( Niveau: 50, Item : , Ability : , Moves: ), Kingambit ( Niveau: 50, Item : , Ability : , Moves: ), Primarina ( Niveau: 50, Item : , Ability : , Moves: ). Le joueur NacDuBourgPalette a les Pokémons suivants : Gholdengo ( Niveau: 50, Item : , Ability : , Moves: ), Dragapult ( Niveau: 50, Item : , Ability : , Moves: ), Rillaboom ( Niveau: 50, Item : , Ability : , Moves: ), Clefable ( Niveau: 50, Item : , Ability : , Moves: ), Incineroar ( Niveau: 50, Item : , Ability : , Moves: ), Sneasler ( Niveau: 50, Item : , Ability : , Moves: ). Le match commence ! Le joueur Boscolachupagratis envoie Magmar. Le joueur Boscolachupagratis envoie Dragapult. Le joueur NacDuBourgPalette envoie Gholdengo. Le joueur NacDuBourgPalette envoie Clefable. Tour 1 : Clefable de NacDuBourgPalette utilise Follow Me . Dragapult de Boscolachupagratis utilise U-turn sur Clefable de NacDuBourgPalette il lui laisse 86/100 de point de vie , ça a été résisté par Clefable. Kingambit est envoyé au combat. Gholdengo de NacDuBourgPalette utilise Nasty Plot , et gagne un boost de statistique : spa 2. Magmar de Boscolachupagratis utilise Overheat sur Clefable de NacDuBourgPalette mais ça rate. Tour 2 : Magmar de Boscolachupagratis utilise Follow Me . Clefable de NacDuBourgPalette utilise Follow Me . Gholdengo de NacDuBourgPalette utilise Nasty Plot , et gagne un boost de statistique : spa 2. Kingambit de Boscolachupagratis utilise Swords Dance , et gagne un boost de statistique : atk 2. Tour 3 : Magmar de Boscolachupagratis utilise Follow Me . Clefable de NacDuBourgPalette utilise Follow Me . Gholdengo de NacDuBourgPalette utilise Make It Rain (move de zone) sur Magmar de Boscolachupagratis et Kingambit de Boscolachupagratis , et perd un boost de statistique : spa 1, ça met Kingambit KO et laisse 16/100 de point de vie à Magmar , ça a été résisté par Magmar et Kingambit. Kingambit est KO! Primarina est envoyé au combat. Tour 4 : Clefable de NacDuBourgPalette utilise Protect . Magmar de Boscolachupagratis utilise Follow Me . Gholdengo de NacDuBourgPalette utilise Make It Rain (move de zone) sur Magmar de Boscolachupagratis et Primarina de Boscolachupagratis , et perd un boost de statistique : spa 1, ça met Magmar et Primarina KO , ça a été résisté par Magmar. Magmar est KO! Primarina est KO! Dragapult est envoyé au combat. Tour 5 : Clefable de NacDuBourgPalette utilise Follow Me . Dragapult de Boscolachupagratis utilise Phantom Force et disparait . Gholdengo de NacDuBourgPalette utilise Make It Rain sur Dragapult de Boscolachupagratis mais ça rate. Tour 6 : Clefable de NacDuBourgPalette utilise Follow Me . Dragapult de Boscolachupagratis est redirigé vers Clefable et utilise Phantom Force sur Clefable de NacDuBourgPalette il lui laisse 26/100 de point de vie . Clefable de NacDuBourgPalette utilise son item Sitrus Berry . Gholdengo de NacDuBourgPalette utilise Make It Rain sur Dragapult de Boscolachupagratis , et perd un boost de statistique : spa 1, ça met Dragapult KO . Dragapult est KO! Le gagnant est NacDuBourgPalette.".replace(/\s+/g, ' ');
        
        expect(actual).toBe(expected);
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
