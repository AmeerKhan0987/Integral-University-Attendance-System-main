
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { User, Role } from '../../types';
import { DEPARTMENTS } from '../../constants';
import { PlusIcon, PencilIcon, TrashIcon, FaceSmileIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import FaceScanModal from '../shared/FaceScanModal';

export default function EmployeeManagement() {
  const { state, dispatch } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const employees = state.users.filter(u => u.role === Role.Employee);

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddNew = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = (userId: number) => {
    if(window.confirm('Are you sure you want to delete this employee and all their data?')) {
        dispatch({ type: 'DELETE_USER', payload: userId });
    }
  };

  const handleRecordFace = (user: User) => {
      setEditingUser(user);
      setIsScanning(true);
  };
  
  const handleScanComplete = (success: boolean) => {
      setIsScanning(false);
      if(success) {
          alert(`Face data for ${editingUser?.name} has been recorded successfully.`);
          // In a real app, you'd dispatch an update to the user's faceData here.
      } else {
          alert('Face data recording failed.');
      }
      setEditingUser(null);
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Employee Management</h2>
        <button
          onClick={handleAddNew}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Employee
        </button>
      </div>

      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
            type="text"
            placeholder="Search employees by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        />
      </div>


      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Employee</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Designation</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Department</th>
              <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {filteredEmployees.map(user => (
              <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <img className="h-10 w-10 rounded-full object-cover mr-3" src={user.profileImage} alt={user.name} />
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">{user.designation}</td>
                <td className="py-3 px-4">{user.department}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-center space-x-2">
                    <button onClick={() => handleRecordFace(user)} className="p-2 text-blue-500 hover:bg-blue-100 rounded-full" title="Record Face Data"><FaceSmileIcon className="h-5 w-5" /></button>
                    <button onClick={() => handleEdit(user)} className="p-2 text-yellow-500 hover:bg-yellow-100 rounded-full" title="Edit"><PencilIcon className="h-5 w-5" /></button>
                    <button onClick={() => handleDelete(user.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full" title="Delete"><TrashIcon className="h-5 w-5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {isModalOpen && <EmployeeModal user={editingUser} onClose={() => setIsModalOpen(false)} />}
      {isScanning && editingUser && <FaceScanModal onClose={() => setIsScanning(false)} onScanComplete={handleScanComplete} purpose="register" />}

    </div>
  );
}

// Sub-component for Add/Edit Modal
function EmployeeModal({ user, onClose }: { user: User | null; onClose: () => void }) {
  const { dispatch } = useData();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    department: user?.department || DEPARTMENTS[0],
    designation: user?.designation || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      // Edit
      dispatch({ type: 'UPDATE_USER', payload: { ...user, ...formData } });
    } else {
      // Add
      const newUser: User = {
        id: Date.now(),
        ...formData,
        role: Role.Employee,
        profileImage: `https://i.pravatar.cc/150?u=${formData.email}`,
        faceData: null,
        createdAt: new Date().toISOString().split('T')[0],
        password: 'password' // Default password for new users
      };
      dispatch({ type: 'ADD_USER', payload: newUser });
    }
    onClose();
  };
  
  return (
     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4">{user ? 'Edit Employee' : 'Add New Employee'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500" required />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Designation</label>
                    <input type="text" name="designation" value={formData.designation} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <select name="department" value={formData.department} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500">
                        {DEPARTMENTS.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                    </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                    <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">{user ? 'Save Changes' : 'Add Employee'}</button>
                </div>
            </form>
        </div>
     </div>
  );
}
