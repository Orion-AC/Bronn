import { CreateTrialLicenseKeyRequestBody } from '@activepieces/shared';

import { api } from './api';

export const requestTrialApi = {
  createKey(params: CreateTrialLicenseKeyRequestBody): Promise<void> {
    return api.post<void>(`/v1/license-keys`, params);
  },
  // Bronn white-label: External contact forms disabled
  async contactSales(_params: ContactSalesRequest): Promise<void> {
    console.warn('Contact sales is disabled in Bronn white-label deployment');
    throw new Error('Contact sales is not available');
  },
};

type ContactSalesRequest = {
  fullName: string;
  email: string;
  companyName: string;
  goal: string;
  numberOfEmployees: string;
};

