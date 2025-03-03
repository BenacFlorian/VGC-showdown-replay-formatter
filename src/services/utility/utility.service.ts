import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Observable, from, map, mergeMap, catchError, forkJoin } from 'rxjs';
import { ReplayData, Player, Pokemon, Turn, Action } from '../../types/game.types';
import { resourceUsage } from 'process';

@Injectable()
export class UtilityService {
  
    formatList(items: string[]): string {
        if (!items || items.length === 0) return '';
        
        if (items.length === 1) {
            return items[0];
        }
        
        if (items.length === 2) {
            return `${items[0]} and ${items[1]}`;
        }
        
        return items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1];
    }
}
