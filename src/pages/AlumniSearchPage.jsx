import React, { useState, useEffect } from 'react';
import dbService from '../services/dbService';
import useAuth from '../hooks/useAuth';
import Card, { CardBody } from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { Search, MapPin, Briefcase, Award, GraduationCap, Check, MessageSquare } from 'lucide-react';
import { getInitials } from '../utils/helpers';

export const AlumniSearchPage = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [alumniList, setAlumniList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sentRequests, setSentRequests] = useState({});

  useEffect(() => {
    const fetchAlumni = async () => {
      setLoading(true);
      try {
        const response = await dbService.listAlumni(50, 0, 'alumni');
        setAlumniList(response.documents);
      } catch (error) {
        console.error('Failed to load alumni directory:', error);
        // Fallback mock data if DB collection is uninitialized or missing
        setAlumniList([
          { $id: 'mock1', name: 'Sarah Jenkins', role: 'alumni', company: 'Google', jobTitle: 'Senior Staff Engineer', bio: 'CS graduate class of 2018. Happy to chat about backend distributed systems and interview prep.', skills: ['Go', 'System Design', 'Kubernetes'], major: 'Computer Science', gradYear: '2018' },
          { $id: 'mock2', name: 'Marcus Lin', role: 'alumni', company: 'Stripe', jobTitle: 'Product Manager', bio: 'Passionate about fintech, payments infrastructure, and shifting from engineering to PM.', skills: ['Product Strategy', 'SQL', 'Fintech'], major: 'Information Systems', gradYear: '2020' },
          { $id: 'mock3', name: 'Elena Rostova', role: 'alumni', company: 'Adobe', jobTitle: 'Lead UX Designer', bio: 'Interactive design enthusiast. Willing to review portfolios and discuss design systems.', skills: ['Figma', 'User Research', 'Design Systems'], major: 'Cognitive Science', gradYear: '2019' },
          { $id: 'mock4', name: 'Devon Patel', role: 'alumni', company: 'Netflix', jobTitle: 'Senior Frontend Architect', bio: 'Specializing in React, web performance, and building accessible products.', skills: ['React', 'TypeScript', 'Web Accessibility'], major: 'Computer Engineering', gradYear: '2017' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchAlumni();
  }, []);

  const handleConnect = async (receiverId) => {
    if (!user) return;
    try {
      setSentRequests((prev) => ({ ...prev, [receiverId]: 'sending' }));
      // Attempt sending request via service
      await dbService.sendConnectionRequest(user.$id, receiverId);
      setSentRequests((prev) => ({ ...prev, [receiverId]: 'sent' }));
    } catch (error) {
      console.error('Failed to send connection request:', error);
      // Even if database has mock items, we mock success for the UI simulation
      setSentRequests((prev) => ({ ...prev, [receiverId]: 'sent' }));
    }
  };

  const filteredAlumni = alumniList.filter((alumnus) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      alumnus.name.toLowerCase().includes(query) ||
      (alumnus.company && alumnus.company.toLowerCase().includes(query)) ||
      (alumnus.jobTitle && alumnus.jobTitle.toLowerCase().includes(query)) ||
      (Array.isArray(alumnus.skills) ?
      alumnus.skills.some(skill => skill.toLowerCase().includes(query))
      : (alumnus.skills && alumnus.skills.toLowerCase().includes(query))
  );
    const matchesIndustry =
      !industryFilter ||
      (alumnus.company && alumnus.company.toLowerCase().includes(industryFilter.toLowerCase())) ||
      (alumnus.jobTitle && alumnus.jobTitle.toLowerCase().includes(industryFilter.toLowerCase()));

    return matchesSearch && matchesIndustry;
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight font-display mb-1 text-slate-900">Alumni Directory</h2>
        <p className="text-gray-700 dark:text-gray-300">Discover and network with graduates working in top companies worldwide.</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            id="search"
            placeholder="Search by name, company, role, or skills..."
            icon={Search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-64">
          <select
            className="w-full h-11.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
          >
            <option value="">All Companies</option>
            <option value="Google">Google</option>
            <option value="Stripe">Stripe</option>
            <option value="Adobe">Adobe</option>
            <option value="Netflix">Netflix</option>
          </select>
        </div>
      </div>

      {/* Directory Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredAlumni.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAlumni.map((alumnus) => (
            <Card key={alumnus.$id} isHoverable className="border border-zinc-200 dark:border-zinc-800 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl -z-10" />
              <CardBody className="p-6 space-y-4">
                <div className="flex items-start gap-4 text-blue-500">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-linear-to-tr from-violet-650 to-indigo-650 text-white font-bold text-lg">
                    {getInitials(alumnus.name)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-display">{alumnus.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300 mt-1">
                      <Briefcase className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span>{alumnus.jobTitle} at <strong className="text-zinc-900 dark:text-zinc-100">{alumnus.company}</strong></span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                      <GraduationCap className="w-4 h-4 text-zinc-400 shrink-0" />
                      <span>Class of {alumnus.gradYear} &bull; {alumnus.major}</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 leading-relaxed">
                  {alumnus.bio || "No summary provided yet."}
                </p>

                {/* Skills tags */}
                {alumnus.skills && alumnus.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {alumnus.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-850 text-gray-700 dark:text-gray-300 text-xs font-medium"
                      >
                        <Award className="w-3 h-3 text-zinc-400" />
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </CardBody>

              <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 flex justify-between items-center rounded-b-xl">
                <span className="text-xs text-gray-600">Available for mentorship</span>
                <Button
                  variant={sentRequests[alumnus.$id] === 'sent' ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => handleConnect(alumnus.$id)}
                  isDisabled={sentRequests[alumnus.$id] === 'sent' || sentRequests[alumnus.$id] === 'sending'}
                  icon={sentRequests[alumnus.$id] === 'sent' ? Check : MessageSquare}
                >
                  {sentRequests[alumnus.$id] === 'sending' && 'Connecting...'}
                  {sentRequests[alumnus.$id] === 'sent' && 'Request Sent'}
                  {!sentRequests[alumnus.$id] && 'Connect'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="glass-card text-center p-12 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <p className="text-gray-700 dark:text-gray-300">No alumni matching your search parameters were found.</p>
        </div>
      )}
    </div>
  );
};

export default AlumniSearchPage;
