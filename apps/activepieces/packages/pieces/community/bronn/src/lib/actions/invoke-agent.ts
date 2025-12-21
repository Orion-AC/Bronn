import { createAction, Property } from '@activepieces/pieces-framework';
import { bronnAuth, makeBronnRequest } from '../common';

export const invokeAgentAction = createAction({
    auth: bronnAuth,
    name: 'invokeAgent',
    displayName: 'Invoke Bronn Agent',
    description: 'Send a prompt to a Bronn Agent and get a response.',
    props: {
        agentId: Property.ShortText({
            displayName: 'Agent ID',
            required: true,
            description: 'The unique ID of the agent (e.g., nexus-7)',
        }),
        prompt: Property.LongText({
            displayName: 'Prompt',
            required: true,
            description: 'The instruction or data to send to the agent.',
        }),
        context: Property.Json({
            displayName: 'Context (Optional)',
            required: false,
            defaultValue: {},
        }),
    },
    async run({ auth, propsValue }) {
        const { agentId, prompt, context } = propsValue;
        return await makeBronnRequest(auth, 'POST', `/api/agents/${agentId}/invoke`, {
            prompt,
            context,
        });
    },
});
