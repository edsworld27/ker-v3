import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

// Import our custom collections and globals
import { CRMUsers as Users } from './payload/collections/CRMUsers'
import { CRMMedia as Media } from './payload/collections/CRMMedia'
import { CRMTenants as Tenants } from './payload/collections/CRMTenants'
import { CRMWebsiteConfig as WebsiteConfig } from './payload/collections/CRMWebsiteConfig'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '- AQUA CMS',
    },
    components: {
      views: {
        dashboard: {
          Component: '@/payload/components/CustomDashboard#CustomDashboard',
        },
      },
      graphics: {
        Logo: '@/payload/components/Logo#Logo',
        Icon: '@/payload/components/Icon#Icon',
      },
    },
  },
  collections: [
    Users,
    Media,
    Tenants,
    WebsiteConfig
  ],
  globals: [],
  plugins: [
    s3Storage({
      collections: {
        media: true, // This maps to our 'media' collection slug
      },
      bucket: process.env.S3_BUCKET || '',
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        region: process.env.S3_REGION || '',
        endpoint: process.env.S3_ENDPOINT || '', // e.g., https://s3.eu-west-1.amazonaws.com
      },
      // Automatically disable the S3 plugin if the S3_BUCKET env var is missing.
      // This allows local development to securely fall back to saving files in the local /media folder.
      enabled: Boolean(process.env.S3_BUCKET),
    }),
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'development-secret-key-aqua-cms',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.PAYLOAD_DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:5432/aqua_cms',
    },
  }),
  sharp,
})
