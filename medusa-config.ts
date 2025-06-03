import { loadEnv, defineConfig } from '@medusajs/framework/utils'
import { Modules } from "@medusajs/framework/utils"

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
  modules: [
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/file-s3",
            id: "s3",
            options: {
              file_url: process.env.S3_FILE_URL,
              bucket: process.env.S3_BUCKET,
              region: process.env.S3_REGION,
              access_key_id: process.env.S3_ACCESS_KEY_ID,
              secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
              endpoint: `https://s3.${process.env.S3_REGION}.amazonaws.com`
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
            resolve: "./src/modules/pesapal",  // Changed from "src/modules/pesapal" to "./src/modules/pesapal"
            id: "pesapal",
            options: {
              consumer_key: process.env.PESAPAL_CONSUMER_KEY || "",
              consumer_secret: process.env.PESAPAL_CONSUMER_SECRET || "",
              sandbox: true,
              ipn_url: process.env.PESAPAL_IPN_URL || "http://localhost:9000/api/webhooks/pesapal",
              callback_url: process.env.PESAPAL_CALLBACK_URL || "http://localhost:9000/checkout/complete"
            },
          },
        ],
      },
    }
  ]
})
