import React, { useState, useEffect } from 'react';

import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import UsersList from '../components/UsersList';
import { useHttpClient } from '../../shared/hooks/http-hook';

const Users = () => {
  const {isLoading, sendRequest, error, clearError } = useHttpClient();
  const [loadedUsers, setLoadedUsers] = useState(); 


  useEffect( () => {
    // async must not be used for useEffect callbacks, so create an nested function or a promise
    const fetchUsers = async () => {
      try {
        const responseData = await sendRequest(process.env.REACT_APP_BACKEND_URL + '/users');
        setLoadedUsers(responseData.users);
      } catch (err) {
      }
    }

    fetchUsers();
  }, [sendRequest]);

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className="center">
          <LoadingSpinner />
        </div>
      )}
      { !isLoading && loadedUsers && <UsersList items={loadedUsers} /> }
    </React.Fragment>
  );
};

export default Users;
