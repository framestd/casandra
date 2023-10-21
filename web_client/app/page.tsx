import { getApplicationInfo_Cached } from '@/core/services/build-props';

import { HomeScaffold } from './home';
import { getAppServerSession } from '@/core/services/next-auth';

export default async function Home() {
  const session = await getAppServerSession()
  const res = await getApplicationInfo_Cached();

  const data = res.data;

  return <HomeScaffold appDesc={data.description} appName={data.title} session={session} />;
}
