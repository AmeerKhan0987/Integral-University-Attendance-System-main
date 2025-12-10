
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Role } from '../../types';

export default function Announcements() {
  const { state, dispatch } = useData();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetRole, setTargetRole] = useState<Role | 'all'>('all');
  const [feedback, setFeedback] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
      setFeedback('Title and message cannot be empty.');
      return;
    }
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: Date.now(),
        title,
        message,
        role: targetRole,
        createdAt: new Date().toISOString(),
      },
    });
    setFeedback('Announcement sent successfully!');
    setTitle('');
    setMessage('');
    setTimeout(() => setFeedback(''), 3000);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Send Announcement</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
            <textarea
              id="message"
              rows={4}
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label htmlFor="targetRole" className="block text-sm font-medium text-gray-700">Send To</label>
            <select
              id="targetRole"
              value={targetRole}
              onChange={e => setTargetRole(e.target.value as Role | 'all')}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Users</option>
              <option value={Role.Admin}>Admins Only</option>
              <option value={Role.Employee}>Employees Only</option>
            </select>
          </div>
          <div className="flex items-center justify-end">
            {feedback && <p className="text-sm text-green-600 mr-4">{feedback}</p>}
            <button type="submit" className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700">Send</button>
          </div>
        </form>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Announcements</h2>
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {state.notifications.map(notif => (
                <div key={notif.id} className="border-l-4 border-primary-500 pl-4 py-2 bg-gray-50 rounded">
                    <div className="flex justify-between items-baseline">
                        <h4 className="font-bold text-gray-800">{notif.title}</h4>
                        <span className="text-xs text-gray-400">{new Date(notif.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                    <span className="text-xs text-gray-500 font-medium capitalize mt-2 inline-block">To: {notif.role}</span>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
