import {
  DeleteFileType,
  FileServiceGetUploadStreamResult,
  FileServiceUploadResult,
  GetUploadedFileType,
  UploadStreamDescriptorType,
} from "@medusajs/framework/types"
import { MedusaError } from "@medusajs/framework/utils"
import FormData from "form-data"
import stream from "stream"

type PayloadFileProviderOptions = {
  payloadUrl: string
  payloadApiKey?: string
  collection?: string // Optional: specify which Payload collection to use (default: 'media')
}

type FileData = {
  buffer: Buffer
  originalname: string
  mimetype: string
}

class PayloadFileProviderService {
  static identifier = "payload-file"
  protected payloadUrl_: string
  protected payloadApiKey_?: string
  protected collection_: string

  constructor(
    _container: any,
    options: PayloadFileProviderOptions
  ) {
    this.payloadUrl_ = options.payloadUrl
    this.payloadApiKey_ = options.payloadApiKey
    this.collection_ = options.collection || "media"
  }

  async upload(
    file: FileData
  ): Promise<FileServiceUploadResult> {
    try {
      const formData = new FormData()
      formData.append("file", file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      })

      const headers: Record<string, string> = {
        ...formData.getHeaders(),
      }

      if (this.payloadApiKey_) {
        headers["Authorization"] = `users API-Key ${this.payloadApiKey_}`
      }

      const response = await fetch(
        `${this.payloadUrl_}/api/${this.collection_}`,
        {
          method: "POST",
          headers,
          body: formData as any,
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          `Failed to upload file to Payload: ${errorText}`
        )
      }

      const data = await response.json()

      // Payload returns Cloudinary URL directly in the url field
      return {
        url: data.doc.url, // Already a full Cloudinary URL
        key: data.doc.id,
      }
    } catch (error) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to upload file: ${error.message}`
      )
    }
  }

  async uploadProtected(
    file: FileData
  ): Promise<FileServiceUploadResult> {
    // For protected files, you might want to add metadata or use a different collection
    return this.upload(file)
  }

  async delete(file: DeleteFileType): Promise<void> {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }

      if (this.payloadApiKey_) {
        headers["Authorization"] = `users API-Key ${this.payloadApiKey_}`
      }

      const response = await fetch(
        `${this.payloadUrl_}/api/${this.collection_}/${file.fileKey}`,
        {
          method: "DELETE",
          headers,
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          `Failed to delete file from Payload: ${errorText}`
        )
      }
    } catch (error) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to delete file: ${error.message}`
      )
    }
  }

  async getUploadStreamDescriptor(
    fileData: UploadStreamDescriptorType
  ): Promise<FileServiceGetUploadStreamResult> {
    const pass = new stream.PassThrough()

    const chunks: Buffer[] = []
    pass.on("data", (chunk) => chunks.push(chunk))

    const promise = new Promise<FileServiceUploadResult>(
      async (resolve, reject) => {
        pass.on("end", async () => {
          try {
            const buffer = Buffer.concat(chunks)
            const file: FileData = {
              buffer,
              originalname: fileData.name,
              mimetype: fileData.ext || 'application/octet-stream',
            }

            const result = fileData.isProtected
              ? await this.uploadProtected(file)
              : await this.upload(file)

            resolve(result)
          } catch (error) {
            reject(error)
          }
        })

        pass.on("error", (error) => {
          reject(error)
        })
      }
    )

    return {
      writeStream: pass,
      promise,
      url: "",
      fileKey: "",
    }
  }

  async getDownloadStream(
    fileData: GetUploadedFileType
  ): Promise<NodeJS.ReadableStream> {
    try {
      // First, get the Cloudinary URL from Payload
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }

      if (this.payloadApiKey_) {
        headers["Authorization"] = `users API-Key ${this.payloadApiKey_}`
      }

      const payloadResponse = await fetch(
        `${this.payloadUrl_}/api/${this.collection_}/${fileData.fileKey}`,
        {
          method: "GET",
          headers,
        }
      )

      if (!payloadResponse.ok) {
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          "Failed to get file info from Payload"
        )
      }

      const data = await payloadResponse.json()
      const cloudinaryUrl = data.url

      // Now fetch the actual file from Cloudinary
      const response = await fetch(cloudinaryUrl)

      if (!response.ok || !response.body) {
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          "Failed to get download stream from Cloudinary"
        )
      }

      return stream.Readable.fromWeb(response.body as any)
    } catch (error) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to get download stream: ${error.message}`
      )
    }
  }

  async getPresignedDownloadUrl(
    fileData: GetUploadedFileType
  ): Promise<string> {
    // With Cloudinary integration, we need to fetch the document to get the URL
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }

      if (this.payloadApiKey_) {
        headers["Authorization"] = `users API-Key ${this.payloadApiKey_}`
      }

      const response = await fetch(
        `${this.payloadUrl_}/api/${this.collection_}/${fileData.fileKey}`,
        {
          method: "GET",
          headers,
        }
      )

      if (!response.ok) {
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          "Failed to get file URL from Payload"
        )
      }

      const data = await response.json()
      
      // Return the Cloudinary URL directly
      return data.url
    } catch (error) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to get presigned URL: ${error.message}`
      )
    }
  }
}

export default PayloadFileProviderService