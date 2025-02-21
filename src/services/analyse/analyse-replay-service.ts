import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Observable, from, map, mergeMap, catchError, forkJoin } from 'rxjs';
import { ReplayData, Player, Pokemon, Turn, Action } from '../../types/game.types';
import { ParseLogsService } from '../parse-logs/parse-logs.service';
import { WriteTextForIAService } from '../write-txt-for-ia/write-text-for-IA.service';
import { SachaService } from './sacha-service';

@Injectable()
export class AnalyseReplayService {
  constructor(
    private httpService: HttpService,
    private parseLogsService: ParseLogsService,
    private writeTextForIAService: WriteTextForIAService,
    private sachaService: SachaService
  ) {}

  analyseReplay(data: string): Observable<{tour: number, action: string; analyse: string}[]> {
    return this.getTxtMatch(data).pipe(
      mergeMap(text => this.sachaService.analyseReplay(text))
    );
  }

  getTxtMatch(data: string): Observable<string> {
    return this.httpService.get(data).pipe(
      map(response => response.data),
      map(text => this.parseLogsService.parseGameJson(text)),
      map(text => this.writeTextForIAService.translateGameInFr(text as ReplayData))
    );
  }
}
