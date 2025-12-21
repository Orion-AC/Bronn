import { PieceAuth, Property } from '@activepieces/pieces-framework';

export const bronnAuth = PieceAuth.CustomAuth({
    description: 'Connect to your Bronn Studio instance.',
    required: true,
    props: {
        baseUrl: Property.ShortText({
            displayName: 'Bronn Backend URL',
            required: true,
            defaultValue: 'http://bronn-backend:8000',
        }),
        apiKey: PieceAuth.SecretText({
            displayName: 'API Key',
            required: true,
        }),
    },
});

export const makeBronnRequest = async (auth: any, method: string, path: string, body?: any) => {
    const url = `${auth.props.baseUrl}${path}`;
    const response = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            'X-API-Key': auth.props.apiKey,
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Request failed');
    }

    return response.json();
};
