const express = require("express")
const { getConfigFile } = require("medusa-core-utils")
const loaders = require("@medusajs/medusa/dist/loaders").default
const path = require("path")

const app = express()

// Serve the static folder
app.use("/static", express.static(path.join(__dirname, "static")))

// Load Medusa
const { configModule } = getConfigFile(__dirname)

loaders({ directory: __dirname, expressApp: app, configModule })
  .then(() => {
    const port = process.env.PORT || 9000
    app.listen(port, () => {
      console.log(`Medusa server running on port: ${port}`)
    })
  })
