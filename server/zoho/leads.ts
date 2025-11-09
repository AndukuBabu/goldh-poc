import { zohoClient } from './client';
import type { User } from '@shared/schema';

interface ZohoLeadData {
  Company?: string;
  Last_Name: string;
  First_Name?: string;
  Email?: string;
  Phone?: string;
  Lead_Source: string;
  Description?: string;
}

interface ZohoLeadResponse {
  data: Array<{
    code: string;
    details: {
      id: string;
      created_time?: string;
    };
    message: string;
    status: string;
  }>;
}

export async function createLeadFromUser(user: User): Promise<void> {
  if (!zohoClient.isConfigured()) {
    console.log('[Zoho] CRM not configured - skipping lead creation');
    return;
  }

  try {
    const leadData: ZohoLeadData = {
      Last_Name: user.name || user.email.split('@')[0],
      Email: user.email,
      Lead_Source: 'GOLDH Website Signup',
      Description: `New user signup from GOLDH platform. Experience Level: ${user.experienceLevel || 'Not specified'}`,
    };

    if (user.name && user.name.includes(' ')) {
      const nameParts = user.name.split(' ');
      leadData.First_Name = nameParts[0];
      leadData.Last_Name = nameParts.slice(1).join(' ');
    }

    if (user.phone) {
      leadData.Phone = user.phone;
    }

    const response = await zohoClient.makeRequest<ZohoLeadResponse>(
      'POST',
      '/crm/v2/Leads',
      {
        data: [leadData],
        trigger: ['workflow'],
      }
    );

    if (response.data && response.data[0]) {
      const result = response.data[0];
      if (result.code === 'SUCCESS') {
        console.log(`[Zoho] Lead created successfully - ID: ${result.details.id}`);
      } else {
        console.error(`[Zoho] Lead creation failed - ${result.code}: ${result.message}`);
      }
    }
  } catch (error) {
    console.error('[Zoho] Error creating lead:', error);
  }
}
