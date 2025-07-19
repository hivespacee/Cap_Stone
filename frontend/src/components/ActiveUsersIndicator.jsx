import { Users } from 'lucide-react';

const ActiveUsersIndicator = ({ users = [] }) => {
  if (users.length === 0) return null;

  const displayUsers = users.slice(0, 3);
  const remainingCount = users.length - 3;

  return (
    <div className="flex items-center gap-2">
      <Users className="w-4 h-4 text-gray-500" />
      <div className="flex items-center">
        <div className="flex -space-x-2">
          {displayUsers.map((user, index) => (
            <div
              key={user.userId}
              className="w-8 h-8 rounded-full bg-slate text-white text-xs flex items-center justify-center border-2 border-white dark:border-gray-800"
              title={user.userName}
              style={{ zIndex: displayUsers.length - index }}
            >
              {user.userName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          ))}
        </div>
        {remainingCount > 0 && (
          <div className="ml-2 text-sm text-gray-500 dark:text-gray-400">
            +{remainingCount} more
          </div>
        )}
      </div>
      <span className="text-sm text-gray-500 dark:text-gray-400">
        {users.length === 1 ? '1 user' : `${users.length} users`} active
      </span>
    </div>
  );
};

export default ActiveUsersIndicator;