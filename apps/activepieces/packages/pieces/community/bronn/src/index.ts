import { createPiece } from '@activepieces/pieces-framework';
import { bronnAuth } from './lib/common';
import { invokeAgentAction } from './lib/actions/invoke-agent';

export const bronn = createPiece({
    displayName: 'Bronn',
    description: 'AI Agents and Workflow Synergy',
    auth: bronnAuth,
    minimumSupportedRelease: '0.30.0',
    logoUrl: 'https://cdn.activepieces.com/pieces/bronn.png', // Placeholder
    authors: ['Arsalan'],
    actions: [
        invokeAgentAction,
    ],
    triggers: [],
});
