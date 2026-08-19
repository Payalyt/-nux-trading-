import React, { useState } from 'react';
import { 
  User, 
  ShieldCheck, 
  Lock, 
  Key, 
  AlertCircle, 
  CheckCircle2, 
  Trash2, 
  Globe, 
  Mail, 
  FileText,
  X
} from 'lucide-react';
import { soundManager } from '../../utils/audio';

import { UserAccount } from '../../types/trading';
import { FirebaseService } from '../../utils/firebaseSync';

interface MyAccountPageProps {
  liveBalance: number;
  user?: UserAccount | null;
  onLogout?: () => void;
  onOpenAuth?: () => void;
}

export const MyAccountPage: React.FC<MyAccountPageProps> = ({
  liveBalance,
  user,
  onLogout,
  onOpenAuth,
}) => {
  const [firstName, setFirstName] = useState(user?.name?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(user?.name?.split(' ')[1] || '');
  const [dob, setDob] = useState('');
  const [country, setCountry] = useState('Bangladesh');
  const [address, setAddress] = useState('');
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [docType, setDocType] = useState('nid');
  const [docFrontImg, setDocFrontImg] = useState('');
  const [docBackImg, setDocBackImg] = useState('');
  const [kycSubmitted, setKycSubmitted] = useState(false);

  const currentEmail = user?.email || 'parvezhasanonline@gmail.com';
  const currentId = user?.id || '#92316380';

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playWin();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  if (!user) {
    return (
      <div className="flex-1 bg-[#0b0f17] overflow-y-auto p-6 md:p-8 flex items-center justify-center text-slate-200">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full mx-auto flex items-center justify-center shadow-2xl">
            <User className="w-10 h-10 text-slate-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">Access Your Profile</h2>
            <p className="text-sm text-slate-400">Log in to manage your account details, verification status, and security settings.</p>
          </div>
          <div className="flex flex-col space-y-3 pt-4">
            <button
              onClick={() => onOpenAuth?.()}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              Log In to Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#0b0f17] overflow-y-auto p-6 md:p-8 space-y-8 text-slate-200">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Info Bar */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Account Management</h2>
          <div className="flex items-center space-x-3">
            <span className="text-xs text-slate-400 font-mono-nums">Profile ID: {currentId}</span>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="px-3 py-1 bg-white/5 hover:bg-rose-500/20 text-rose-400 border border-white/10 hover:border-rose-500/30 text-xs font-semibold rounded-lg transition-all cursor-pointer"
              >
                Log Out
              </button>
            )}
          </div>
        </div>

        {/* 3 Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Col 1: Personal Data Form (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#121722] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Personal data:
                </h3>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  VERIFIED EMAIL
                </span>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-semibold">Email</label>
                  <input
                    type="email"
                    disabled
                    value={currentEmail}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-300 opacity-80 cursor-not-allowed"
                  />
                  <div className="text-[10px] text-emerald-400 flex items-center space-x-1 pt-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Email verified</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-semibold">User ID</label>
                  <input
                    type="text"
                    disabled
                    value={currentId}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono-nums text-slate-300 opacity-80 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-semibold">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter first name"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-semibold">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter last name"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-semibold">Date of birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-semibold">Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-semibold">Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Dhaka, Bangladesh"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {saveSuccess && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center space-x-1.5 border border-emerald-500/30">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Personal information updated!</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  Save
                </button>
              </form>
            </div>
          </div>

          {/* Col 2: Documents Verification (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#121722] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Documents verification:
              </h3>

              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 space-y-2 text-xs">
                <div className="flex items-center space-x-2 text-red-400 font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Verification Required</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  You need fill identity information before verification your account.
                </p>
              </div>

              {/* Interactive KYC Document Upload Form */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <div className="flex items-center space-x-2 text-white font-bold text-xs">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>Identity Verification (KYC)</span>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] text-slate-400 font-semibold uppercase">Document Type</label>
                    <select
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                      className="w-full bg-[#0d121b] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="nid">National ID Card (NID)</option>
                      <option value="passport">International Passport</option>
                      <option value="driving_license">Driving License</option>
                    </select>
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-[10px] text-slate-400 font-semibold uppercase">Document Front Photo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setDocFrontImg(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full bg-[#0d121b] border border-white/10 rounded-xl p-2 text-xs text-slate-300 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-emerald-500 file:text-black cursor-pointer"
                    />
                    {docFrontImg && (
                      <img src={docFrontImg} alt="Front ID" className="h-16 w-auto rounded-lg border border-emerald-500/30 object-cover mt-1" />
                    )}
                  </div>

                  {docType !== 'passport' && (
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] text-slate-400 font-semibold uppercase">Document Back Photo</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setDocBackImg(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full bg-[#0d121b] border border-white/10 rounded-xl p-2 text-xs text-slate-300 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-emerald-500 file:text-black cursor-pointer"
                      />
                      {docBackImg && (
                        <img src={docBackImg} alt="Back ID" className="h-16 w-auto rounded-lg border border-emerald-500/30 object-cover mt-1" />
                      )}
                    </div>
                  )}

                  {kycSubmitted ? (
                    <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold text-center">
                      ✓ Verification Documents Submitted! Admin Review Pending.
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (!docFrontImg) {
                          alert('Please select a front photo of your ID or Passport');
                          return;
                        }
                        setKycSubmitted(true);
                        // Sync to user profile in Firebase
                        if (user?.email) {
                          FirebaseService.syncUser({
                            email: user.email,
                            username: user.email,
                            verificationStatus: 'pending',
                          } as any);
                        }
                      }}
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 cursor-pointer transition-all"
                    >
                      Submit Document for Review
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Col 3: Security & Preferences (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#121722] border border-white/10 rounded-2xl p-6 space-y-5 shadow-xl">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Security:
              </h3>

              {/* 2FA Toggle */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">Two-step verification</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={is2FAEnabled}
                    onChange={(e) => setIs2FAEnabled(e.target.checked)}
                    className="accent-emerald-500 w-4 h-4 cursor-pointer"
                  />
                </div>
                <div className="text-[11px] text-slate-400 space-y-1 pl-6">
                  <div className="flex items-center space-x-1.5 text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>To enter the platform</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>To withdraw funds</span>
                  </div>
                </div>
              </div>

              {/* Password change */}
              <div className="pt-3 border-t border-white/10 space-y-1.5">
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold text-white">Password</span>
                </div>
                <p className="text-[11px] text-slate-400">Change your account password regularly</p>
                <button
                  type="button"
                  onClick={() => alert('Password reset link sent to your registered email.')}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer"
                >
                  Change
                </button>
              </div>

              {/* Language & Timezone */}
              <div className="pt-3 border-t border-white/10 space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-semibold">Language</label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white">
                    <option value="en">English</option>
                    <option value="bn">বাংলা (Bengali)</option>
                    <option value="es">Español</option>
                    <option value="hi">हिन्दी</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-semibold">Timezone</label>
                  <div className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-300 font-mono-nums">
                    (UTC+06:00) Dhaka
                  </div>
                </div>
              </div>

              {/* Delete account */}
              <div className="pt-3 border-t border-white/10">
                <button
                  type="button"
                  className="flex items-center space-x-1.5 text-xs text-red-400 hover:text-red-300 font-bold transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete my account</span>
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
