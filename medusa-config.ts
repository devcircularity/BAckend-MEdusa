import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  admin: {
    // Add this to allow your production domain
    vite: () => ({
      server: {
        host: true,
        allowedHosts: [
          'localhost',
          '127.0.0.1',
          'api.daimamkenyaafrica.com',
          'admin.daimamkenyaafrica.com'
        ]
      }
    })
  },
  modules: [
    {
      resolve: "@medusajs/file",
      options: {
        providers: [
          {
            resolve: "./src/modules/payload-file",
            id: "payload",
            options: {
              payloadUrl: process.env.PAYLOAD_URL || "http://localhost:3001",
              payloadApiKey: process.env.PAYLOAD_API_KEY,
              collection: "media",
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/payment",
      options: {
        providers: [
          {
            resolve: "./src/modules/pesapal",
            id: "pesapal",
            options: {
              consumer_key: process.env.PESAPAL_CONSUMER_KEY || "",
              consumer_secret: process.env.PESAPAL_CONSUMER_SECRET || "",
              sandbox: process.env.NODE_ENV !== 'production', // Auto-detect sandbox mode
              ipn_url: process.env.PESAPAL_IPN_URL || "http://localhost:9000/api/webhooks/pesapal",
              callback_url: process.env.PESAPAL_CALLBACK_URL || "http://localhost:9000/checkout/complete"
            },
          },
        ],
      },
    }
  ]
})