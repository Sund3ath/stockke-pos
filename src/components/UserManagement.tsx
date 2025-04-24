import React, { useState, useEffect } from 'react';
import { User, fetchUsers, createUser, deleteUser } from '../api/users';
import { UserPlus, Trash2, Save } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Formular für neuen Benutzer
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: 'user'
  });
  
  // Benutzer laden
  const loadUsers = async () => {
    setLoading(true);
    try {
      const fetchedUsers = await fetchUsers();
      setUsers(fetchedUsers);
      setError('');
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Fehler beim Laden der Benutzer');
    } finally {
      setLoading(false);
    }
  };
  
  // Beim Laden der Komponente Benutzer abrufen
  useEffect(() => {
    loadUsers();
  }, []);
  
  // Neuen Benutzer erstellen
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUser.username || !newUser.password) {
      setError('Benutzername und Passwort sind erforderlich');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const createdUser = await createUser({
        username: newUser.username,
        password: newUser.password,
        role: newUser.role
      });
      
      if (createdUser) {
        setUsers([...users, createdUser]);
        setNewUser({ username: '', password: '', role: 'user' });
        setSuccess(`Benutzer "${createdUser.username}" wurde erfolgreich erstellt!`);
        
        // Erfolgsmeldung für 5 Sekunden anzeigen
        setTimeout(() => setSuccess(''), 5000);
        
        // Formular zurücksetzen
        const form = e.target as HTMLFormElement;
        form.reset();
      } else {
        setError('Fehler beim Erstellen des Benutzers. Bitte versuchen Sie es erneut.');
      }
    } catch (err) {
      console.error('Error creating user:', err);
      setError('Fehler beim Erstellen des Benutzers. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };
  
  // Benutzer löschen
  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Sind Sie sicher, dass Sie diesen Benutzer löschen möchten?')) {
      return;
    }
    
    setLoading(true);
    try {
      const success = await deleteUser(id);
      
      if (success) {
        setUsers(users.filter(user => user.id !== id));
        setSuccess('Benutzer erfolgreich gelöscht');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Fehler beim Löschen des Benutzers');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Fehler beim Löschen des Benutzers');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6 mt-8">
      <h3 className="text-lg font-semibold">Benutzerverwaltung</h3>
      
      {/* Fehlermeldung */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md text-base font-medium border border-red-300 shadow-sm flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
      
      {/* Erfolgsmeldung */}
      {success && (
        <div className="bg-green-100 text-green-700 p-4 rounded-md text-base font-medium border border-green-300 shadow-sm flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {success}
        </div>
      )}
      
      {/* Benutzerliste */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Benutzername
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rolle
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aktionen
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.username}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={user.username === 'admin'} // Admin-Benutzer kann nicht gelöscht werden
                    className={`text-red-600 hover:text-red-900 ${
                      user.username === 'admin' ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Formular für neuen Benutzer */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="text-base font-medium mb-4">Neuen Benutzer erstellen</h4>
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Benutzername</label>
              <input
                type="text"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Passwort</label>
              <input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Rolle</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="user">Benutzer</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
            >
              <UserPlus size={18} />
              Benutzer erstellen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};