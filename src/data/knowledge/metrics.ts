import type { KnowledgeWing } from './types'
import { kc } from './claim'

/*
  This wing used to teach public pitch models by showing their scales. In the
  craft-first atlas, it teaches how to read those models without turning them into
  specimen truth. No pitch-behavior figures belong here.
*/
export const metricsWing: KnowledgeWing = {
  slug: 'metrics',
  navLabel: 'Reading Models',
  eyebrow: 'The craft',
  title: 'Reading Models Without Losing the Pitch',
  summary:
    'Modern pitch models are useful scouting language, not the grip itself. Read them as context, then return to shape, feel, and intent.',
  sub:
    'Public models can describe what a tracked pitch looked like in a given environment. They do not tell you how a grip feels in the hand, what cue made it work, or whether that same shape belongs in your arsenal.',
  accent: 'powder',
  educational: false,
  sections: [
    {
      heading: 'Models Are Maps, Not the Territory',
      paragraphs: [
        'Stuff+, Location+, and Pitching+ are outcome-trained models. They look at tracked traits, location, count context, and observed results, then translate that history into a scouting read. That can be useful. It can also tempt a pitcher to chase the model instead of understanding the pitch.',
        'The craft question stays simpler: what shape are you trying to create, what grip and release cue make that shape show up, and how does it pair with the rest of the arsenal? A model can point at a pattern. It cannot feel the ball leaving your fingers.',
        'Read public model language as a source-labeled outside view, not as proof that one grip is correct for every hand.',
      ],
      claims: [
        kc(
          'Stuff+, Location+, and Pitching+ are public models built to describe pitch quality from tracked traits, location, count context, and observed outcomes.',
          'official-data',
          {
            label: 'FanGraphs Library: Stuff+, Location+, and Pitching+ Primer',
            url: 'https://library.fangraphs.com/pitching/stuff-location-and-pitching-primer/',
          },
        ),
        kc(
          'Pitching+ combines physical traits, placement, count, and batter handedness into a broader model, rather than acting as a simple average of the other model reads.',
          'official-data',
          {
            label: 'FanGraphs Library: Stuff+, Location+, and Pitching+ Primer',
            url: 'https://library.fangraphs.com/pitching/stuff-location-and-pitching-primer/',
          },
        ),
      ],
    },
    {
      heading: 'Shape Words Beat Fake Precision',
      paragraphs: [
        'The same pitch can be described honestly without publishing a tracked measurement. A four-seam can ride late, a two-seam can run arm-side, a changeup can fade and tumble, and a sweeper can move across the plate. Those words tell a pitcher what to feel for without pretending the atlas measured a ball it never tracked.',
        'That is why Pitch Atlas keeps model language in the learning layer and specimen language in the grip layer. If the pitch was not measured here, the page says what the shape is supposed to feel like and how the grip tries to create it.',
        'The useful habit is translation: when a model says a pitch lives in a certain movement family, convert that into a catchable cue a pitcher can test in the hand.',
      ],
      claims: [
        kc(
          'MLB and public analysis describe pitch families by the movement shapes they create, but the atlas renders those shapes as prose instead of copied tracking figures.',
          'reputable-analysis',
          {
            label: 'MLB Glossary: Pitch Types',
            url: 'https://www.mlb.com/glossary/pitch-types',
          },
        ),
        kc(
          'Pitch-type labels can be useful while still needing human interpretation, especially where breaking-ball shapes overlap.',
          'reputable-analysis',
          {
            label: 'Fixing the Curve: Improving MLB Pitch Classification with Model-Based Clustering',
            url: 'https://www.causeweb.org/usproc/sites/default/files/usresp/2018-2/Fixing%20the%20Curve%20Improving%20Major%20League%20Baseball%20Pitch%20Classification%20with%20Model-Based%20Clustering.pdf',
          },
        ),
      ],
    },
    {
      heading: 'Use Models After the Grip Conversation',
      paragraphs: [
        'A pitcher should be able to explain the pitch before opening a leaderboard: where the fingers sit, where the pressure lives, what the release feels like, and what the ball is supposed to do late. If that language is missing, the model has become a shortcut.',
        'Once the grip story is clear, outside model language can help ask better questions. Does this shape pair with the fastball? Does the hitter see the same release early? Does the pitch need sharper late action, softer fade, or a different target lane?',
        'The atlas order matters: grip first, shape second, sources underneath. Models belong in that order too.',
      ],
      claims: [
        kc(
          'Modern pitch design facilities pair tracking data with high-speed video and live-batter validation, treating the model as one input rather than the whole answer.',
          'reputable-analysis',
          {
            label: 'SI.com: From Trackman to Edgertronic to Rapsodo, the Tech Boom Is Fundamentally Altering Baseball',
            url: 'https://www.si.com/mlb/2019/03/29/technology-revolution-baseball-trackman-edgertronic-rapsodo',
          },
        ),
        kc(
          'Pitch design is most useful when a tracked read is tied back to grip, release, arsenal fit, and live hitter reaction.',
          'reputable-analysis',
          {
            label: 'Driveline Baseball: Pitch Design',
            url: 'https://www.drivelinebaseball.com/pitch-design/',
          },
        ),
      ],
    },
  ],
  confidenceNote:
    'Model definitions are sourced from FanGraphs, MLB, applied pitch-classification research, and pitch-design facility writing. The route translates those sources into craft language and does not publish pitch-behavior figures.',
  related: [
    { label: 'Pitch Design', to: '/learn/pitch-design' },
    { label: 'Spin Axis and Life', to: '/learn/spin' },
    { label: 'Mechanics', to: '/learn/mechanics' },
    { label: 'Sequencing', to: '/learn/sequencing' },
  ],
}
