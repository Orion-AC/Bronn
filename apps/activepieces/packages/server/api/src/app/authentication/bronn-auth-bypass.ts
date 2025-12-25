/**
 * Bronn Auth Bypass Module
 * 
 * This module provides authentication bypass for Bronn white-label deployment.
 * When AP_BRONN_AUTH_MODE=managed is set, native Activepieces authentication
 * is disabled and all auth goes through Bronn's managed-auth integration.
 * 
 * Usage:
 *   Set environment variable: AP_BRONN_AUTH_MODE=managed
 *   All /v1/authentication/* endpoints will return 403
 *   Only /v1/managed-authn/external-token will work
 */

import { AppSystemProp } from '@activepieces/server-shared'
import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { system } from '../helper/system/system'

// Custom system property for Bronn auth mode
const BRONN_AUTH_MODE = 'AP_BRONN_AUTH_MODE'

export const isBronnManagedAuthEnabled = (): boolean => {
    const authMode = system.get(BRONN_AUTH_MODE as AppSystemProp)
    return authMode === 'managed'
}

/**
 * Middleware that blocks native auth endpoints when Bronn managed auth is enabled.
 * This ensures users cannot bypass Firebase auth by going directly to Activepieces.
 */
export const bronnAuthBypassController: FastifyPluginAsyncTypebox = async (app) => {
    if (!isBronnManagedAuthEnabled()) {
        // Native auth is allowed, do nothing
        return
    }

    app.log.info('Bronn managed auth mode enabled - native auth endpoints blocked')

    // Block sign-up endpoint
    app.post('/sign-up', async (_request, reply) => {
        return reply.code(403).send({
            statusCode: 403,
            error: 'Forbidden',
            message: 'Native authentication is disabled. Please authenticate through Bronn.',
        })
    })

    // Block sign-in endpoint
    app.post('/sign-in', async (_request, reply) => {
        return reply.code(403).send({
            statusCode: 403,
            error: 'Forbidden',
            message: 'Native authentication is disabled. Please authenticate through Bronn.',
        })
    })
}

/**
 * Hook that checks Bronn auth headers for requests.
 * When a request comes with X-Bronn-User-Id header, it's trusted implicitly.
 */
export const bronnAuthHeadersHook = (request: { headers: Record<string, string | undefined> }) => {
    const bronnUserId = request.headers['x-bronn-user-id']
    const bronnUserEmail = request.headers['x-bronn-user-email']

    if (bronnUserId && bronnUserEmail) {
        return {
            authenticated: true,
            userId: bronnUserId,
            email: bronnUserEmail,
        }
    }

    return { authenticated: false }
}
