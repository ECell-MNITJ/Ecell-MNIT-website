-- Seed default data for E-Summit Stats if table is empty
INSERT INTO esummit_stats (label, value, display_order)
SELECT 'Footfall', '10K+', 1
WHERE NOT EXISTS (SELECT 1 FROM esummit_stats);

INSERT INTO esummit_stats (label, value, display_order)
SELECT 'Speakers', '50+', 2
WHERE NOT EXISTS (SELECT 1 FROM esummit_stats);

INSERT INTO esummit_stats (label, value, display_order)
SELECT 'Startups', '100+', 3
WHERE NOT EXISTS (SELECT 1 FROM esummit_stats);

INSERT INTO esummit_stats (label, value, display_order)
SELECT 'Grants', '₹10L+', 4
WHERE NOT EXISTS (SELECT 1 FROM esummit_stats);


-- Seed default data for E-Summit Blueprint if table is empty
INSERT INTO esummit_blueprint (title, description, icon, align, display_order)
SELECT 'Startup Expo', 'Showcase your innovation to investors, mentors, and early adopters. The launchpad your startup deserves.', 'FiTarget', 'left', 1
WHERE NOT EXISTS (SELECT 1 FROM esummit_blueprint);

INSERT INTO esummit_blueprint (title, description, icon, align, display_order)
SELECT 'Speaker Sessions', 'Gain specialized knowledge from industry veterans who have walked the path and conquered the challenges.', 'FiActivity', 'right', 2
WHERE NOT EXISTS (SELECT 1 FROM esummit_blueprint);

INSERT INTO esummit_blueprint (title, description, icon, align, display_order)
SELECT 'Hackathons', 'Build, break, and rebuild. 24 hours of intense coding and problem-solving to create the next big thing.', 'FiCpu', 'left', 3
WHERE NOT EXISTS (SELECT 1 FROM esummit_blueprint);

INSERT INTO esummit_blueprint (title, description, icon, align, display_order)
SELECT 'Networking Arena', 'Connect with a curated community of founders, VCs, and tech enthusiasts. Your next co-founder might be here.', 'FiGlobe', 'right', 4
WHERE NOT EXISTS (SELECT 1 FROM esummit_blueprint);
