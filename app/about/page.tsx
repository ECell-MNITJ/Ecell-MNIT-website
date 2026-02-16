import { createServerClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { FiLinkedin, FiTwitter } from 'react-icons/fi';
import PageLayout3DWrapper from '@/components/3d/PageLayout3DWrapper';

interface TeamMember {
    id: string;
    name: string;
    role: string;

    bio: string | null;
    image_url: string | null;
    linkedin_url: string | null;
    twitter_url: string | null;
}

async function getTeamMembers(): Promise<TeamMember[]> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('order_index', { ascending: true });

    if (error) {
        console.error('Error fetching team members:', error);
        return [];
    }

    return data || [];
}

export default async function About() {
    const teamMembers = await getTeamMembers();

    // specific calculation for dynamic height
    // Base content takes ~6.2 pages. Each row of team members (4 per row) adds ~0.4 pages.
    const teamRows = Math.ceil(teamMembers.length / 4);
    const totalPages = 6.2 + (teamRows * 0.4);

    // Mobile calculation (1 column)
    const teamRowsMobile = teamMembers.length;
    const totalPagesMobile = 6.2 + (teamRowsMobile * 0.4);

    return (
        <PageLayout3DWrapper pages={totalPages} mobilePages={totalPagesMobile}>
            <div className="w-full">
                {/* Hero Section */}
                <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 flex flex-col justify-center items-center text-center pointer-events-none">
                    <div className="bg-black/60 backdrop-blur-md p-8 md:p-12 rounded-2xl border border-white/10 max-w-4xl pointer-events-auto shadow-2xl">
                        <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl mb-6 text-white">About E-Cell MNIT</h1>
                        <p className="text-lg md:text-xl max-w-3xl mx-auto text-gray-200 font-light">
                            Fostering entrepreneurship and innovation at Malaviya National Institute of Technology, Jaipur
                        </p>
                    </div>
                </section>

                {/* Our Story */}
                <section className="section py-20 pointer-events-none">
                    <div className="container-custom pointer-events-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
                            <div className="order-2 md:order-1">
                                <h2 className="text-4xl font-heading text-primary-green mb-6">Our Story</h2>
                                <div className="w-20 h-1 bg-gradient-to-r from-primary-golden to-yellow-700 mb-6 rounded-full" />
                                <div className="space-y-4 text-gray-300 leading-relaxed bg-black/40 p-6 rounded-xl border border-white/5 backdrop-blur-sm">
                                    <p>
                                        Established with the vision of creating an ecosystem that fosters the spirit of entrepreneurship among students, E-Cell MNIT has evolved into a premier student-run organization.
                                    </p>
                                    <p>
                                        Our journey began with a handful of passionate students who believed in the power of ideas. Over the years, we have grown into a vibrant community that bridges the gap between academia and industry.
                                    </p>
                                    <p>
                                        From organizing small workshops to hosting national-level summits, we have constantly pushed boundaries to provide the best opportunities for aspiring entrepreneurs.
                                    </p>
                                </div>
                            </div>
                            <div className="order-1 md:order-2 flex justify-center">
                                <div className="relative w-full max-w-md aspect-square bg-gradient-to-br from-primary-green/20 to-primary-golden/20 rounded-full flex items-center justify-center animate-pulse-slow">
                                    <div className="absolute inset-0 border-2 border-dashed border-primary-golden/30 rounded-full animate-spin-slow"></div>
                                    <span className="text-8xl">📖</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Mission & Vision */}
                <section className="section py-20 pointer-events-none">
                    <div className="container-custom pointer-events-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
                            <div className="bg-zinc-900/80 backdrop-blur-xl p-8 rounded-2xl border border-zinc-700 shadow-2xl hover:border-primary-golden/30 transition-colors">
                                <div className="text-5xl mb-4">🎯</div>
                                <h2 className="text-3xl font-heading text-primary-green mb-4">Our Mission</h2>
                                <p className="text-gray-300 leading-relaxed">
                                    To cultivate a culture of entrepreneurship and innovation among students by providing them with the necessary resources, mentorship, and opportunities to transform their ideas into successful ventures.
                                </p>
                            </div>

                            <div className="bg-zinc-900/80 backdrop-blur-xl p-8 rounded-2xl border border-zinc-700 shadow-2xl hover:border-primary-golden/30 transition-colors">
                                <div className="text-5xl mb-4">👁️</div>
                                <h2 className="text-3xl font-heading text-primary-green mb-4">Our Vision</h2>
                                <p className="text-gray-300 leading-relaxed">
                                    To be the leading entrepreneurship cell in the country, recognized for producing successful entrepreneurs who create jobs, drive innovation, and contribute to economic growth.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Director's Message */}
                <section className="section py-20 pointer-events-none">
                    <div className="container-custom pointer-events-auto">
                        <div className="bg-zinc-900/80 backdrop-blur-md rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
                            <div className="grid grid-cols-1 md:grid-cols-3">
                                <div className="md:col-span-1 bg-gradient-to-br from-gray-800 to-black relative h-64 md:h-auto overflow-hidden group">
                                    {/* Placeholder for Director's Image */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-gray-500">
                                        <span className="text-6xl group-hover:scale-110 transition-transform duration-500">🎓</span>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
                                        <h3 className="text-xl font-bold text-white">Prof. Name Surname</h3>
                                        <p className="text-primary-golden text-sm">Faculty Advisor, E-Cell MNIT</p>
                                    </div>
                                </div>
                                <div className="md:col-span-2 p-8 md:p-12 flex flex-col justify-center">
                                    <h2 className="text-3xl font-heading text-primary-green mb-6">From the Desk of Faculty Advisor</h2>
                                    <div className="text-gray-300 space-y-4 italic leading-relaxed">
                                        <p>
                                            "Entrepreneurship is not just about starting a business; it's about solving problems and creating value. At E-Cell MNIT, we strive to ignite this spark of innovation in every student."
                                        </p>
                                        <p>
                                            "We provide a platform where ideas meet execution. Through our various initiatives, mentors, and resources, we successfully bridge the gap between theoretical knowledge and practical application."
                                        </p>
                                        <p>
                                            "I invite every student to be a part of this transformative journey. Let us build the future, together."
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>


                {/* What We Do */}
                <section className="section py-20 pointer-events-none">
                    <div className="container-custom pointer-events-auto">
                        <div className="text-center mb-16 bg-black/60 backdrop-blur-md px-8 py-6 rounded-2xl inline-block mx-auto border border-white/5">
                            <h2 className="text-4xl md:text-5xl font-heading text-primary-green mb-4">
                                What We Do
                            </h2>
                            <div className="w-20 h-1 bg-gradient-to-r from-primary-golden to-yellow-700 mx-auto mb-6 rounded-full" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
                            {[
                                {
                                    icon: '📚',
                                    title: 'Workshops & Seminars',
                                    description: 'Regular workshops on business fundamentals, product development, and market strategies.',
                                },
                                {
                                    icon: '🏆',
                                    title: 'Competitions',
                                    description: 'Organize pitch competitions, hackathons, and case study challenges.',
                                },
                                {
                                    icon: '🤝',
                                    title: 'Mentorship Programs',
                                    description: 'Connect students with successful entrepreneurs and industry experts.',
                                },
                                {
                                    icon: '💰',
                                    title: 'Funding Support',
                                    description: 'Help startups secure seed funding and connect with investors.',
                                },
                                {
                                    icon: '🌐',
                                    title: 'Networking Events',
                                    description: 'Create opportunities to network with entrepreneurs, investors, and industry leaders.',
                                },
                                {
                                    icon: '🔬',
                                    title: 'Incubation Support',
                                    description: 'Provide infrastructure and resources for early-stage startups.',
                                },
                            ].map((item, index) => (
                                <div
                                    key={index}
                                    className="bg-zinc-900/90 backdrop-blur-md p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-zinc-700 border-l-4 border-l-primary-golden"
                                >
                                    <div className="text-5xl mb-4">{item.icon}</div>
                                    <h3 className="text-xl font-heading text-primary-green mb-3">{item.title}</h3>
                                    <p className="text-gray-400">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Testimonials */}
                <section className="section py-20 pointer-events-none">
                    <div className="container-custom pointer-events-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-heading text-primary-green mb-4 bg-black/60 backdrop-blur-md px-6 py-2 rounded-xl inline-block border border-white/5">
                                Voices of Impact
                            </h2>
                            <div className="w-20 h-1 bg-gradient-to-r from-primary-golden to-yellow-700 mx-auto rounded-full" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                            {[
                                {
                                    quote: "E-Cell MNIT provided me with the mentorship and network I needed to take my startup from an idea to reality. The support here is unparalleled.",
                                    author: "Alumni Entrepreneur",
                                    role: "Founder, TechStart"
                                },
                                {
                                    quote: "The workshops and competitions organized by E-Cell gave me a practical understanding of business that classrooms couldn't. Highly recommended!",
                                    author: "Student Member",
                                    role: "3rd Year, CS"
                                }
                            ].map((t, i) => (
                                <div key={i} className="bg-zinc-900/60 backdrop-blur-md p-8 rounded-2xl border border-white/5 relative">
                                    <span className="absolute top-4 left-4 text-6xl text-primary-golden/20 font-serif">"</span>
                                    <p className="text-gray-300 italic mb-6 relative z-10">{t.quote}</p>
                                    <div>
                                        <h4 className="text-white font-bold">{t.author}</h4>
                                        <p className="text-primary-golden text-sm">{t.role}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Team Section */}
                <section className="section py-20 pointer-events-none pb-40">
                    <div className="container-custom pointer-events-auto">
                        <div className="text-center mb-16 bg-black/60 backdrop-blur-md px-8 py-6 rounded-2xl inline-block mx-auto border border-white/5">
                            <h2 className="text-4xl md:text-5xl font-heading text-primary-green mb-4">
                                Our Team
                            </h2>
                            <div className="w-20 h-1 bg-gradient-to-r from-primary-golden to-yellow-700 mx-auto mb-6 rounded-full" />
                            <p className="text-gray-300 max-w-2xl mx-auto">
                                Meet the passionate individuals driving E-Cell MNIT forward
                            </p>
                        </div>

                        {teamMembers.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-8">
                                {teamMembers.map((member) => (
                                    <div
                                        key={member.id}
                                        className="text-center group bg-zinc-900/80 backdrop-blur-sm p-6 rounded-2xl border border-white/5 hover:border-primary-golden/30 transition-all duration-300"
                                    >
                                        {member.image_url ? (
                                            <img
                                                src={member.image_url}
                                                alt={member.name}
                                                className="w-40 h-40 mx-auto mb-4 rounded-full object-cover group-hover:scale-110 transition-transform duration-300 shadow-lg border-2 border-primary-golden/20"
                                            />
                                        ) : (
                                            <div className="w-40 h-40 mx-auto mb-4 bg-gradient-to-br from-primary-green to-gray-800 rounded-full flex items-center justify-center text-4xl font-heading text-white group-hover:scale-110 transition-transform duration-300 border-2 border-primary-golden/20">
                                                {member.name.charAt(0)}
                                            </div>
                                        )}
                                        <h3 className="text-xl font-heading text-white mb-1 group-hover:text-primary-golden transition-colors">{member.name}</h3>
                                        <p className="text-primary-golden font-semibold text-sm mb-3">{member.role}</p>


                                        {(member.linkedin_url || member.twitter_url) && (
                                            <div className="flex justify-center gap-4 mt-2">
                                                {member.linkedin_url && (
                                                    <a
                                                        href={member.linkedin_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-gray-400 hover:text-primary-golden transition-colors bg-white/5 p-2 rounded-full"
                                                    >
                                                        <FiLinkedin className="w-5 h-5" />
                                                    </a>
                                                )}
                                                {member.twitter_url && (
                                                    <a
                                                        href={member.twitter_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-gray-400 hover:text-primary-golden transition-colors bg-white/5 p-2 rounded-full"
                                                    >
                                                        <FiTwitter className="w-5 h-5" />
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center bg-black/50 p-10 rounded-xl max-w-2xl mx-auto border border-white/10">
                                <p className="text-gray-400">Team members will be displayed here soon!</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </PageLayout3DWrapper>
    );
}
