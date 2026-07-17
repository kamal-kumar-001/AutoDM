'use client';

import * as React from 'react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { useSession } from 'next-auth/react';
import {
  User,
  Shield,
  Lock,
  Bell,
  Settings,
  Globe,
  ShieldAlert,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button, Input, Label, toast } from '@autodm/ui';
import { apiRequest } from '@/lib/api-client';
import { ConnectedAccounts } from '@/components/dashboard/connected-accounts';

type SettingTab = 'profile' | 'security' | 'channels' | 'preferences';

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const [activeTab, setActiveTab] = React.useState<SettingTab>('profile');

  // Profile Edit State
  const [name, setName] = React.useState('');
  const [updatingProfile, setUpdatingProfile] = React.useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [changingPassword, setChangingPassword] = React.useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  // Preference Settings State
  const [timezone, setTimezone] = React.useState('UTC');
  const [emailNotify, setEmailNotify] = React.useState(true);
  const [savingPrefs, setSavingPrefs] = React.useState(false);

  React.useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
    }
  }, [session]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty.');
      return;
    }

    setUpdatingProfile(true);
    try {
      const updatedUser = await apiRequest<{ name: string }>('/auth/me', {
        method: 'POST',
        body: JSON.stringify({ name }),
      });

      // Update NextAuth local session storage cache
      await updateSession({
        user: {
          ...session?.user,
          name: updatedUser.name,
        },
      });

      toast.success('Profile details updated successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }

    setChangingPassword(true);
    try {
      await apiRequest('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Incorrect current password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPrefs(true);
    setTimeout(() => {
      setSavingPrefs(false);
      toast.success('Notification and Regional preferences saved!');
    }, 800);
  };

  const userEmail = session?.user?.email || 'user@autodm.com';
  const userRole = (session?.user as any)?.role || 'CREATOR';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Title */}
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Settings</h1>
          <p className="text-xs text-gray-500">
            Manage account options, channels, and security settings
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Tab Navigation Menu */}
          <div className="flex flex-col space-y-1">
            {[
              { id: 'profile' as const, label: 'Profile Options', icon: User },
              { id: 'security' as const, label: 'Security & Access', icon: Lock },
              { id: 'channels' as const, label: 'Instagram Channels', icon: Globe },
              { id: 'preferences' as const, label: 'Preferences', icon: Bell },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-primary/10 border-primary/20 text-primary shadow-sm'
                    : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content Panel */}
          <div className="md:col-span-3 space-y-6">
            {activeTab === 'profile' && (
              <div className="glass-card border-gradient p-6 rounded-2xl shadow-glass space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center space-x-3 pb-4 border-b border-white/5">
                  <User className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="text-sm font-bold text-white">Public Profile Settings</h3>
                    <p className="text-[10px] text-gray-500">
                      Update your account name and identity metadata
                    </p>
                  </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
                  <div className="space-y-1.5">
                    <Label htmlFor="prof-name">Full Name</Label>
                    <Input
                      id="prof-name"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="prof-email">Email Address</Label>
                    <Input
                      id="prof-email"
                      value={userEmail}
                      disabled
                      className="bg-white/5 text-gray-400 border-white/5 select-none cursor-not-allowed"
                    />
                    <span className="text-[9px] text-gray-500 flex items-center space-x-1">
                      <Shield className="h-3 w-3" />
                      <span>Email address cannot be changed. Contact support if needed.</span>
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="prof-role">User Role</Label>
                    <Input
                      id="prof-role"
                      value={userRole}
                      disabled
                      className="bg-white/5 text-gray-400 border-white/5 select-none cursor-not-allowed capitalize"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="sm"
                    className="font-semibold text-xs h-9 w-28 cursor-pointer"
                    disabled={updatingProfile}
                  >
                    {updatingProfile ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Save Profile'
                    )}
                  </Button>
                </form>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="glass-card border-gradient p-6 rounded-2xl shadow-glass space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center space-x-3 pb-4 border-b border-white/5">
                  <Lock className="h-5 w-5 text-accent-cyan" />
                  <div>
                    <h3 className="text-sm font-bold text-white">Update Password</h3>
                    <p className="text-[10px] text-gray-500">
                      Secure your session with a new credential profile
                    </p>
                  </div>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  {/* Current Password */}
                  <div className="space-y-1.5 relative">
                    <Label htmlFor="curr-pass">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="curr-pass"
                        type={showCurrentPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors cursor-pointer"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-1.5 relative">
                    <Label htmlFor="new-pass">New Password</Label>
                    <div className="relative">
                      <Input
                        id="new-pass"
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors cursor-pointer"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div className="space-y-1.5 relative">
                    <Label htmlFor="conf-pass">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="conf-pass"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors cursor-pointer"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="sm"
                    variant="secondary"
                    className="font-semibold text-xs h-9 w-36 cursor-pointer"
                    disabled={changingPassword}
                  >
                    {changingPassword ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Change Password'
                    )}
                  </Button>
                </form>
              </div>
            )}

            {activeTab === 'channels' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="glass-card border-gradient p-6 rounded-2xl shadow-glass flex justify-between items-center">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white">Instagram Channels Management</h3>
                    <p className="text-[10px] text-gray-500">
                      Link new channels or check access authorizations.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1">
                  <ConnectedAccounts />
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="glass-card border-gradient p-6 rounded-2xl shadow-glass space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center space-x-3 pb-4 border-b border-white/5">
                  <Settings className="h-5 w-5 text-amber-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Notification & Regional Preferences
                    </h3>
                    <p className="text-[10px] text-gray-500">
                      Configure dashboard alerts and server timezone variables
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSavePreferences} className="space-y-6 max-w-md">
                  {/* Timezone */}
                  <div className="space-y-1.5">
                    <Label htmlFor="pref-tz">System Timezone</Label>
                    <select
                      id="pref-tz"
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="UTC" className="bg-background">
                        Coordinated Universal Time (UTC)
                      </option>
                      <option value="EST" className="bg-background">
                        Eastern Standard Time (EST)
                      </option>
                      <option value="PST" className="bg-background">
                        Pacific Standard Time (PST)
                      </option>
                      <option value="IST" className="bg-background">
                        Indian Standard Time (IST)
                      </option>
                    </select>
                  </div>

                  {/* Toggle Notification */}
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl border border-white/5">
                    <input
                      id="pref-email"
                      type="checkbox"
                      checked={emailNotify}
                      onChange={(e) => setEmailNotify(e.target.checked)}
                      className="h-4 w-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary"
                    />
                    <div className="flex flex-col">
                      <Label htmlFor="pref-email" className="font-semibold cursor-pointer">
                        Email reports
                      </Label>
                      <span className="text-[9px] text-gray-500">
                        Receive weekly summaries of DM response analytics
                      </span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="sm"
                    className="font-semibold text-xs h-9 w-28 cursor-pointer"
                    disabled={savingPrefs}
                  >
                    {savingPrefs ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Settings'}
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
