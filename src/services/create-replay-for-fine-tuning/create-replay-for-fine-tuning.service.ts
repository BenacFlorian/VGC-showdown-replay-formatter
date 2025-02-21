import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Observable, from, map, mergeMap, catchError, forkJoin, of } from 'rxjs';

@Injectable()
export class CreateReplaysForFinetuningService {
    constructor(private httpService: HttpService) {}

    createReplaysForFinetuning(data: string): Observable<string> {
        return of("");
    }
}
