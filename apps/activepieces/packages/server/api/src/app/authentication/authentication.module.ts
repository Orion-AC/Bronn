import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { authenticationController } from './authentication.controller'
import { bronnAuthBypassController, isBronnManagedAuthEnabled } from './bronn-auth-bypass'

export const authenticationModule: FastifyPluginAsyncTypebox = async (app) => {
    // Register Bronn auth bypass first - it will block native auth if managed mode is enabled
    if (isBronnManagedAuthEnabled()) {
        await app.register(bronnAuthBypassController, {
            prefix: '/v1/authentication',
        })
        app.log.info('Bronn managed auth mode: native /v1/authentication endpoints blocked')
        return // Don't register native auth controller
    }

    // Native auth mode - register the original controller
    await app.register(authenticationController, {
        prefix: '/v1/authentication',
    })
}

