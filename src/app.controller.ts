import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AppService } from './app.service';
import { Observable } from 'rxjs';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('format-replay')
  @HttpCode(200)
  formatReplay(@Body() data): Observable<string> {
    return this.appService.formatReplay(data);
  }
}
