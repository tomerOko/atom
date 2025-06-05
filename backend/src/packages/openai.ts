import { File } from 'buffer';
import OpenAI from 'openai';
import { ChatCompletionCreateParamsNonStreaming } from 'openai/resources/chat/completions';
import { TranscriptionSegment } from 'openai/src/resources/audio';
import { ZodSchema } from 'zod';

export class OpenAi {
  private static openai: OpenAI;

  public static initialize(apiKey: string) {
    this.openai = new OpenAI({
      apiKey,
    });
  }

  public static async send<T>(
    body: ChatCompletionCreateParamsNonStreaming,
    schema?: ZodSchema<T>
  ): Promise<T | null> {
    try {
      if (!this.openai) throw new Error('OpenAI not initialized');

      console.time('openai call');
      const response = await this.openai.chat.completions.create(body);
      console.timeEnd('openai call');
      const message = response.choices[0]?.message?.content;
      if (!message) throw new Error('OpenAI response is empty');

      if (schema) {
        const parsedResponse = JSON.parse(message);
        const validatedResponse = schema.parse(parsedResponse);
        return validatedResponse;
      }
      return message as T;
    } catch (error) {
      return null;
    }
  }

  public static async transcribe(audioBuffer: Buffer): Promise<TranscriptionSegment[]> {
    if (!this.openai) {
      throw new Error('OpenAI not initialized');
    }
    const audioFile = new File([audioBuffer], 'audio.wav', { type: 'audio/wav' });

    const transcription = await this.openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['segment'],
    });

    const result = transcription.segments || [];
    return result;
  }
}
