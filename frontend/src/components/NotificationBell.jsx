import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

const NotificationBell = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  // Fetch unread count
  const { data: countData } = useQuery({
    queryKey: ['notifications', 'unread-count', user?.user_id],
    queryFn: async () => {
      const res = await api.get(`/notifications/${user.user_id}/unread-count`);
      return res.data;
    },
    enabled: !!user?.user_id,
    refetchInterval: 30000, // poll every 30s
  });

  // Fetch notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.user_id],
    queryFn: async () => {
      const res = await api.get(`/notifications/${user.user_id}`);
      return res.data;
    },
    enabled: isOpen && !!user?.user_id,
  });

  // Mark as read mutation
  const markAsRead = useMutation({
    mutationFn: async (id) => {
      await api.put(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['notifications', 'unread-count']);
    },
  });

  const unreadCount = countData?.unread_count || 0;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-[16px] px-1 text-[10px] font-bold text-white bg-danger rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-bg-secondary border border-border rounded-lg shadow-xl z-50 overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-text-primary">Notifications</h3>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-text-muted text-sm">
                  No notifications
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 border-b border-border last:border-0 hover:bg-bg-tertiary transition-colors cursor-pointer ${
                      !notif.is_read ? 'bg-bg-tertiary/30' : ''
                    }`}
                    onClick={() => {
                      if (!notif.is_read) {
                        markAsRead.mutate(notif.id);
                      }
                    }}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-medium text-text-primary">
                        {notif.title}
                      </span>
                      {!notif.is_read && (
                        <span className="w-2 h-2 rounded-full bg-accent mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-text-secondary mb-2">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-text-muted">
                      {new Date(notif.created_at).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
