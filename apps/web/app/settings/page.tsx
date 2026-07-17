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

  // Account Deletion State
  const [deleteRequest, setDeleteRequest] = React.useState<any | null>(null);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [deleteReason, setDeleteReason] = React.useState('');
  const [deleteFeedback, setDeleteFeedback] = React.useState('');
  const [confirmDeleteCheck, setConfirmDeleteCheck] = React.useState(false);
  const [submittingDelete, setSubmittingDelete] = React.useState(false);
  const [cancellingDelete, setCancellingDelete] = React.useState(false);

  const fetchDeleteRequest = React.useCallback(async () => {
    try {
      const data = await apiRequest<any>('/auth/delete-request');
      setDeleteRequest(data);
    } catch (e) {
      setDeleteRequest(null);
    }
  }, []);

  React.useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
    }
    fetchDeleteRequest();
  }, [session, fetchDeleteRequest]);

  const handleSubmitDeleteRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteReason) {
      toast.error('Please select a reason for deletion.');
      return;
    }
    if (!confirmDeleteCheck) {
      toast.error('Please check the confirmation box.');
      return;
    }

    setSubmittingDelete(true);
    try {
      const data = await apiRequest<any>('/auth/delete-request', {
        method: 'POST',
        body: JSON.stringify({ reason: deleteReason, feedback: deleteFeedback }),
      });
      setDeleteRequest(data);
      setShowDeleteModal(false);
      toast.success('Account deletion request submitted for administrative approval.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit request');
    } finally {
      setSubmittingDelete(false);
    }
  };

  const handleCancelDeleteRequest = async () => {
    const confirm = window.confirm(
      'Are you sure you want to cancel your account deletion request?',
    );
    if (!confirm) return;

    setCancellingDelete(true);
    try {
      await apiRequest('/auth/delete-request', {
        method: 'DELETE',
      });
      setDeleteRequest(null);
      toast.success('Account deletion request cancelled.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to cancel request');
    } finally {
      setCancellingDelete(false);
    }
  };

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

                {/* Danger Zone */}
                <div className="pt-6 border-t border-red-500/10 space-y-4">
                  <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <h5 className="text-xs font-semibold text-white">
                        Permanently Delete Account
                      </h5>
                      <p className="text-[10px] text-gray-500 max-w-md">
                        Once submitted, your profile deletion request will be routed to the
                        administrator. If approved, all your channels, campaigns, and data will be
                        permanently wiped.
                      </p>
                    </div>

                    {deleteRequest ? (
                      <div className="flex flex-col sm:items-end gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[9px] font-bold">
                          Pending Approval
                        </span>
                        <Button
                          onClick={handleCancelDeleteRequest}
                          disabled={cancellingDelete}
                          variant="secondary"
                          size="sm"
                          className="text-[10px] h-8 text-red-400 hover:text-red-300 border-red-500/10 hover:border-red-500/20 bg-red-500/5 hover:bg-red-500/10 cursor-pointer"
                        >
                          {cancellingDelete ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            'Cancel Request'
                          )}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => {
                          setDeleteReason('');
                          setDeleteFeedback('');
                          setConfirmDeleteCheck(false);
                          setShowDeleteModal(true);
                        }}
                        size="sm"
                        className="text-xs h-9 bg-red-500 hover:bg-red-600 border-0 text-white cursor-pointer font-bold"
                      >
                        Delete Account
                      </Button>
                    )}
                  </div>
                </div>
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
                      className="custom-select w-full"
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

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm cursor-pointer"
            onClick={() => setShowDeleteModal(false)}
          />

          {/* Dialog content */}
          <div className="w-full max-w-md bg-zinc-950 border border-white/10 p-6 rounded-2xl shadow-2xl z-10 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Request Account Deletion
            </h3>
            <p className="text-[10px] text-gray-500 leading-relaxed">
              We are sorry to see you go. Please let us know why you would like to delete your
              creator account. Your request will be reviewed by an administrator.
            </p>

            <form onSubmit={handleSubmitDeleteRequest} className="space-y-4">
              {/* Reason Dropdown */}
              <div className="space-y-1.5">
                <Label htmlFor="del-reason">Reason for leaving</Label>
                <select
                  id="del-reason"
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  className="custom-select w-full"
                  required
                >
                  <option value="" disabled className="bg-zinc-900 text-gray-500">
                    Select a reason...
                  </option>
                  <option value="Alternative Found" className="bg-zinc-900">
                    Found a better alternative
                  </option>
                  <option value="Too Difficult" className="bg-zinc-900">
                    Too complex / difficult to set up
                  </option>
                  <option value="No Longer Needed" className="bg-zinc-900">
                    No longer need Instagram automation
                  </option>
                  <option value="Privacy / Security" className="bg-zinc-900">
                    Privacy or security concerns
                  </option>
                  <option value="Other" className="bg-zinc-900">
                    Other reason
                  </option>
                </select>
              </div>

              {/* Feedback text area */}
              <div className="space-y-1.5">
                <Label htmlFor="del-feedback">Additional Comments</Label>
                <textarea
                  id="del-feedback"
                  value={deleteFeedback}
                  onChange={(e) => setDeleteFeedback(e.target.value)}
                  placeholder="Share any thoughts or suggestions..."
                  className="w-full h-20 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              {/* Confirmation checkbox */}
              <div className="flex items-start space-x-2.5 p-3 bg-red-500/5 rounded-xl border border-red-500/10">
                <input
                  id="del-confirm"
                  type="checkbox"
                  checked={confirmDeleteCheck}
                  onChange={(e) => setConfirmDeleteCheck(e.target.checked)}
                  className="h-4 w-4 mt-0.5 rounded border-white/10 bg-white/5 text-red-500 focus:ring-red-500 cursor-pointer"
                />
                <label
                  htmlFor="del-confirm"
                  className="text-[10px] text-gray-400 cursor-pointer leading-normal select-none"
                >
                  I understand that once the admin approves, all my campaigns, connected accounts,
                  and history will be permanently deleted.
                </label>
              </div>

              {/* Form buttons */}
              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowDeleteModal(false)}
                  className="text-xs h-9 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submittingDelete || !deleteReason || !confirmDeleteCheck}
                  className="text-xs h-9 bg-red-500 hover:bg-red-600 border-0 text-white cursor-pointer font-bold"
                >
                  {submittingDelete ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Submit Request'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
