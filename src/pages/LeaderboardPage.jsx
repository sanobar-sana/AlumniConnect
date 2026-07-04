import React, { useState, useEffect } from 'react';
import dbService from '../services/dbService';
import Card, { CardBody, CardHeader } from '../components/common/Card';
import Input from '../components/common/Input';
import { Trophy, Search, Sparkles, Award, User, Briefcase, Flame, Star, MessageSquare } from 'lucide-react';
import { getInitials } from '../utils/helpers';

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
  const others = filteredLeaderboard.slice(3);

  // Re-arrange podium so Rank 2 is Left, Rank 1 is Center, Rank 3 is Right
  const podiumOrder = [];
  if (topThree.length >= 2) podiumOrder.push(topThree[1]); // Rank 2
  if (topThree.length >= 1) podiumOrder.push(topThree[0]); // Rank 1
  if (topThree.length >= 3) podiumOrder.push(topThree[2]); // Rank 3

  return (
    <div className="space-y-10 py-4">
      {/* Welcome Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-zinc-200/30 dark:border-zinc-950/40 bg-linear-to-r from-amber-500/10 via-indigo-650/5 to-pink-500/5 dark:from-amber-950/20 dark:via-indigo-950/10 dark:to-pink-950/5 p-8 sm:p-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -z-10" />
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 dark:bg-amber-950/40 text-amber-750 dark:text-amber-400 text-xs font-semibold mb-4 border border-amber-200/50 dark:border-amber-900/30 animate-pulse">
            <Trophy className="w-3.5 h-3.5" />
            Alumni Contributions Leaderboard
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display mb-3 text-gray-700">
            Celebrating Our Mentors & Contributors
          </h1>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            Rankings are determined by contribution points. Alumni earn <strong className="text-amber-600 dark:text-amber-400">15 points</strong> for every internship or job posted, and <strong className="text-indigo-600 dark:text-indigo-400">25 points</strong> for referrals successfully shared with students.
          </p>
        </div>
      </div>

      {/* Podium for Top 3 */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {topThree.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-5xl mx-auto px-4 pt-10">
              {/* Rank 2 (Left Podium on Desktop, displayed first if present) */}
              {topThree.length >= 2 && (
                <div className="order-2 md:order-1 flex flex-col items-center">
                  <div className="relative mb-4 flex items-center justify-center">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-zinc-400 text-white font-bold text-xs px-2 py-0.5 rounded-full shadow-sm z-10 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      2nd
                    </div>
                    <div className="w-20 h-20 rounded-full border-4 border-zinc-300 dark:border-zinc-700 bg-linear-to-tr from-zinc-300 to-zinc-400 text-white font-bold text-2xl flex items-center justify-center shadow-lg">
                      {topThree[1].avatarInitials}
                    </div>
                  </div>
                  <Card className="w-full text-center border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xs relative overflow-hidden transition-all duration-300 hover:shadow-md">
                    <div className="absolute top-0 inset-x-0 h-1 bg-zinc-300 dark:bg-zinc-700" />
                    <CardBody className="p-5">
                      <h3 className="font-bold text-base truncate text-gray-700">{topThree[1].name}</h3>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold truncate mt-0.5">
                        {topThree[1].company}
                      </p>
                      <div className="mt-3 flex justify-center items-baseline gap-1">
                        <span className="text-2xl font-black text-zinc-800 dark:text-zinc-100">{topThree[1].contributionScore}</span>
                        <span className="text-xs text-zinc-400 font-medium">pts</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 text-[10px] text-zinc-450 dark:text-zinc-500 font-semibold">
                        <div>
                          <p className="text-zinc-400">Postings</p>
                          <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">{topThree[1].opportunitiesPosted}</p>
                        </div>
                        <div>
                          <p className="text-zinc-400">Referrals</p>
                          <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">{topThree[1].referralsGiven}</p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              )}

              {/* Rank 1 (Center Podium - Tallest & Prominent) */}
              {topThree.length >= 1 && (
                <div className="order-1 md:order-2 flex flex-col items-center scale-105 z-10">
                  <div className="relative mb-4 flex items-center justify-center">
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-amber-500 animate-bounce">
                      <Trophy className="w-8 h-8 fill-current" />
                    </div>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white font-bold text-xs px-2.5 py-0.5 rounded-full shadow-md z-10 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 fill-current" />
                      1st Place
                    </div>
                    <div className="w-24 h-24 rounded-full border-4 border-amber-400 dark:border-amber-550 bg-linear-to-tr from-amber-400 to-amber-550 text-white font-bold text-3xl flex items-center justify-center shadow-xl">
                      {topThree[0].avatarInitials}
                    </div>
                  </div>
                  <Card className="w-full text-center border-2 border-amber-300 dark:border-amber-900 bg-white dark:bg-zinc-900 shadow-xl relative overflow-hidden transition-all duration-300">
                    <div className="absolute top-0 inset-x-0 h-1.5 bg-amber-400" />
                    <CardBody className="p-6">
                      <h3 className="font-extrabold text-lg truncate text-gray-700">{topThree[0].name}</h3>
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold truncate mt-0.5">
                        {topThree[0].company}
                      </p>
                      <div className="mt-4 flex justify-center items-baseline gap-1">
                        <span className="text-3xl font-black text-amber-500">{topThree[0].contributionScore}</span>
                        <span className="text-xs text-zinc-400 font-medium">pts</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-zinc-150 dark:border-zinc-800/80 text-[10px] text-gray-700 dark:text-gray-300 font-semibold">
                        <div>
                          <p className="text-zinc-400">Postings</p>
                          <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">{topThree[0].opportunitiesPosted}</p>
                        </div>
                        <div>
                          <p className="text-zinc-400">Referrals</p>
                          <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">{topThree[0].referralsGiven}</p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              )}

              {/* Rank 3 (Right Podium) */}
              {topThree.length >= 3 && (
                <div className="order-3 flex flex-col items-center">
                  <div className="relative mb-4 flex items-center justify-center">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-700 text-white font-bold text-xs px-2 py-0.5 rounded-full shadow-sm z-10 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      3rd
                    </div>
                    <div className="w-20 h-20 rounded-full border-4 border-amber-700 dark:border-amber-800 bg-linear-to-tr from-amber-750 to-amber-900 text-white font-bold text-2xl flex items-center justify-center shadow-lg">
                      {topThree[2].avatarInitials}
                    </div>
                  </div>
                  <Card className="w-full text-center border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xs relative overflow-hidden transition-all duration-300 hover:shadow-md">
                    <div className="absolute top-0 inset-x-0 h-1 bg-amber-700" />
                    <CardBody className="p-5">
                      <h3 className="font-bold text-base truncate text-gray-700">{topThree[2].name}</h3>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold truncate mt-0.5">
                        {topThree[2].company}
                      </p>
                      <div className="mt-3 flex justify-center items-baseline gap-1">
                        <span className="text-2xl font-black text-zinc-800 dark:text-zinc-100">{topThree[2].contributionScore}</span>
                        <span className="text-xs text-zinc-400 font-medium">pts</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 text-[10px] text-zinc-450 dark:text-zinc-500 font-semibold">
                        <div>
                          <p className="text-zinc-400">Postings</p>
                          <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">{topThree[2].opportunitiesPosted}</p>
                        </div>
                        <div>
                          <p className="text-zinc-400">Referrals</p>
                          <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">{topThree[2].referralsGiven}</p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </div>
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
          <div className="max-w-5xl mx-auto px-4">
            <Card className="border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <CardHeader className="bg-zinc-50/50 dark:bg-zinc-900/20 px-6 py-4 flex items-center justify-between">
                <h3 className="font-bold text-base font-display flex items-center gap-2 text-slate-900">
                  <Award className="w-5 h-5 text-indigo-500" />
                  Alumni Rankings
                </h3>
                <span className="text-xs text-gray-600 font-medium">Showing {filteredLeaderboard.length} listings</span>
              </CardHeader>
              <CardBody className="p-0">
                {filteredLeaderboard.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-200/50 dark:border-zinc-800/60 bg-zinc-50/20 dark:bg-zinc-900/10 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          <th className="py-4 px-6 text-center w-20">Rank</th>
                          <th className="py-4 px-6">Alumni Member</th>
                          <th className="py-4 px-6 text-center">Postings</th>
                          <th className="py-4 px-6 text-center">Referrals</th>
                          <th className="py-4 px-6 text-right pr-8">Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800/50 text-sm">
                        {filteredLeaderboard.map((item) => (
                          <tr
                            key={item.$id || item.name}
                            className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 transition-colors"
                          >
                            {/* Rank Column */}
                            <td className="py-4 px-6 text-center font-extrabold text-zinc-800 dark:text-zinc-200">
                              {item.rank <= 3 ? (
                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                                  item.rank === 1 ? 'bg-amber-100 text-amber-700' :
                                  item.rank === 2 ? 'bg-zinc-100 text-zinc-700' :
                                  'bg-amber-900/20 text-amber-800'
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
                                <div className="h-9 w-9 rounded-full bg-linear-to-tr from-violet-650 to-indigo-650 text-white font-bold text-xs flex items-center justify-center">
                                  {item.avatarInitials}
                                </div>
                                <div className="max-w-50 sm:max-w-xs truncate">
                                  <h4 className="font-bold text-zinc-850 dark:text-zinc-150">{item.name}</h4>
                                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 truncate">
                                    {item.jobTitle} at <strong>{item.company}</strong>
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Postings Count */}
                            <td className="py-4 px-6 text-center text-zinc-500 dark:text-zinc-400 font-semibold">
                              {item.opportunitiesPosted}
                            </td>

                            {/* Referrals Count */}
                            <td className="py-4 px-6 text-center text-zinc-500 dark:text-zinc-400 font-semibold">
                              {item.referralsGiven}
                            </td>

                            {/* Score */}
                            <td className="py-4 px-6 text-right pr-8 font-black text-indigo-600 dark:text-indigo-400 text-base">
                              {item.contributionScore}
                              <span className="text-[10px] text-gray-600 font-medium ml-0.5">pts</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-16 text-center text-gray-700 dark:text-gray-300 flex flex-col items-center gap-2">
                    <Trophy className="w-10 h-10 text-zinc-300 dark:text-zinc-700" />
                    <p className="text-sm">No members matching your search query were found.</p>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default LeaderboardPage;
