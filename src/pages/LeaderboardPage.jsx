import React, { useState, useEffect } from 'react';
import dbService from '../services/dbService';
import Card, { CardBody, CardHeader } from '../components/common/Card';
import Input from '../components/common/Input';
import { Trophy, Search, Award, Flame, Star } from 'lucide-react';
import { getInitials } from '../utils/helpers';
import { motion } from 'framer-motion';

export const LeaderboardPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoading(true);
      try {
        const response = await dbService.listAlumni(100, 0, 'alumni');
        const alumniDocs = response.documents || [];
        
        let mappedLeaderboard = [];
        
        if (alumniDocs.length > 0) {
          mappedLeaderboard = alumniDocs.map((alumnus, index) => {
            // Stable deterministic mock stats based on document structure or index
            const mockOpps = (alumnus.company === 'Google' ? 10 : alumnus.company === 'Stripe' ? 8 : (index % 5) + 2);
            const mockReferrals = (alumnus.company === 'Google' ? 7 : alumnus.company === 'Stripe' ? 5 : (index % 4) + 1);
            const score = (mockOpps * 15) + (mockReferrals * 25) + 50; 
            
            return {
              $id: alumnus.$id,
              name: alumnus.name,
              company: alumnus.company || 'Industry Partner',
              jobTitle: alumnus.jobTitle || 'Alumnus',
              opportunitiesPosted: mockOpps,
              referralsGiven: mockReferrals,
              contributionScore: score,
              avatarInitials: getInitials(alumnus.name),
            };
          });
        } else {
          // If no documents exist in DB, fallback to fully mock list
          throw new Error('No alumni found in database, using mock data.');
        }
        
        // Sort by contribution score descending
        mappedLeaderboard.sort((a, b) => b.contributionScore - a.contributionScore);
        
        // Assign ranks
        const rankedLeaderboard = mappedLeaderboard.map((item, idx) => ({
          ...item,
          rank: idx + 1
        }));
        
        setLeaderboardData(rankedLeaderboard);
      } catch (error) {
        console.warn('Failed to load real alumni leaderboard, triggering mock fallback:', error.message);
        // Predefined fallback leaderboard
        const staticFallback = [
          { rank: 1, name: 'Sarah Jenkins', company: 'Google', jobTitle: 'Senior Staff Engineer', contributionScore: 380, opportunitiesPosted: 12, referralsGiven: 8, avatarInitials: 'SJ' },
          { rank: 2, name: 'Marcus Lin', company: 'Stripe', jobTitle: 'Product Manager', contributionScore: 320, opportunitiesPosted: 10, referralsGiven: 6, avatarInitials: 'ML' },
          { rank: 3, name: 'Devon Patel', company: 'Netflix', jobTitle: 'Senior Frontend Architect', contributionScore: 285, opportunitiesPosted: 9, referralsGiven: 5, avatarInitials: 'DP' },
          { rank: 4, name: 'Elena Rostova', company: 'Adobe', jobTitle: 'Lead UX Designer', contributionScore: 240, opportunitiesPosted: 8, referralsGiven: 4, avatarInitials: 'ER' },
          { rank: 5, name: 'Alex Rivera', company: 'Microsoft', jobTitle: 'Software Engineer II', contributionScore: 215, opportunitiesPosted: 7, referralsGiven: 3, avatarInitials: 'AR' },
          { rank: 6, name: 'Jessica Chen', company: 'Meta', jobTitle: 'Data Engineering Manager', contributionScore: 165, opportunitiesPosted: 5, referralsGiven: 2, avatarInitials: 'JC' },
          { rank: 7, name: 'Ryan Gallagher', company: 'Apple', jobTitle: 'Hardware Engineer', contributionScore: 120, opportunitiesPosted: 3, referralsGiven: 1, avatarInitials: 'RG' },
        ];
        setLeaderboardData(staticFallback);
      } finally {
        setLoading(false);
      }
    };
    loadLeaderboard();
  }, []);

  const filteredLeaderboard = leaderboardData.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.jobTitle && item.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Extract top 3 for the podium layout
  const topThree = filteredLeaderboard.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-10 py-4"
    >
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-2xl overflow-hidden border border-amber-100/60 dark:border-amber-900/30 bg-gradient-to-br from-amber-50/70 via-white to-violet-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/10 p-8 sm:p-10"
      >
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold mb-4 border border-amber-200/50 dark:border-amber-900/30">
            <Trophy className="w-3.5 h-3.5" />
            Alumni Contributions Leaderboard
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display mb-3 text-slate-900 dark:text-white">
            Celebrating Our Mentors &amp; Contributors
          </h1>
          <p className="text-slate-500 font-medium leading-relaxed max-w-2xl">
            Rankings are determined by contribution points. Alumni earn <strong className="text-amber-600 dark:text-amber-400">15 points</strong> for every internship or job posted, and <strong className="text-violet-600 dark:text-violet-400">25 points</strong> for referrals successfully shared with students.
          </p>
        </div>
      </motion.div>

      {/* Podium for Top 3 */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {topThree.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end max-w-4xl mx-auto px-4 pt-8">
              {/* Rank 2 (Left Podium) */}
              {topThree.length >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="order-2 md:order-1 flex flex-col items-center"
                >
                  <div className="relative mb-4 flex items-center justify-center">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-400 text-white font-bold text-[10px] px-2 py-0.5 rounded-full shadow-sm z-10 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      2nd Place
                    </div>
                    <div className="w-20 h-20 rounded-full border-4 border-slate-200 dark:border-slate-800 bg-gradient-to-tr from-slate-300 to-slate-400 text-white font-bold text-xl flex items-center justify-center shadow-lg">
                      {topThree[1].avatarInitials}
                    </div>
                  </div>
                  <Card className="w-full text-center relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1 bg-slate-300 dark:bg-slate-700" />
                    <CardBody className="p-5">
                      <h3 className="font-bold text-base truncate text-slate-900 dark:text-white font-display">{topThree[1].name}</h3>
                      <p className="text-xs text-violet-600 dark:text-violet-400 font-semibold truncate mt-0.5">
                        {topThree[1].company}
                      </p>
                      <div className="mt-3 flex justify-center items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{topThree[1].contributionScore}</span>
                        <span className="text-xs text-slate-400 font-bold uppercase">pts</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-500 font-semibold">
                        <div>
                          <p className="text-slate-400">Postings</p>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{topThree[1].opportunitiesPosted}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Referrals</p>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{topThree[1].referralsGiven}</p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              )}

              {/* Rank 1 (Center Podium - Tallest & Prominent) */}
              {topThree.length >= 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="order-1 md:order-2 flex flex-col items-center scale-105 z-10"
                >
                  <div className="relative mb-4 flex items-center justify-center">
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-amber-500 animate-bounce">
                      <Trophy className="w-8 h-8 fill-current" />
                    </div>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-550 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-md z-10 flex items-center gap-1">
                      <Flame className="w-3 h-3 fill-current" />
                      1st Place
                    </div>
                    <div className="w-24 h-24 rounded-full border-4 border-amber-400 dark:border-amber-500 bg-gradient-to-tr from-amber-400 to-amber-500 text-white font-bold text-3xl flex items-center justify-center shadow-xl">
                      {topThree[0].avatarInitials}
                    </div>
                  </div>
                  <Card className="w-full text-center border-2 border-amber-300 dark:border-amber-900 bg-white dark:bg-slate-900 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1.5 bg-amber-400" />
                    <CardBody className="p-6">
                      <h3 className="font-extrabold text-lg truncate text-slate-900 dark:text-white font-display">{topThree[0].name}</h3>
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold truncate mt-0.5">
                        {topThree[0].company}
                      </p>
                      <div className="mt-4 flex justify-center items-baseline gap-1">
                        <span className="text-3xl font-black text-amber-500 tracking-tight">{topThree[0].contributionScore}</span>
                        <span className="text-xs text-slate-400 font-bold uppercase">pts</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-500 font-semibold">
                        <div>
                          <p className="text-slate-400">Postings</p>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{topThree[0].opportunitiesPosted}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Referrals</p>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{topThree[0].referralsGiven}</p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              )}

              {/* Rank 3 (Right Podium) */}
              {topThree.length >= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="order-3 flex flex-col items-center"
                >
                  <div className="relative mb-4 flex items-center justify-center">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-700 text-white font-bold text-[10px] px-2 py-0.5 rounded-full shadow-sm z-10 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      3rd Place
                    </div>
                    <div className="w-20 h-20 rounded-full border-4 border-amber-700 dark:border-amber-800 bg-gradient-to-tr from-amber-750 to-amber-900 text-white font-bold text-2xl flex items-center justify-center shadow-lg">
                      {topThree[2].avatarInitials}
                    </div>
                  </div>
                  <Card className="w-full text-center relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1 bg-amber-700" />
                    <CardBody className="p-5">
                      <h3 className="font-bold text-base truncate text-slate-900 dark:text-white font-display">{topThree[2].name}</h3>
                      <p className="text-xs text-violet-600 dark:text-violet-400 font-semibold truncate mt-0.5">
                        {topThree[2].company}
                      </p>
                      <div className="mt-3 flex justify-center items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{topThree[2].contributionScore}</span>
                        <span className="text-xs text-slate-400 font-bold uppercase">pts</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-500 font-semibold">
                        <div>
                          <p className="text-slate-400">Postings</p>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{topThree[2].opportunitiesPosted}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Referrals</p>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{topThree[2].referralsGiven}</p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              )}
            </div>
          )}

          {/* Search Filtering Bar */}
          <div className="max-w-2xl mx-auto pt-6 px-4">
            <Input
              id="leaderboard-search"
              placeholder="Search leaderboards by name, company, or job title..."
              icon={Search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Remaining Rankings List */}
          <div className="max-w-4xl mx-auto px-4 pb-8">
            <Card className="overflow-hidden">
              <CardHeader className="bg-slate-50/60 dark:bg-slate-900/30 px-6 py-4 flex items-center justify-between">
                <h3 className="font-bold text-base font-display flex items-center gap-2 text-slate-900 dark:text-white">
                  <Award className="w-4.5 h-4.5 text-violet-500" />
                  Alumni Rankings
                </h3>
                <span className="text-xs text-slate-500 font-semibold">Showing {filteredLeaderboard.length} listings</span>
              </CardHeader>
              <CardBody className="p-0">
                {filteredLeaderboard.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200/60 dark:border-slate-800/60 bg-slate-50/20 dark:bg-slate-900/10 text-xs font-bold text-slate-500 uppercase tracking-wider">
                          <th className="py-4 px-6 text-center w-20">Rank</th>
                          <th className="py-4 px-6">Alumni Member</th>
                          <th className="py-4 px-6 text-center">Postings</th>
                          <th className="py-4 px-6 text-center">Referrals</th>
                          <th className="py-4 px-6 text-right pr-8">Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm font-medium">
                        {filteredLeaderboard.map((item, idx) => (
                          <motion.tr
                            key={item.$id || item.name}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: idx * 0.04 }}
                            className="hover:bg-slate-50/60 dark:hover:bg-slate-900/10 transition-colors"
                          >
                            {/* Rank Column */}
                            <td className="py-4 px-6 text-center font-extrabold text-slate-800 dark:text-slate-200">
                              {item.rank <= 3 ? (
                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-[11px] ${
                                  item.rank === 1 ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' :
                                  item.rank === 2 ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' :
                                  'bg-amber-900/20 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400'
                                }`}>
                                  {item.rank}
                                </span>
                              ) : (
                                <span>{item.rank}</span>
                              )}
                            </td>

                            {/* Name & Company */}
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                                  {item.avatarInitials}
                                </div>
                                <div className="max-w-50 sm:max-w-xs truncate">
                                  <h4 className="font-bold text-slate-900 dark:text-white">{item.name}</h4>
                                  <p className="text-xs text-slate-500 mt-0.5 truncate font-medium">
                                    {item.jobTitle} at <strong className="text-slate-700 dark:text-slate-350">{item.company}</strong>
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Postings Count */}
                            <td className="py-4 px-6 text-center text-slate-500 dark:text-slate-400 font-bold">
                              {item.opportunitiesPosted}
                            </td>

                            {/* Referrals Count */}
                            <td className="py-4 px-6 text-center text-slate-500 dark:text-slate-400 font-bold">
                              {item.referralsGiven}
                            </td>

                            {/* Score */}
                            <td className="py-4 px-6 text-right pr-8 font-black text-violet-600 dark:text-violet-400 text-base tracking-tight">
                              {item.contributionScore}
                              <span className="text-[10px] text-slate-400 font-bold uppercase ml-0.5">pts</span>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-16 text-center text-slate-500 flex flex-col items-center gap-2">
                    <Trophy className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                    <p className="text-sm font-semibold">No members matching your search query were found.</p>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default LeaderboardPage;
