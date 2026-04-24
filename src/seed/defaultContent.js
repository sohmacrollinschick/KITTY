const PageContent = require('../models/PageContent');
const SiteSettings = require('../models/SiteSettings');

const defaultPages = [
  {
    slug: 'home',
    title: 'Find Your Perfect Kitten Companion',
    body: 'Ethically raised kittens with affectionate temperaments and complete health records.',
    blocks: {
      heroSubtitle: 'Trusted breeder and adoption support from first hello to safe home arrival.',
      ctaPrimary: 'View Available Kittens',
      ctaSecondary: 'Start Adoption Inquiry'
    }
  },
  {
    slug: 'about',
    title: 'Our Story',
    body: 'We are a boutique cattery focused on healthy lines, socialized kittens, and transparent care.',
    blocks: {
      philosophy: 'Every kitten deserves a nurturing start and every family deserves support.'
    }
  },
  {
    slug: 'process',
    title: 'Adoption Process',
    body: 'Application, consultation, reservation, and personalized transition support.',
    blocks: {
      deposit: 'Deposits secure your kitten and are applied toward the final balance.',
      delivery: 'Pickup appointments and trusted delivery partners are available.'
    }
  },
  {
    slug: 'faq',
    title: 'Frequently Asked Questions',
    body: 'Answers on health guarantees, payment options, shipping, and reservation policies.',
    blocks: {
      questions: [
        {
          q: 'Are kittens vaccinated before going home?',
          a: 'Yes, kittens receive age-appropriate vaccinations and vet checks before pickup.'
        },
        {
          q: 'Do you offer delivery?',
          a: 'Yes, we provide safe hand-delivery and discuss route options during reservation.'
        }
      ]
    }
  }
];

const ensureDefaults = async () => {
  for (const page of defaultPages) {
    await PageContent.findOneAndUpdate({ slug: page.slug }, { $setOnInsert: page }, { upsert: true, new: true });
  }

  await SiteSettings.findOneAndUpdate(
    {},
    {
      $setOnInsert: {
        businessName: 'Velvet Paws Cattery',
        contactEmail: 'hello@velvetpawscattery.com',
        phone: '+1 (555) 123-4567',
        address: '123 Purrington Lane, Your City, USA'
      }
    },
    { upsert: true }
  );
};

module.exports = ensureDefaults;
