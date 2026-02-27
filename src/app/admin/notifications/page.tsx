'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/use-api';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface Notification {
  id: string;
  title: string;
  message: string;
  userId: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const { get, post, isLoading, error } = useApi();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [sendOpen, setSendOpen] = useState(false);
  const [sendForm, setSendForm] = useState({ userId: '', title: '', message: '' });
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    const res = await get<{ success: boolean; data: Notification[] }>('/api/notifications');
    if (res?.success) setNotifications(res.data);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setFeedback('');
    const res = await post<{ success: boolean }>('/api/notifications/send', sendForm);
    if (res?.success) {
      setFeedback('Notification sent.');
      setSendOpen(false);
      setSendForm({ userId: '', title: '', message: '' });
      fetchNotifications();
    } else {
      setFeedback(error?.message || 'Failed to send.');
    }
    setTimeout(() => setFeedback(''), 3000);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Send Notifications</h1>
          <p className="text-gray-600 mt-1">Send and view user notifications</p>
        </div>
        <Button variant="primary" onClick={() => setSendOpen(true)}>+ Send Notification</Button>
      </div>

      {feedback && (
        <Card className="bg-green-50 border-green-200 p-4">
          <p className="text-green-800">{feedback}</p>
        </Card>
      )}

      <Card className="p-6">
        {isLoading && <p className="text-gray-600">Loading notifications...</p>}
        {!isLoading && notifications.length === 0 && <p className="text-gray-600">No notifications sent yet.</p>}
        {notifications.length > 0 && (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div key={notif.id} className="p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{notif.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                    <p className="text-xs text-gray-500 mt-2">{new Date(notif.createdAt).toLocaleString()}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    notif.isRead ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {notif.isRead ? 'Read' : 'Unread'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal isOpen={sendOpen} onClose={() => setSendOpen(false)} title="Send Notification" size="md">
        <form onSubmit={handleSend} className="space-y-4">
          <Input
            label="User ID (or leave blank for all)"
            value={sendForm.userId}
            onChange={(e) => setSendForm({ ...sendForm, userId: e.target.value })}
            placeholder="Optional"
          />
          <Input
            label="Title"
            value={sendForm.title}
            onChange={(e) => setSendForm({ ...sendForm, title: e.target.value })}
            required
          />
          <Input
            label="Message"
            value={sendForm.message}
            onChange={(e) => setSendForm({ ...sendForm, message: e.target.value })}
            required
          />
          <div className="flex gap-2">
            <Button type="submit" variant="primary" isLoading={isLoading}>
              Send
            </Button>
            <Button type="button" variant="outline" onClick={() => setSendOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
