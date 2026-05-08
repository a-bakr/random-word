export interface Twister {
  id: string;
  text: string;
  sound: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'very-hard';
}

export const twisters: Twister[] = [
  { id: '01', text: 'She sells seashells by the seashore.', sound: '/s/', difficulty: 'easy' },
  { id: '02', text: 'I saw Susie sitting in a shoeshine shop.', sound: '/s/ + /ʃ/', difficulty: 'medium' },
  { id: '03', text: 'Six sick slick slim sycamore saplings.', sound: '/s/', difficulty: 'hard' },
  { id: '04', text: 'Six slippery snails slid slowly seaward.', sound: '/s/', difficulty: 'medium' },
  { id: '05', text: 'Sam\'s shop stocks short spotted socks.', sound: '/s/ + /ʃ/', difficulty: 'medium' },
  { id: '06', text: 'A skunk sat on a stump and thunk the stump stunk, but the stump thunk the skunk stunk.', sound: '/s/ + /θ/', difficulty: 'hard' },
  { id: '07', text: 'I slit the sheet, the sheet I slit, and on the slitted sheet I sit.', sound: '/s/ + /ʃ/', difficulty: 'hard' },

  { id: '08', text: 'Shy Shelly says she shall sew sheets.', sound: '/ʃ/', difficulty: 'medium' },
  { id: '09', text: 'Pre-shrunk silk shirts.', sound: '/ʃ/', difficulty: 'hard' },
  { id: '10', text: 'If a dog chews shoes, whose shoes does he choose?', sound: '/ʃ/ vs /tʃ/', difficulty: 'medium' },
  { id: '11', text: 'I wish to wash my Irish wristwatch.', sound: '/ʃ/ + /r/', difficulty: 'hard' },

  { id: '12', text: 'Peter Piper picked a peck of pickled peppers.', sound: '/p/', difficulty: 'medium' },
  { id: '13', text: 'A big black bear sat on a big black rug.', sound: '/b/', difficulty: 'easy' },
  { id: '14', text: 'A big black bug bit a big black bear, made the big black bear bleed blood.', sound: '/b/', difficulty: 'medium' },
  { id: '15', text: 'Big black bugs bleed blue-black blood but baby black bugs bleed blue blood.', sound: '/b/', difficulty: 'hard' },
  { id: '16', text: 'Rubber baby buggy bumpers.', sound: '/b/', difficulty: 'medium' },
  { id: '17', text: 'Pad kid poured curd pulled cod.', sound: '/p/ + /k/ + /d/', difficulty: 'very-hard' },

  { id: '18', text: 'Tom threw Tim three thumbtacks.', sound: '/t/ + /θ/', difficulty: 'medium' },
  { id: '19', text: 'He threw three free throws.', sound: '/θ/ + /r/', difficulty: 'medium' },
  { id: '20', text: 'Fred fed Ted bread, and Ted fed Fred bread.', sound: '/d/ + /f/', difficulty: 'easy' },
  { id: '21', text: 'A proper copper coffee pot.', sound: '/p/ + /k/', difficulty: 'hard' },
  { id: '22', text: 'Twelve twins twirled twelve twigs.', sound: '/tw/', difficulty: 'hard' },

  { id: '23', text: 'Red lorry, yellow lorry.', sound: '/r/ + /l/', difficulty: 'hard' },
  { id: '24', text: 'Red leather, yellow leather.', sound: '/r/ + /l/', difficulty: 'hard' },
  { id: '25', text: 'Around the rugged rocks the ragged rascals ran.', sound: '/r/', difficulty: 'hard' },
  { id: '26', text: 'Truly rural.', sound: '/r/ + /l/', difficulty: 'hard' },
  { id: '27', text: 'Rural juror.', sound: '/r/', difficulty: 'hard' },
  { id: '28', text: 'A loyal warrior will rarely worry why we rule.', sound: '/r/ + /w/', difficulty: 'hard' },

  { id: '29', text: 'Lesser leather never weathered wetter weather better.', sound: '/l/ + /ð/', difficulty: 'very-hard' },
  { id: '30', text: 'Eleven benevolent elephants.', sound: '/l/', difficulty: 'hard' },
  { id: '31', text: 'Larry sent the latter a letter later.', sound: '/l/ + /t/', difficulty: 'medium' },

  { id: '32', text: 'The thirty-three thieves thought that they thrilled the throne throughout Thursday.', sound: '/θ/', difficulty: 'very-hard' },
  { id: '33', text: 'The sixth sick sheikh\'s sixth sheep\'s sick.', sound: '/ʃ/ + /θ/', difficulty: 'very-hard' },
  { id: '34', text: 'I thought I thought of thinking of thanking you.', sound: '/θ/', difficulty: 'hard' },
  { id: '35', text: 'Whether the weather is cold or whether the weather is hot, we\'ll weather the weather, whatever the weather, whether we like it or not.', sound: '/w/ + /ð/', difficulty: 'hard' },

  { id: '36', text: 'How much wood would a woodchuck chuck if a woodchuck could chuck wood?', sound: '/w/ + /tʃ/', difficulty: 'hard' },
  { id: '37', text: 'Which witch is which?', sound: '/w/ + /tʃ/', difficulty: 'easy' },
  { id: '38', text: 'Which wristwatches are Swiss wristwatches?', sound: '/w/ + /r/', difficulty: 'hard' },
  { id: '39', text: 'If two witches would watch two watches, which witch would watch which watch?', sound: '/w/ + /tʃ/', difficulty: 'very-hard' },
  { id: '40', text: 'Vincent vowed vengeance very vehemently.', sound: '/v/', difficulty: 'hard' },

  { id: '41', text: 'Four fine fresh fish for you.', sound: '/f/', difficulty: 'medium' },
  { id: '42', text: 'Friendly Frank flips fine flapjacks.', sound: '/f/ + /fl/', difficulty: 'hard' },
  { id: '43', text: 'Freshly fried fresh flesh.', sound: '/f/ + /fr/', difficulty: 'very-hard' },

  { id: '44', text: 'How can a clam cram in a clean cream can?', sound: '/k/ + /kl/ + /kr/', difficulty: 'medium' },
  { id: '45', text: 'Can you can a can as a canner can can a can?', sound: '/k/', difficulty: 'hard' },
  { id: '46', text: 'Six sick hicks nick six slick bricks with picks and sticks.', sound: '/k/ + /s/', difficulty: 'very-hard' },
  { id: '47', text: 'Green glass globes glow greenly.', sound: '/g/ + /gl/', difficulty: 'hard' },
  { id: '48', text: 'Good blood, bad blood.', sound: '/b/ + /d/', difficulty: 'hard' },

  { id: '49', text: 'Unique New York.', sound: '/juː/ + /n/ + /k/', difficulty: 'hard' },
  { id: '50', text: 'The rain in Spain stays mainly on the plain.', sound: '/eɪ/', difficulty: 'easy' },
];
