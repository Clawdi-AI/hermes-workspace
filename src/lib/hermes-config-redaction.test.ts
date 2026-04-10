import { describe, expect, it } from 'vitest'
import { redactHermesConfigForClient } from './hermes-config-redaction'

describe('redactHermesConfigForClient', () => {
  it('redacts secrets from nested Hermes config before sending it to the browser', () => {
    const config = {
      model: {
        provider: 'openai-codex',
        default: 'gpt-5.4',
        base_url: 'https://proxy.example/v1',
        auth_mode: 'api_key',
        api_key: 'sk-test-secret',
        headers: {
          'x-api-key': 'sk-proxy-secret',
          Authorization: 'Bearer oauth-secret',
          'User-Agent': 'pi (linux 6.9.0-dstack; x64)',
        },
      },
      auth_token: 'oauth-token',
      refreshToken: 'refresh-token',
      ui: {
        theme: 'dark',
      },
    }

    expect(redactHermesConfigForClient(config)).toEqual({
      model: {
        provider: 'openai-codex',
        default: 'gpt-5.4',
        base_url: 'https://proxy.example/v1',
        auth_mode: 'api_key',
        api_key: '***',
        headers: {
          'x-api-key': '***',
          Authorization: '***',
          'User-Agent': 'pi (linux 6.9.0-dstack; x64)',
        },
      },
      auth_token: '***',
      refreshToken: '***',
      ui: {
        theme: 'dark',
      },
    })
  })
})
