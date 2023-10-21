import './globals.css';
import 'react-toastify/dist/ReactToastify.css';

import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { cookies } from 'next/headers';

import { AppProvider } from '@/core/components/Providers';
import { getApplicationInfo_Cached } from '@/core/services/build-props';
import { getAppServerSession } from '@/core/services/next-auth';
import { tokenRegistry } from '@/core/services/next-auth/registry';
import { COLORMODE_STORAGE_KEY, CONFIG_SCRIPT_NAME } from '@/core/utils';

const pjs = Plus_Jakarta_Sans({ weight: '400', subsets: ['latin'] });

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
  const cookieStore = cookies();
  const colormode = cookieStore.get(COLORMODE_STORAGE_KEY);
  const session = await getAppServerSession();
  const res = await getApplicationInfo_Cached();

  const data = res.data;

  if (session && session.tokens) tokenRegistry.register(session.tokens);

  return (
    <html lang="en">
      <body className={pjs.className}>
        <script
          type="application/json"
          //@ts-expect-error
          name={CONFIG_SCRIPT_NAME}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />

        <AppProvider session={session} colormode={colormode?.value}>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
