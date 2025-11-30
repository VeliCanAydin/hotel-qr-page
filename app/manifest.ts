import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Dosinia Luxury Resort',
    short_name: 'Dosinia',
    description: 'Experience the best luxury stay at Dosinia Hotel.',
    start_url: '/',
    display: 'fullscreen',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#1e3a5f',
    icons: [
      {
        src: '/icons/icon-128x128.png',
        sizes: '128x128',
        type: 'image/png',
      },
      {
        src: '/icons/icon-128x128.png',
        sizes: '128x128',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}