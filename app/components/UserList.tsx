import React from 'react';
import useApi from '../hooks/useApi';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'vendor' | 'customer';
}

const UserList: React.FC = () => {
  const { data: users, loading, error } = useApi<User[]>('/users');

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h1>User List</h1>
      <ul>
        {users?.map((user) => (
          <li key={user.id}>
            {user.name} ({user.email})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
