export type AiProviderId = "google";

export type AiUsage = {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
};

export type AiGenerationMeta = {
  provider: AiProviderId;
  model: string;
  usage?: AiUsage;
};

export type AiStructuredResult<T> = {
  parsed: T;
  rawText: string;
  meta: AiGenerationMeta;
};

export type AiGenerateStructuredParams<T> = {
  model: string;
  temperature: number;
  maxOutputTokens: number;
  schemaName: string;
  jsonSchema: Record<string, any>;
  prompt: string;
  parse: (json: unknown) => T;
};

export interface AiProvider {
  id: AiProviderId;
  generateStructured<T>(params: AiGenerateStructuredParams<T>): Promise<AiStructuredResult<T>>;
}

