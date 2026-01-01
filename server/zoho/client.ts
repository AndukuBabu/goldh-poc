import axios from 'axios';
import { integrationConfig } from '../config';

interface ZohoTokenResponse {
  access_token: string;
  expires_in: number;
  api_domain: string;
  token_type: string;
}

let cachedAccessToken: string | null = null;
let tokenExpiresAt: number = 0;

export class ZohoClient {
  private clientId: string;
  private clientSecret: string;
  private refreshToken: string;
  private apiDomain: string;

  constructor() {
    this.clientId = integrationConfig.zoho.clientId || '';
    this.clientSecret = integrationConfig.zoho.clientSecret || '';
    this.refreshToken = integrationConfig.zoho.refreshToken || '';
    this.apiDomain = integrationConfig.zoho.apiDomain;

    if (!this.clientId || !this.clientSecret || !this.refreshToken) {
      console.warn('[Zoho] Missing credentials - CRM integration disabled');
    }
  }

  isConfigured(): boolean {
    return !!(this.clientId && this.clientSecret && this.refreshToken);
  }

  async getAccessToken(): Promise<string> {
    const now = Date.now();

    if (cachedAccessToken && tokenExpiresAt > now) {
      return cachedAccessToken;
    }

    try {
      const response = await axios.post<ZohoTokenResponse>(
        'https://accounts.zoho.com/oauth/v2/token',
        null,
        {
          params: {
            refresh_token: this.refreshToken,
            client_id: this.clientId,
            client_secret: this.clientSecret,
            grant_type: 'refresh_token',
          },
        }
      );

      cachedAccessToken = response.data.access_token;
      tokenExpiresAt = now + (response.data.expires_in * 1000) - 60000;

      console.log('[Zoho] Access token refreshed successfully');
      return cachedAccessToken;
    } catch (error: any) {
      const statusCode = error.response?.status || 'unknown';
      const errorMessage = error.response?.data?.error || 'Unknown error';
      console.error(`[Zoho] Failed to refresh access token - Status: ${statusCode}, Error: ${errorMessage}`);
      throw new Error('Failed to authenticate with Zoho CRM');
    }
  }

  async makeRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any
  ): Promise<T> {
    const accessToken = await this.getAccessToken();

    try {
      const response = await axios({
        method,
        url: `${this.apiDomain}${endpoint}`,
        data,
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error: any) {
      if (error.response) {
        const statusCode = error.response.status;
        const errorData = error.response.data;
        console.error(`[Zoho] API error - Status: ${statusCode}, Data: ${JSON.stringify(errorData)}`);
        throw new Error(`Zoho API error: ${statusCode}`);
      }
      console.error('[Zoho] Network or unexpected error during API request');
      throw new Error('Zoho API request failed');
    }
  }
}

export const zohoClient = new ZohoClient();
