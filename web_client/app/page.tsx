import { getServerApplicationInfo } from '@/core/services/server';

import { HomeScaffold } from './home';
import { getAppServerSession } from '@/core/services/next-auth';

export default async function Home() {
  const session = await getAppServerSession();
  const res = await getServerApplicationInfo();

  const data = res.data;

  return <HomeScaffold appDesc={data.description} appName={data.title} session={session} />;
}
