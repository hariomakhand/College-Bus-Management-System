import { useCheckAuthQuery } from '../store/apiSlice';

const AuthTest = () => {
  const { data, error, isLoading } = useCheckAuthQuery();

  if (isLoading) return <div>Checking auth...</div>;
  
  return (
    <div className="p-4 bg-gray-100 rounded">
      <h3>Auth Status:</h3>
      {error ? (
        <div className="text-red-600">
          Error: {error.status} - {error.data?.message || 'Authentication failed'}
        </div>
      ) : (
        <div className="text-green-600">
          Authenticated: {data?.isAuth ? 'Yes' : 'No'}
          {data?.user && <div>User: {data.user.email} ({data.user.role})</div>}
        </div>
      )}
    </div>
  );
};

export default AuthTest;