import { Injectable } from '@nestjs/common';
import { Observable, from, map, mergeMap, catchError, throwError, defer } from 'rxjs';

type GradioClient = {
  predict: (endpoint: string, payload: any) => Promise<any>;
};

@Injectable()
export class SachaService {
  constructor() {}

  private readonly apiUrl = "https://nc31o1qgtz802592.eu-west-1.aws.endpoints.huggingface.cloud"; // Sacha
  // private readonly apiUrl = "https://u9wlejzmy0a7zu3h.eu-west-1.aws.endpoints.huggingface.cloud"; // Mistral de base
  private readonly apiToken = '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';
  
  prompt = `- We are analyzing a Pokémon battle. Each turn involves multiple actions by different Pokémon.
    - Analyze every action in each turn of the following game description. Provide only the analysis in JSON format. Do not repeat the question or include any other information.
    - Format the response as follows:
    [
        {
            "turn": 1,
            "action": "Action from description",
            "analysis": "Analysis of the action and the reason behind the action"
        },
        {
            "turn": 1,
            "action": "Action 2 from description",
            "analysis": "Analysis of the action, the reason behind the action and the strategy used by the player"
        },
        ...
    ]
    - Ensure each action is analyzed individually.
    - Each turn will be represented by a list of actions in the game description, with this format : 
    "
    Turn 1 :
    - Action 1 of the turn pokemon 1
    - Action 2 of the turn pokemon 2
    - Action 3 of the turn pokemon 3
    - Action 4 of the turn pokemon 4
    "
    

    Game description to analyze:
  `;

  private modelId = 'Nac31/Sacha-0';

  queryModel(prompt: string, nbTurn: number): Observable<any> {
    return defer(() => from(import('@gradio/client'))).pipe(
      mergeMap(({ Client }) => Client.connect(this.modelId)),
      mergeMap((client: GradioClient) => {
        return from(client.predict("/predict", {
          message: prompt,
          temperature: 0.1,
          max_new_tokens: 400 * nbTurn,
        }));
      }),
      map(response => {
        console.log('Réponse du modèle:', response);
        return response;
      }),
      catchError(error => {
        console.error('Erreur lors de la requête au modèle:', error);
        return throwError(() => new Error('Erreur lors de la requête au modèle'));
      })
    );
  }

  queryModelViaInferenceAPI(prompt: string, nbTurn: number): Observable<any> {
    return from(fetch(
      this.apiUrl,
      {
        headers: { 
          "Accept": "application/json",
          "Authorization": `Bearer ${this.apiToken}`,
          "Content-Type": "application/json" 
        },
        method: "POST",
        body: JSON.stringify({
          inputs: prompt, 
          parameters: {
            max_new_tokens: 400 * nbTurn,
            // num_return_sequences: 1,
            // eos_token_id: 50256,
            // do_sample: false,
            // temperature: 0.3,
            // top_k: 50,
            // top_p: 0.9,
            // repetition_penalty: 1.2,
            // no_repeat_ngram_size: 2,
            // early_stopping: true
          }
        }),
      }
    )).pipe(
      mergeMap(response => response.json()),
      map(result => {
        const response = this.buildResponse(result, prompt);
        // console.log('Réponse du modèle:', response);
        return response;
      }),
      catchError(error => {
        console.error('Erreur:', error);
        return throwError(() => new Error(`Erreur lors de la requête au modèle: ${error.message}`));
      })
    );
  }

  buildResponse(result: any, prompt: string){
    const response_without_prompt = result[0]?.generated_text?.replace(prompt, '');
    const response_without_prompt_split = response_without_prompt.split('User 0:');

    const response = response_without_prompt_split[1];
    try {
      const jsonResponse = JSON.parse(response);
      return jsonResponse;
    } catch (error) {
      console.error('Erreur:', error);
      return [];
    }
  }

  analyseReplay(data: string): Observable<{tour: number, action: string, analyse: string}[]> {
    const nbTurn = this.countTurn(data);
    return this.queryModel(this.prompt+data, nbTurn).pipe(
      map(response => {
        if (Array.isArray(response)) {
          return response;
        }
        throw new Error('Format de réponse invalide');
      })
    );
  }

  countTurn(data: string): number {
    let index = 1;
    let count = 0;
    while(data.includes(`Turn ${index}`)) {
      count++;
      index++;
    }
    return count;
  }
}
