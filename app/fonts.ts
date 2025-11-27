import localFont from 'next/font/local';

export const bitter = localFont({
  src: [
    {
      path: '../public/fonts/bitter/Bitter-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/bitter/Bitter-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/bitter/Bitter-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../public/fonts/bitter/Bitter-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-bitter',
  display: 'swap',
});

export const spaceMono = localFont({
  src: [
    {
      path: '../public/fonts/space-mono/SpaceMono-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/space-mono/SpaceMono-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-space-mono',
  display: 'swap',
});
