-- Add pass_features_list column to esummit_settings
ALTER TABLE esummit_settings ADD COLUMN IF NOT EXISTS pass_features_list TEXT[] DEFAULT ARRAY[
    'Startup Expo',
    'LHC Speakers Sessions',
    'Informals',
    'OAT Events',
    'Highlight Speaker Sessions',
    'Internship & Job Fair',
    'Competitions',
    'Networking Arena',
    'Incubator Summit',
    'Innovation Square'
];

-- Ensure we have a default list in the existing row if any
UPDATE esummit_settings SET pass_features_list = ARRAY[
    'Startup Expo',
    'LHC Speakers Sessions',
    'Informals',
    'OAT Events',
    'Highlight Speaker Sessions',
    'Internship & Job Fair',
    'Competitions',
    'Networking Arena',
    'Incubator Summit',
    'Innovation Square'
] WHERE pass_features_list IS NULL;
