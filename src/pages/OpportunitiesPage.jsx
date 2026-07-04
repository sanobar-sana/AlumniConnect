import React, { useState, useEffect } from 'react';
import dbService from '../services/dbService';
import useAuth from '../hooks/useAuth';
import Card, { CardBody, CardHeader } from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { Search, Briefcase, Plus, MapPin, Calendar, Clock, DollarSign, ArrowUpRight } from 'lucide-react';
import { formatDate } from '../utils/helpers';

export const OpportunitiesPage = () => {
  const { user, profile } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [newOpp, setNewOpp] = useState({
    title: '',
    company: '',
    location: '',
    type: 'job', // 'job', 'internship', 'mentorship'
    description: '',
    salary: '',
    link: ''
  });

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const response = await dbService.listOpportunities(50, 0);
      setOpportunities(response.documents);
    } catch (error) {
      console.error('Failed to load opportunities:', error);
      // Fallback mocks
      setOpportunities([
        { $id: 'mock_opp1', title: 'Software Engineer Intern (Fall 2026)', company: 'Google', location: 'Sunnyvale, CA (Hybrid)', type: 'internship', description: 'Join the Google Cloud developer relations team. Looking for sophomore or junior CS students with React & Node experience.', salary: '$45 - $60 / hr', link: 'https://careers.google.com', createdAt: new Date().toISOString() },
        { $id: 'mock_opp2', title: 'Junior Data Analyst', company: 'Stripe', location: 'New York, NY', type: 'job', description: 'Analyze payments ledger metrics, manage dashboard reporting, and write clean SQL pipelines. Experience with Python is a plus.', salary: '$95k - $120k / yr', link: 'https://stripe.com/jobs', createdAt: new Date(Date.now() - 86400000).toISOString() },
        { $id: 'mock_opp3', title: 'UX Research Mentorship Program', company: 'Adobe', location: 'Remote', type: 'mentorship', description: '3-month mentoring project guiding students through user testing practices, research frameworks, and wireframing.', salary: 'Unpaid (Mentoring)', link: '', createdAt: new Date(Date.now() - 172800000).toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const opportunityData = {
        title: newOpp.title,
        company: newOpp.company,
        location: newOpp.location,
        type: newOpp.type,
        description: newOpp.description,
        salary: newOpp.salary,
        link: newOpp.link,
        createdAt: new Date().toISOString(),
      };

      await dbService.createOpportunity(opportunityData);
      
      // Reset form
      setNewOpp({
        title: '',
        company: '',
        location: '',
        type: 'job',
        description: '',
        salary: '',
        link: ''
      });
      setShowAddForm(false);
      fetchOpportunities();
    } catch (error) {
      console.error(error);
      // Simulated add for mock list support
      setOpportunities((prev) => [
        {
          $id: 'mock_added_' + Date.now(),
          ...newOpp,
          posterName: profile?.name || user?.name || 'Alumnus',
          createdAt: new Date().toISOString()
        },
        ...prev
      ]);
      setShowAddForm(false);
    }
  };

  const filteredOpps = opportunities.filter((opp) => {
    const matchesSearch =
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = !filterType || opp.type === filterType;

    return matchesSearch && matchesType;
  });

  const getBadgeStyles = (type) => {
    switch (type) {
      case 'job':
        return 'bg-violet-100 text-violet-900 font-bold border border-violet-200 dark:bg-violet-950/45 dark:text-violet-400';
      case 'internship':
        return 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-200 dark:bg-emerald-950/45 dark:text-emerald-400';
      case 'mentorship':
        return 'bg-pink-100 text-pink-900 font-bold border border-pink-200 dark:bg-pink-950/45 dark:text-pink-400';
      default:
        return 'bg-zinc-100 text-zinc-900 font-bold border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400';
    }
  };

  const isAlumni = profile?.role === 'alumni';

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-display mb-1 text-blue-500">Opportunities Board</h2>
          <p className="text-gray-700 dark:text-gray-300">Discover exclusive jobs, internships, and mentoring projects shared by our alumni.</p>
        </div>
        {isAlumni && (
          <Button
            variant={showAddForm ? 'secondary' : 'primary'}
            icon={showAddForm ? null : Plus}
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Cancel' : 'Post Opportunity'}
          </Button>
        )}
      </div>

      {/* Add Opportunity Form (Accordion) */}
      {showAddForm && (
        <Card className="border border-zinc-200 dark:border-zinc-800 max-w-2xl">
          <CardHeader>
            <h3 className="font-bold text-lg">Post a New Opportunity</h3>
          </CardHeader>
          <form onSubmit={handleCreate}>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-900">
                <Input
                  label="Role Title"
                  id="title"
                  placeholder="e.g. Software Engineer Intern"
                  required
                  value={newOpp.title}
                  onChange={(e) => setNewOpp({ ...newOpp, title: e.target.value })}
                />
                <Input
                  label="Company Name"
                  id="company"
                  placeholder="e.g. Google"
                  required
                  value={newOpp.company}
                  onChange={(e) => setNewOpp({ ...newOpp, company: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Location"
                  id="location"
                  placeholder="e.g. New York, NY (Remote)"
                  required
                  value={newOpp.location}
                  onChange={(e) => setNewOpp({ ...newOpp, location: e.target.value })}
                />
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="type" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Opportunity Type
                  </label>
                  <select
                    id="type"
                    className="w-full h-11.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                    value={newOpp.type}
                    onChange={(e) => setNewOpp({ ...newOpp, type: e.target.value })}
                  >
                    <option value="job">Job</option>
                    <option value="internship">Internship</option>
                    <option value="mentorship">Mentorship</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Salary Range / Compensation"
                  id="salary"
                  placeholder="e.g. $45/hr or $110k/yr"
                  value={newOpp.salary}
                  onChange={(e) => setNewOpp({ ...newOpp, salary: e.target.value })}
                />
                <Input
                  label="Application Link (optional)"
                  id="link"
                  placeholder="e.g. https://careers.company.com"
                  value={newOpp.link}
                  onChange={(e) => setNewOpp({ ...newOpp, link: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="description" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={4}
                  placeholder="Provide role responsibilities, eligibility criteria, and how students should apply..."
                  required
                  className="block w-full rounded-lg border border-zinc-200 dark:border-zinc-800 text-sm p-3 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  value={newOpp.description}
                  onChange={(e) => setNewOpp({ ...newOpp, description: e.target.value })}
                />
              </div>
            </CardBody>
            <div className="px-6 py-4 border-t border-zinc-150 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-b-xl flex justify-end gap-3">
              <Button type="submit" variant="primary">
                Publish Listing
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            id="opp-search"
            placeholder="Search by keyword, company, or technology..."
            icon={Search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-56">
          <select
            className="w-full h-11.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="job">Jobs</option>
            <option value="internship">Internships</option>
            <option value="mentorship">Mentorship</option>
          </select>
        </div>
      </div>

      {/* Listings Column */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredOpps.length > 0 ? (
        <div className="space-y-6">
          {filteredOpps.map((opp) => (
            <Card key={opp.$id} className="border border-zinc-200 dark:border-zinc-800 relative hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
              <CardBody className="p-6 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${getBadgeStyles(opp.type)}`}>
                        {opp.type}
                      </span>
                      <span className="text-xs text-zinc-450 dark:text-zinc-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Posted {formatDate(opp.createdAt)}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold font-display mt-2 text-zinc-900 dark:text-zinc-50">{opp.title}</h3>
                    <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">{opp.company}</p>
                  </div>
                  {opp.link && (
                    <a
                      href={opp.link}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 w-full sm:w-auto"
                    >
                      <Button variant="outline" size="sm" icon={ArrowUpRight}>
                        Apply
                      </Button>
                    </a>
                  )}
                </div>

                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed max-w-4xl">
                  {opp.description}
                </p>

                <hr className="border-zinc-100 dark:border-zinc-800" />

                <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    <span>{opp.location}</span>
                  </div>
                  {opp.salary && (
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      <span>{opp.salary}</span>
                    </div>
                  )}
                  {opp.posterName && (
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      <span>Referral contact: <strong>{opp.posterName}</strong></span>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <div className="glass-card text-center p-12 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <p className="text-gray-700 dark:text-gray-300">No opportunities matching your query were found.</p>
        </div>
      )}
    </div>
  );
};

export default OpportunitiesPage;
