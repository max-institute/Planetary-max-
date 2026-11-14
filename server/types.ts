export interface WorkersAI {
  run(
    model: string,
    input: {
      messages: Array<{ role: 'system' | 'user'; content: string }>;
    }
  ): Promise<{ response?: string }>;
}

export interface Bindings {
  DB: D1Database;
  ASSETS: Fetcher;
  AI?: WorkersAI;
}
