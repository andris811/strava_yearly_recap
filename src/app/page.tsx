import { getTokens } from '@/lib/server-auth';
import Dashboard from './Dashboard';
import ConnectPage from './connect/page';

export default async function Home() {
  const tokens = await getTokens();
  
  if (!tokens) {
    return <ConnectPage />;
  }
  
  return <Dashboard />;
}