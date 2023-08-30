import './globals.css';
import 'react-toastify/dist/ReactToastify.css';

import { AppProvider } from '@/core/components/Providers';
import { getApplicationInfo_Cached } from '@/core/services/build-props';
import { CONFIG_SCRIPT_NAME } from '@/core/utils';

import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';

const pjs = Plus_Jakarta_Sans({ subsets: ['latin'] });

export const generateMetadata = async (): Promise<Metadata> => {
  const res = await getApplicationInfo_Cached();
  const data = res.data;

  return {
    title: { absolute: data.title, template: `%s | ${data.title}` },
    description: data.description,
    viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  };
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const res = await getApplicationInfo_Cached();

  const data = res.data;

  return (
    <html lang="en">
      <body className={pjs.className}>
        <script
          type="application/json"
          //@ts-expect-error
          name={CONFIG_SCRIPT_NAME}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />

        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
