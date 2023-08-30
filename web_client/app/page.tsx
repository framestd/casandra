import { getApplicationInfo_Cached } from '@/core/services/build-props';

import { HomeScaffold } from './home';

export default async function Home() {
  const res = await getApplicationInfo_Cached();

  const data = res.data;

  return <HomeScaffold appDesc={data.description} appName={data.title} />;
}
