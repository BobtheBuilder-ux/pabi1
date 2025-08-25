import { useGlobalSearchQuery } from '../lib/api/userApi';
import { useState } from 'react';

export interface Connection {
  id: string;
  name: string;
  avatar?: string;
  title?: string;
  company?: string;
}

export const useConnections = () => {
  const [search, setSearch] = useState('');

  const { data: connectionsData, isLoading } = useGlobalSearchQuery({
    q: search,
    cursor: '',
    size: 100,
    hasConnection: true
  });

  const connections = connectionsData?.data?.users?.map(user => ({
    id: user.id,
    name: user.profile?.personalName || user.profile?.companyName || 'Unknown',
    avatar: user.profile?.profilePictureUrl,
    title: user.profile?.title,
    company: user.profile?.companyName
  })) || [];

  return {
    connections,
    isLoading,
    search,
    setSearch
  };
};