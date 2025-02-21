import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UtilityService } from './services/utility/utility.service';
import { ParseLogsService } from './services/parse-logs/parse-logs.service';
import { WriteTextForIAService } from './services/write-txt-for-ia/write-text-for-IA.service';
import { PokemonTxtForIAService } from './services/write-txt-for-ia/pokemon-txt-for-IA.service';
import { DamageTxtForIAService } from './services/write-txt-for-ia/damage-txt-for-IA.service';
import { ActionTxtForIAService } from './services/write-txt-for-ia/action-txt-for-IA.service';
import { AnalyseReplayService } from './services/analyse/analyse-replay-service';
import { SachaService } from './services/analyse/sacha-service';
import { CreateReplaysForFinetuningService } from './services/create-replay-for-fine-tuning/create-replay-for-fine-tuning.service';
@Module({
  imports: [HttpModule],
  controllers: [AppController],
  providers: [
    AppService, 
    UtilityService, 
    ParseLogsService, 
    WriteTextForIAService, 
    PokemonTxtForIAService, 
    DamageTxtForIAService, 
    ActionTxtForIAService,
    AnalyseReplayService,
    SachaService,
    CreateReplaysForFinetuningService
  ],
})
export class AppModule {}
