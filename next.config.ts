import { withPayload } from '@payloadcms/next/withPayload'

export default withPayload({
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/media/**',
      },
    ],
  },
})
