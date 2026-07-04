import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import Card, { CardBody, CardHeader, CardFooter } from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { User, Briefcase, FileText, Check, AlertCircle, Award, GraduationCap } from 'lucide-react';

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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight font-display mb-1">My Profile</h2>
        <p className="text-gray-700 dark:text-gray-300">Manage your educational information, career summary, and expertise.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Avatar Column */}
        <div className="md:col-span-1 space-y-6">
          <Card className="border border-zinc-200 dark:border-zinc-800 text-center">
            <CardBody className="py-8">
              <div className="w-24 h-24 rounded-full bg-linear-to-tr from-violet-600 to-indigo-600 text-white font-bold text-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-600/10">
                {formData.name ? formData.name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) : '?'}
              </div>
              <h3 className="font-bold text-lg">{formData.name || 'Anonymous User'}</h3>
              <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">
                {isAlumni ? 'Alumni Partner' : 'Student Member'}
              </p>
              <div className="mt-4 p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg text-xs text-gray-700 dark:text-gray-300 text-left space-y-2 border border-zinc-100 dark:border-zinc-800">
                <p><strong>Email:</strong> {profile?.email}</p>
                <p><strong>Member ID:</strong> {profile?.$id}</p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Form Fields */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border border-zinc-200 dark:border-zinc-800">
            <CardHeader>
              <h3 className="font-bold text-lg font-display flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-500" />
                Profile Information
              </h3>
            </CardHeader>
            <CardBody className="space-y-4">
              {message.text && (
                <div
                  className={`flex items-start gap-2.5 p-3 rounded-lg text-sm border ${
                    message.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/30'
                      : 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 border-rose-200/50 dark:border-rose-900/30'
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
                <label htmlFor="bio" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Biography / Summary
                </label>
                <textarea
                  id="bio"
                  rows={3}
                  placeholder="Share a brief overview of your background, interests, and aspirations..."
                  className="block w-full rounded-lg border border-zinc-200 dark:border-zinc-800 text-sm p-3 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
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
    </div>
  );
};

export default ProfilePage;
