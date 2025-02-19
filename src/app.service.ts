import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Observable, from, map, mergeMap, catchError, forkJoin, of } from 'rxjs';
import { ReplayData, Player, Pokemon, Turn, Action } from './types/game.types';
import { ParseLogsService } from './parseLogs.service';
import { WriteTextForIAService } from './writeTextForIA.service';
import { AnalyseReplayService } from './services/analyse-replay-service';

@Injectable()
export class AppService {
  constructor(
    private httpService: HttpService,
    private parseLogsService: ParseLogsService,
    private writeTextForIAService: WriteTextForIAService,
    private analyseReplayService: AnalyseReplayService
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
}