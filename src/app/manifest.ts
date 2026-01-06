import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '我们的恋爱日历',
    short_name: 'Love Calendar',
    description: '属于我们的时间',
    start_url: '/',
    display: 'standalone',
    background_color: '#fff8fa',
    theme_color: '#fff8fa',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      }
    ],
  }
}
