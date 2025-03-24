import { Injectable } from '@nestjs/common';
import { Observable, from, map, catchError, throwError, defer, mergeMap } from 'rxjs';

// Fonction pour contourner le problème d'import ESM
export const importDynamic = new Function('modulePath', 'return import(modulePath)');

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

  queryModel(prompt: string, nbTurn: number): Observable<string> {
    return from(this.queryModelStreaming(prompt, nbTurn)).pipe(
      catchError(error => {
        console.error('Erreur lors du streaming:', error);
        return throwError(() => new Error(`Erreur streaming : ${error.message}`));
      })
    ).pipe(
      map(response => {
        console.log("Response :", response);
        const json = this.buildResponse(response, prompt);
        return json;
      })
    );
  }
  async queryModelStreaming(prompt: string, nbTurn: number): Promise<string> {
    console.log("Sending streaming request to API...");
    
    const response = await fetch('https://s8w1nx32dxu2wu-5000.proxy.runpod.net/v1/chat/completions', {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }],
        mode: "instruct",
        max_tokens: 500 * nbTurn, // Ajuste selon tes besoins actuels
        temperature: 0.1,
        top_p: 0.9,
        stream: true // <-- Active le mode streaming ici
      })
    });
  
    if (!response.ok || !response.body) {
      throw new Error(`Erreur HTTP : ${response.status}`);
    }
  
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullResponse = "";
  
    console.log("----- Début de réponse en streaming -----");
  
    let partialChunk = "";
    let count = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      partialChunk += decoder.decode(value, { stream: true });

      const lines = partialChunk.split("\n");

      for (let i = 0; i < lines.length - 1; i++) {
        const line = lines[i].trim();

        if (line.startsWith("data:")) {
          const data = line.replace(/^data:\s*/, '').trim();
          
          if (data === "[DONE]") continue;

          try {
            const json = JSON.parse(data);
            const content = json.choices[0].delta.content;
            if (content) {
              fullResponse += content; // <-- stockage uniquement, aucun affichage
            }
          } catch (error) {
            console.error("Erreur parsing JSON:", error);
          }
        }
      }

      partialChunk = lines[lines.length - 1];
      count++;
      if(count % 500 === 0) {
        console.log("Still in progress, count = "+count+"...");
      }
    }
  
    console.log("\n----- Fin de réponse en streaming -----");
    
    return fullResponse;
  }

  queryModelViaSpace(prompt: string, nbTurn: number): Observable<any> {
    return defer(async () => {
      try {
        // Utilisation de l'import dynamique
        const { Client } = await importDynamic('@gradio/client');
        const promptFormated = prompt.replace(/\n/g, '');
        console.log(promptFormated);
        
        const app = await Client.connect("https://nac31-sacha-0.hf.space/", {
          hf_token: this.apiToken,
          status_callback: (status) => {
            console.log('Space status:', status);
          },
          events: ["data", "status"]
        });
        const submission = app.submit("/predict", [
          promptFormated,
          1,
          400 * nbTurn,
        ]);

        for await (const msg of submission) {
          if (msg.type === "data") {
            return msg.data;
          }
          if (msg.type === "status") {
            console.log('Status update:', msg);
            if (msg.stage === "error") {
              throw new Error(`API error: ${msg.message || 'Unknown error'}`);
            }
          }
        }

        throw new Error('No data received from the model');
      } catch (error) {
        console.error('Erreur Gradio:', error);
        throw new Error(`Erreur lors de la requête au modèle: ${error.message}`);
      }
    }).pipe(
      map(response => {
        console.log('Réponse du modèle:', response);
        console.log('Réponse du modèle:', response[0]);
        // console.log('Réponse du modèle:', response.replace(prompt, ''));
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
    const response_without_prompt = result.replace(prompt, '');
    console.log("=============================================");
    console.log(response_without_prompt);
    console.log("=============================================");
    try {
      const jsonResponse = JSON.parse(response_without_prompt.trim());
      return jsonResponse;
    } catch (error) {
      console.error('Erreur:', error);
      return [];
    }
  }

  analyseReplay(data: string): Observable<{tour: number, action: string, analyse: string}[]> {
    console.log("----- Logs generated -----")
    const nbTurn = this.countTurn(data);
    return this.queryModel(this.prompt+data, nbTurn).pipe(
      map(response => {
        console.log("=============================================");
        console.log("----------- Responses returned --------------");
        console.log("=============================================");
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
