import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

export type LLMProvider = 'anthropic' | 'openai';

export interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
  model?: string;
  baseURL?: string;
}

export async function createLLMMessage(
  config: LLMConfig,
  params: {
    systemPrompt: string;
    userMessage: string;
    maxTokens?: number;
  }
): Promise<string> {
  const { systemPrompt, userMessage, maxTokens = 4096 } = params;

  if (config.provider === 'anthropic') {
    const anthropic = new Anthropic({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
    });
    const response = await anthropic.messages.create({
      model: config.model ?? 'claude-3-5-sonnet-20241022',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });
    return response.content[0].type === 'text' ? response.content[0].text : '';
  }

  if (config.provider === 'openai') {
    const openai = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
    });
    const response = await openai.chat.completions.create({
      model: config.model ?? 'gpt-4o',
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    });
    return response.choices[0]?.message?.content ?? '';
  }

  throw new Error(`Unknown LLM provider: ${config.provider}`);
}
