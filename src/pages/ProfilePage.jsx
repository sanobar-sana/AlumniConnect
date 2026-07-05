import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import Card, { CardBody, CardHeader, CardFooter } from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { User, Briefcase, FileText, Check, AlertCircle, Award, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

export const ProfilePage = () => {
  const { profile, updateUserProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    skills: '',
    company: '',
    jobTitle: '',
    major: '',
    gradYear: '',
  });

  const [message, setMessage] = useState({ text: '', type: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Sync profile details into form state
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        bio: profile.bio || '',
        skills: Array.isArray(profile.skills) ? profile.skills.join(', ') : '',
        company: profile.company || '',
        jobTitle: profile.jobTitle || '',
        major: profile.major || profile.department || '',
        gradYear: profile.gradYear || '',
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ text: '', type: '' });

    // Parse comma-separated skills to string array
    const skillsArray = formData.skills
      ? formData.skills.split(',').map((skill) => skill.trim()).filter((skill) => skill.length > 0)
      : [];

    try {
      await updateUserProfile({
        name: formData.name,
        bio: formData.bio,
        skills: skillsArray,
        company: formData.company,
        jobTitle: formData.jobTitle,
        major: formData.major,
        gradYear: formData.gradYear,
      });
      setMessage({ text: 'Profile successfully updated!', type: 'success' });
    } catch (err) {
      console.error(err);
      setMessage({ text: err.message || 'Failed to update profile.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const isAlumni = profile?.role === 'alumni';

  const initials = formData.name
    ? formData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight font-display mb-1 text-slate-900 dark:text-white">My Profile</h2>
        <p className="text-slate-500 font-medium">Manage your educational information, career summary, and expertise.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* ── Left Avatar Column ── */}
        <div className="md:col-span-1 space-y-5">
          <Card>
            {/* Gradient banner strip */}
            <div className="h-16 w-full bg-gradient-to-r from-violet-500 via-indigo-500 to-pink-500 rounded-t-2xl" />
            <CardBody className="pt-0 pb-7 px-6 text-center">
              {/* Avatar (overlaps banner) */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center mx-auto -mt-10 shadow-lg ring-4 ring-white dark:ring-slate-900">
                {initials}
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white mt-3">{formData.name || 'Anonymous User'}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5 uppercase tracking-widest font-bold">
                {isAlumni ? 'Alumni Partner' : 'Student Member'}
              </p>
              <div className="mt-5 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-600 dark:text-slate-400 text-left space-y-2 border border-slate-100 dark:border-slate-800">
                <p><span className="font-bold text-slate-700 dark:text-slate-300">Email:</span> {profile?.email}</p>
                <p className="truncate"><span className="font-bold text-slate-700 dark:text-slate-300">Member ID:</span> {profile?.$id}</p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* ── Right Form Fields ── */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h3 className="font-bold text-base font-display flex items-center gap-2 text-slate-900 dark:text-white">
                <User className="w-4.5 h-4.5 text-violet-500" />
                Profile Information
              </h3>
            </CardHeader>
            <CardBody className="space-y-4">
              {/* Status message */}
              {message.text && (
                <div
                  className={`flex items-start gap-2.5 p-3.5 rounded-xl text-sm font-medium border ${
                    message.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-900/30'
                      : 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-rose-900/30'
                  }`}
                >
                  {message.type === 'success' ? (
                    <Check className="w-4 h-4 mt-0.5 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  )}
                  <span>{message.text}</span>
                </div>
              )}

              <Input
                label="Full Name"
                id="name"
                required
                icon={User}
                value={formData.name}
                onChange={handleChange}
              />

              <div className="flex flex-col gap-1.5">
                <label htmlFor="bio" className="text-xs font-semibold text-slate-600 dark:text-slate-400 tracking-wide">
                  Biography / Summary
                </label>
                <textarea
                  id="bio"
                  rows={3}
                  placeholder="Share a brief overview of your background, interests, and aspirations..."
                  className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 text-sm p-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/15 focus:border-violet-500 dark:focus:border-violet-400 transition-all font-medium leading-relaxed"
                  value={formData.bio}
                  onChange={handleChange}
                />
              </div>

              <Input
                label="Skills (Comma-separated)"
                id="skills"
                placeholder="React, Node.js, Python, Public Speaking"
                icon={Award}
                value={formData.skills}
                onChange={handleChange}
              />

              {/* Conditional fields based on roles */}
              {isAlumni ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Current Company"
                    id="company"
                    placeholder="Tech Corp"
                    icon={Briefcase}
                    value={formData.company}
                    onChange={handleChange}
                  />
                  <Input
                    label="Job Title"
                    id="jobTitle"
                    placeholder="Senior Developer"
                    icon={Briefcase}
                    value={formData.jobTitle}
                    onChange={handleChange}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="University Major"
                    id="major"
                    placeholder="Computer Science"
                    icon={GraduationCap}
                    value={formData.major}
                    onChange={handleChange}
                  />
                  <Input
                    label="Graduation Year"
                    id="gradYear"
                    placeholder="2027"
                    icon={GraduationCap}
                    value={formData.gradYear}
                    onChange={handleChange}
                  />
                </div>
              )}
            </CardBody>
            <CardFooter className="flex justify-end gap-3">
              <Button type="submit" variant="primary" isLoading={isSaving}>
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </motion.div>
  );
};

export default ProfilePage;
