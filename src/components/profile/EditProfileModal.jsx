import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { User, Phone, Mail, Camera, Upload, Check } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';

export const EditProfileModal = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || DEFAULT_AVATAR);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAvatar(user.avatar || DEFAULT_AVATAR);
    }
  }, [user, isOpen]);

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit. Please select a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await updateProfile({
        fullName,
        email,
        phone,
        avatar
      });
      setMessage('Profile updated successfully!');
      setTimeout(() => {
        setMessage('');
        onClose();
      }, 800);
    } catch (err) {
      console.error(err);
      setMessage('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile Details">
      <form onSubmit={handleSave} className="space-y-5">
        {message && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-2xl flex items-center gap-2">
            <Check size={16} />
            <span>{message}</span>
          </div>
        )}

        {/* Profile Picture Upload Section */}
        <div className="flex flex-col items-center justify-center gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="relative group">
            <img
              src={avatar || DEFAULT_AVATAR}
              alt="Profile Avatar Preview"
              className="w-20 h-20 rounded-full object-cover border-4 border-purple-300 dark:border-purple-800 shadow-md"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg transition-transform active:scale-95 cursor-pointer"
              title="Upload New Photo"
            >
              <Camera size={14} />
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon={Upload}
            onClick={() => fileInputRef.current?.click()}
          >
            Upload Photo
          </Button>
        </div>

        {/* Text Fields */}
        <Input
          label="Full Name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          icon={User}
        />

        <Input
          label="Email Address"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={Mail}
        />

        <Input
          label="Mobile Phone"
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          icon={Phone}
        />

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="secondary" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" fullWidth loading={loading}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
