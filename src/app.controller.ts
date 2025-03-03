import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AppService } from './app.service';
import { map, Observable, of } from 'rxjs';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('format-replays')
  @HttpCode(200)
  formatReplay(@Body() data): Observable<string> {
    return this.appService.formatReplay(data);
  }

  @Post('create-replays-for-finetuning')
  @HttpCode(200)
  createReplaysForFinetuning(): Observable<string> {
    return this.appService.createReplaysForFinetuning().pipe(
      map(results => { 
        // console.log(results[0]); 
        
        return `Traitement terminé: ${results.length} fichiers traités`
      })
    );
  }

  @Post('analyse-replays')
  @HttpCode(200)
  analyseReplay(@Body() data): Observable<{ tour: number; action: string; analyse: string }[]> {
    return this.appService.analyseReplay(data);
  }
}
