import type { AgentMessage, VerdictCard } from '@/types';

export interface MockDebate {
  cityId: string;
  messages: AgentMessage[];
  verdict: VerdictCard;
  followUpPrompts: string[];
}

export const MOCK_DEBATES: Record<string, MockDebate> = {
  tokyo: {
    cityId: 'tokyo',
    messages: [
      {
        agentId: 'nightowl',
        agentName: 'The Nightowl',
        agentEmoji: '🦉',
        content:
          "Golden Gai tonight. No debate. Six seats, one bartender who's been pouring since 1972, and a door policy that's just 'don't be annoying.' While the Foodie will inevitably drag you to some ramen spot, the real move is bar-hopping through those alleys until 4AM when even the Wanderer has to admit the neon hits different at that hour. Start at Bar Albatross — it's the size of a closet and twice as magical.",
        reactions: [
          { type: 'fire', agentId: 'local' },
          { type: 'hmm', agentId: 'culture' },
        ],
        venues: ['Golden Gai', 'Bar Albatross'],
      },
      {
        agentId: 'foodie',
        agentName: 'The Foodie',
        agentEmoji: '🍜',
        content:
          "The Nightowl thinks drinking in a closet is a personality — cute. But listen: Fuunji's tsukemen is a religious experience. The noodles are thick, the broth is intense, and there's a reason the line wraps around the block at lunch. Hit it early evening before the rush. Then, since the Local Legend will tell you about some hidden izakaya, I'll raise: Omoide Yokocho's yakitori stalls where the smoke is the seasoning and every skewer costs less than a subway ride.",
        reactions: [
          { type: 'cosign', agentId: 'wanderer' },
          { type: 'fire', agentId: 'local' },
        ],
        venues: ['Fuunji', 'Omoide Yokocho'],
      },
      {
        agentId: 'culture',
        agentName: 'The Culture Vulture',
        agentEmoji: '🎭',
        content:
          "Both valid, both predictable. TeamLab Borderless just reopened in Azabudai Hills and it's genuinely transcendent — digital art that responds to your movement across infinite rooms. Go at twilight when the light installations blur with the actual sunset. I know the Nightowl thinks culture closes at 5PM, but this runs until 9. Then walk to Nezu Museum's garden if you want to feel something real before the chaos of Shinjuku swallows you whole.",
        reactions: [
          { type: 'nah', agentId: 'nightowl' },
          { type: 'cosign', agentId: 'wanderer' },
        ],
        venues: ['TeamLab Borderless', 'Nezu Museum'],
      },
      {
        agentId: 'local',
        agentName: 'The Local Legend',
        agentEmoji: '🏮',
        content:
          "Everyone's hitting the tourist trail tonight, huh? Nonbei Yokocho in Shibuya is Golden Gai without the Instagram crowd — the Nightowl knows this but won't share it. Tiny standing bars, mama-san spots where she picks your drink. Then Harmonica Yokocho in Kichijoji for yakitori that makes the Foodie's Omoide Yokocho pick look like an airport lounge. Take the Chuo Line — 15 minutes and you're in actual Tokyo, not the postcard version.",
        reactions: [
          { type: 'fire', agentId: 'nightowl' },
          { type: 'hmm', agentId: 'foodie' },
        ],
        venues: ['Nonbei Yokocho', 'Harmonica Yokocho'],
      },
      {
        agentId: 'wanderer',
        agentName: 'The Wanderer',
        agentEmoji: '🧭',
        content:
          "Everyone's got a plan — that's the problem. Here's mine: no plan. Start in Yanaka before sunset. The cemetery is unexpectedly beautiful, the shopping street has cat-shaped taiyaki, and the light at golden hour makes the Culture Vulture's museum look like a screensaver. Then just walk south. You'll hit Ueno, then Akihabara, then suddenly you're in Nihonbashi and it's midnight and Tokyo has done what it does best: surprised you without asking permission.",
        reactions: [
          { type: 'cosign', agentId: 'culture' },
          { type: 'hmm', agentId: 'local' },
        ],
        venues: ['Yanaka Ginza', 'Yanaka Cemetery'],
      },
    ],
    verdict: {
      route: 'Golden Gai → Fuunji tsukemen → Nonbei Yokocho nightcap',
      description: 'Start with a Golden Gai bar crawl through the tiny alleys, refuel with Fuunji\'s legendary tsukemen, then wind down at Nonbei Yokocho for a nightcap.',
      consensus: '4 of 5 agreed on the route; debate centered on whether to plan the night or let Tokyo guide you.',
      wildcard: 'Start in Yanaka at sunset and let Tokyo guide you south into the night.',
    },
    followUpPrompts: [
      'What if I only have 3 hours tonight?',
      'Give me the food-only version of this debate',
      'Where do locals actually go on a Tuesday?',
    ],
  },

  berlin: {
    cityId: 'berlin',
    messages: [
      {
        agentId: 'nightowl',
        agentName: 'The Nightowl',
        agentEmoji: '🦉',
        content:
          "It's Berlin. The answer is always the club. Tresor's 30th anniversary marathon starts Friday midnight and doesn't stop until Sunday morning. Three floors of techno that the Culture Vulture will pretend to appreciate but secretly find too loud. If you can't handle 24 hours, OHM is the move — smaller, darker, and the sound system was built by people who actually understand bass. Dress dark, leave your phone, be nobody.",
        reactions: [
          { type: 'fire', agentId: 'local' },
          { type: 'nah', agentId: 'culture' },
        ],
        venues: ['Tresor', 'OHM'],
      },
      {
        agentId: 'foodie',
        agentName: 'The Foodie',
        agentEmoji: '🍜',
        content:
          "While the Nightowl is standing in a dark room for 48 hours, the rest of us will be eating. Street Food Thursday at Markthalle Neun is non-negotiable — the döner-kimchi fusion alone is worth the trip. Then Curry 36 at 3AM because Berlin's best food happens when the Nightowl's clubs are winding down. The Local Legend will say Curry 36 is basic, but basic at 3AM with a perfect currywurst is actually transcendence.",
        reactions: [
          { type: 'cosign', agentId: 'wanderer' },
          { type: 'hmm', agentId: 'local' },
        ],
        venues: ['Markthalle Neun', 'Curry 36'],
      },
      {
        agentId: 'culture',
        agentName: 'The Culture Vulture',
        agentEmoji: '🎭',
        content:
          "CTM Festival is happening across Kreuzberg — experimental music, installations, and performances that make the Nightowl's techno look quaint. Hamburger Bahnhof has a new exhibition in that magnificent former train station space. Then the East Side Gallery at dusk — yes, it's 'touristy,' and I can hear the Local Legend groaning, but 1.3km of Berlin Wall murals hits differently when you've just seen contemporary art about the same history.",
        reactions: [
          { type: 'hmm', agentId: 'nightowl' },
          { type: 'cosign', agentId: 'local' },
        ],
        venues: ['Hamburger Bahnhof', 'East Side Gallery'],
      },
      {
        agentId: 'local',
        agentName: 'The Local Legend',
        agentEmoji: '🏮',
        content:
          "Klunkerkranich. Rooftop bar on top of a parking garage in Neukölln. The Nightowl doesn't know it exists because there's no bouncer to impress. Sunset views over the city, DJs who play for the vibe not the brand, and it costs almost nothing. Then walk Weserstraße — every third door is a bar worth entering. The Foodie's right about Markthalle Neun but wrong about Curry 36 — Mustafa's Gemüse Kebap is the 3AM move if you can handle the queue.",
        reactions: [
          { type: 'fire', agentId: 'foodie' },
          { type: 'nah', agentId: 'nightowl' },
        ],
        venues: ['Klunkerkranich', 'Weserstraße bars'],
      },
      {
        agentId: 'wanderer',
        agentName: 'The Wanderer',
        agentEmoji: '🧭',
        content:
          "Tempelhofer Feld. A decommissioned airport that's now the biggest park in Berlin — runways where people kite-skate and grill and exist without a plan. The Foodie would hate it because there's no curated food. The Nightowl would hate it because it closes at sunset. That's why it's perfect. Then drift into Neukölln for the Art Walk — 15 galleries, no map needed, just follow the open doors. Berlin rewards those who wander.",
        reactions: [
          { type: 'cosign', agentId: 'culture' },
          { type: 'fire', agentId: 'local' },
        ],
        venues: ['Tempelhofer Feld', 'Neukölln Art Walk'],
      },
    ],
    verdict: {
      route: 'Klunkerkranich sunset → Street Food Thursday → Tresor',
      description: 'Catch sunset drinks at Klunkerkranich rooftop, graze through Street Food Thursday at Markthalle Neun, then head to Tresor for a proper Berlin night.',
      consensus: '3 of 5 agreed on the club route; the Wanderer pushed hard for daytime Berlin instead.',
      wildcard: 'Tempelhofer Feld afternoon → Neukölln Art Walk → wherever Weserstraße takes you.',
    },
    followUpPrompts: [
      'What if I can\'t get into Berghain?',
      'Best Sunday morning in Berlin?',
      'Where\'s the food scene locals actually care about?',
    ],
  },

  nyc: {
    cityId: 'nyc',
    messages: [
      {
        agentId: 'nightowl',
        agentName: 'The Nightowl',
        agentEmoji: '🦉',
        content:
          "House of Yes on a Saturday — and I don't want to hear the Local Legend say it's 'over.' Aerial performers, themed parties, and a dance floor that actually moves. The Culture Vulture will try to send you to a gallery opening with free wine in tiny cups, but this is New York after dark, not a networking event. If House of Yes is too much circus, Nowadays in Ridgewood does outdoor electronic with fire pits. Start at midnight.",
        reactions: [
          { type: 'nah', agentId: 'local' },
          { type: 'hmm', agentId: 'culture' },
        ],
        venues: ['House of Yes', 'Nowadays'],
      },
      {
        agentId: 'foodie',
        agentName: 'The Foodie',
        agentEmoji: '🍜',
        content:
          "Smorgasburg is back and I'm not sorry for being basic about it — 100 vendors on the Williamsburg waterfront and the arepas alone justify the trip. But the real move the Nightowl won't understand: Russ & Daughters for breakfast. Lox on an everything bagel, black coffee, and a century of New York in every bite. Then Di Fara in Midwood — Dom DeMarco's grandson is making pizza that would make the Local Legend weep. Worth the subway ride to Brooklyn's deep south.",
        reactions: [
          { type: 'fire', agentId: 'local' },
          { type: 'cosign', agentId: 'wanderer' },
        ],
        venues: ['Smorgasburg', 'Russ & Daughters', 'Di Fara Pizza'],
      },
      {
        agentId: 'culture',
        agentName: 'The Culture Vulture',
        agentEmoji: '🎭',
        content:
          "The Armory Show is this weekend — 200 galleries under one roof at the Javits Center and it's genuinely the best art fair on the continent. But here's what the Nightowl doesn't know: MoMA PS1 in Long Island City has free admission on Thursdays and the experimental work there makes the main MoMA feel like a gift shop. Then walk to the Cloisters — medieval art in Fort Tryon Park, overlooking the Hudson. It's the most un-New York place in New York.",
        reactions: [
          { type: 'cosign', agentId: 'wanderer' },
          { type: 'hmm', agentId: 'nightowl' },
        ],
        venues: ['The Armory Show', 'MoMA PS1', 'The Met Cloisters'],
      },
      {
        agentId: 'local',
        agentName: 'The Local Legend',
        agentEmoji: '🏮',
        content:
          "Red Hook First Saturdays — open studios in converted warehouses, natural wine in loading docks, and artists who actually live in New York (rare species). Then Sunny's Bar for live bluegrass on a waterfront that the Nightowl has never seen because it's south of the L train. The Foodie's Di Fara pick is solid but Bembe in Williamsburg for late-night Latin music and dancing is the real Brooklyn experience. No velvet rope, just vibes.",
        reactions: [
          { type: 'fire', agentId: 'foodie' },
          { type: 'nah', agentId: 'nightowl' },
        ],
        venues: ["Sunny's Bar", 'Red Hook Studios', 'Bembe'],
      },
      {
        agentId: 'wanderer',
        agentName: 'The Wanderer',
        agentEmoji: '🧭',
        content:
          "Walk the High Line at sunset — the Culture Vulture will call it obvious but the art installations change monthly and the Hudson light at golden hour is free. Then drop into Chelsea, cross to the LES on foot, and let the city happen. DUMBO waterfront at night with the bridge lit up and Manhattan across the water is why people move here. Everyone's got a list tonight. New York doesn't care about your list. Just start walking south.",
        reactions: [
          { type: 'cosign', agentId: 'culture' },
          { type: 'fire', agentId: 'local' },
        ],
        venues: ['The High Line', 'DUMBO Waterfront'],
      },
    ],
    verdict: {
      route: 'Russ & Daughters → Red Hook First Saturdays → House of Yes',
      description: 'Brunch at Russ & Daughters, catch Red Hook First Saturdays for art and waterfront vibes, then close out at House of Yes for a proper NYC night.',
      consensus: '4 of 5 agreed on the food-first approach; debate was whether to stay in Brooklyn or cross into Manhattan.',
      wildcard: 'High Line sunset → walk to LES → DUMBO waterfront under the bridge lights.',
    },
    followUpPrompts: [
      'Best plan if I\'m only in Brooklyn?',
      'What\'s the cheapest great night out?',
      'Rain backup — what changes?',
    ],
  },
};
