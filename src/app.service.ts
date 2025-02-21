import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Observable, from, map, mergeMap, catchError, forkJoin, of, tap, toArray } from 'rxjs';
import { ReplayData, Player, Pokemon, Turn, Action } from './types/game.types';
import { ParseLogsService } from './services/parse-logs/parse-logs.service';
import { WriteTextForIAService } from './services/write-txt-for-ia/write-text-for-IA.service';
import { AnalyseReplayService } from './services/analyse/analyse-replay-service';
import { CreateReplaysForFinetuningService } from './services/create-replay-for-fine-tuning/create-replay-for-fine-tuning.service';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class AppService {
  constructor(
    private httpService: HttpService,
    private parseLogsService: ParseLogsService,
    private writeTextForIAService: WriteTextForIAService,
    private analyseReplayService: AnalyseReplayService,
    private createReplaysForFinetuningService: CreateReplaysForFinetuningService
  ) {}


  formatReplay(data: string[]): Observable<string> {
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

  analyseReplay(data: string): Observable<{ tour: number; action: string; analyse: string }[]> {
    return this.analyseReplayService.analyseReplay(data).pipe(
      map(result => {
        return result;
      })
    );
  }

  createReplaysForFinetuning(): Observable<string[]> {
    const directoryPath = path.join(process.cwd(), 'replays');

    return from(fs.readdir(directoryPath)).pipe(
      tap(files => console.log('Fichiers trouvés:', files)),
      mergeMap(files => from(files.filter(file => file.endsWith('.txt')))),
      mergeMap(file => {
        const filePath = path.join(directoryPath, file);
        return from(fs.readFile(filePath, 'utf-8')).pipe(
          map(content => ({ file, content }))
        );
      }),
      tap(({ file, content }) => {
        console.log('\n--- Fichier:', file, '---');
        console.log('Contenu:', content.substring(0, 200) + '...');
      }),
      map(({ file, content }) => content),
      // Collecte tous les contenus dans un tableau
      toArray(),
      // Ici vous pouvez ajouter votre logique de traitement supplémentaire
      tap(contents => {
        console.log(`Nombre total de fichiers traités: ${contents.length}`);
      })
    );
  }
}