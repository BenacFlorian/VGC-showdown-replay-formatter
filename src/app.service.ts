import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Observable, from, map, mergeMap, catchError, forkJoin, of, tap, toArray, filter } from 'rxjs';
import { ReplayData, Player, Pokemon, Turn, Action } from './types/game.types';
import { ParseLogsService } from './services/parse-logs/parse-logs.service';
import { WriteTextForIAService } from './services/write-txt-for-ia/write-text-for-IA.service';
import { AnalyseReplayService } from './services/analyse/analyse-replay-service';
import { CreateReplaysForFinetuningService } from './services/create-replay-for-fine-tuning/create-replay-for-fine-tuning.service';
import * as path from 'path';
import { SheetResult } from './types/game.types';

@Injectable()
export class AppService {
  constructor(
    private httpService: HttpService,
    private parseLogsService: ParseLogsService,
    private writeTextForIAService: WriteTextForIAService,
    private analyseReplayService: AnalyseReplayService,
    private createReplaysForFinetuningService: CreateReplaysForFinetuningService
  ) {}


  public formatReplay(data: string[]): Observable<string> {
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

  createReplaysForFinetuning(): Observable<SheetResult[]> {
    const directoryPath = "/home/nac/Documents/Projets/Replay-csv";
    return this.createReplaysForFinetuningService.readReplays(directoryPath).pipe(
      mergeMap(files => this.createReplaysForFinetuningService.processSheets(files))
    );
  }
}