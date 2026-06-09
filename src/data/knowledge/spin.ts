import type { KnowledgeWing } from './types'
import { kc } from './claim'

export const spinWing: KnowledgeWing = {
  slug: 'spin',
  navLabel: 'Spin & Shape',
  eyebrow: 'The craft',
  title: 'Spin Axis and Shape Literacy',
  summary:
    'Spin axis gives the pitch its first direction. Seam position and release feel decide whether that direction shows up cleanly.',
  sub:
    'Pitchers do not need a public tracking figure to talk honestly about movement. They need shape words, grip cues, and source-labeled physics: ride, drop, arm-side run, glove-side sweep, late bite, and deadened tumble.',
  accent: 'powder',
  educational: false,
  sections: [
    {
      heading: 'Axis Is Direction',
      paragraphs: [
        'Spin axis is the direction the ball is rotating around. The common coaching shortcut is a clock face: backspin rides, topspin drops, side-tilt moves the ball across the plate, and blended axes create blended shapes.',
        'That language is useful because it is visible and coachable. A pitcher can feel whether the fingers are staying behind the ball, getting around the side, or rolling over it. The atlas uses those words instead of turning the read into a fake measurement.',
        'Axis does not make every pitch good by itself. The grip has to be repeatable, the release has to match the intent, and the pitch has to fit the rest of the arsenal.',
      ],
      claims: [
        kc(
          'Spin axis can be described with a clock-face tilt system, which helps coaches and pitchers talk about direction without needing a raw tracking display.',
          'reputable-analysis',
          {
            label: 'Driveline Baseball: Mastering the Axis of Rotation',
            url: 'https://www.drivelinebaseball.com/2019/09/mastering-the-axis-of-rotation-a-thorough-review-of-spin-axis-in-three-dimensions/',
          },
        ),
        kc(
          'Tilt became a practical coaching language because it makes spin direction easier to picture and communicate.',
          'reputable-analysis',
          {
            label: 'Driveline Baseball: Mastering the Axis of Rotation',
            url: 'https://www.drivelinebaseball.com/2019/09/mastering-the-axis-of-rotation-a-thorough-review-of-spin-axis-in-three-dimensions/',
          },
        ),
      ],
    },
    {
      heading: 'Useful Spin Versus Gyro Feel',
      paragraphs: [
        'Some spin bends the pitch. Some spin mostly makes the ball hold its bullet-like orientation. A true gyro slider can feel firm and tight without showing much early shape, while a sweeper turns more of the hand around the side and shows a wider glove-side move.',
        'This matters at the grip level. If the ball is rolling off the outside edge of the fingers, the pitch will feel different than a ball that stays behind the fingers and leaves with backspin. The hand feel explains the shape before a dashboard ever does.',
        'The honest teaching move is to name the feel: behind it for ride, over it for drop, around it for sweep, through it for gyro.',
      ],
      claims: [
        kc(
          'Gyro spin rotates along the ball’s path and does less to create visible movement than spin that works across the path of flight.',
          'reputable-analysis',
          {
            label: 'Driveline Baseball: Spin Axis and Useful Spin',
            url: 'https://www.drivelinebaseball.com/2016/11/spin-rate-part-ii-spin-axis-useful-spin/',
          },
        ),
        kc(
          'Tracking systems separate spin that contributes to movement from spin that does not, but the coaching translation is still grip, axis, and release feel.',
          'official-data',
          {
            label: 'MLB.com Statcast Glossary, Active Spin',
            url: 'https://www.mlb.com/glossary/statcast/active-spin',
          },
        ),
      ],
    },
    {
      heading: 'Seams Can Add Their Own Wake',
      paragraphs: [
        'Seam-shifted wake is the reminder that the baseball is not a smooth sphere. Raised seams disturb airflow. When the grip presents those seams unevenly through the air, the ball can move in a direction that spin alone would not fully predict.',
        'That is why two sinkers with similar hand intent can still feel different. One seam presentation catches the air and runs. Another stays ordinary. The lesson is not to chase a secret formula; it is to test grip, pressure, and release until the ball shows the shape you can repeat.',
        'This is one of the best arguments for a grip-first atlas. Seam position starts in the hand.',
      ],
      claims: [
        kc(
          'Seam-shifted wake is a non-Magnus aerodynamic effect where seam orientation changes airflow and can help move the ball.',
          'reputable-analysis',
          {
            label: 'Driveline Baseball: The Impact of Seam-Shifted Wakes on Pitch Quality',
            url: 'https://www.drivelinebaseball.com/2021/03/the-impact-of-seam-shifted-wakes-on-pitch-quality/',
          },
        ),
        kc(
          'Sinkers can benefit from seam presentation that adds arm-side run and depth beyond the simple spin-only explanation.',
          'reputable-analysis',
          {
            label: 'Driveline Baseball: Seam-Shifted Wakes and Sinkers',
            url: 'https://www.drivelinebaseball.com/2020/11/more-than-what-it-seams-an-introduction-to-seam-shifted-wakes-and-their-effect-on-sinkers/',
          },
        ),
      ],
    },
    {
      heading: 'Translate Physics Back Into Cues',
      paragraphs: [
        'The physics words are only useful if they become throwing cues. “Stay behind it” means the fingers keep the ball on a fastball line. “Get around it” means the hand turns the axis toward sweep or run. “Kill it in the hand” means the grip adds surface area and resistance so the pitch arrives late.',
        'That is the atlas standard: sourced physics underneath, pitcher-owned feel on top. A grip page should help someone hold the ball, throw the ball, and recognize the shape honestly.',
        'If the pitch was not tracked here, the page does not pretend it was. It says what shape the grip is built to create and lets the source badge show where the physics language came from.',
      ],
      claims: [
        kc(
          'Pitch movement depends on both spin-driven force and seam-position effects, so grip and release have to be read together.',
          'reputable-analysis',
          {
            label: 'The Hardball Times: Pitch Movement, Spin Efficiency, and All That',
            url: 'https://tht.fangraphs.com/pitch-movement-spin-efficiency-and-all-that/',
          },
        ),
        kc(
          'Grip and finger pressure can alter axis and movement direction, which is why pitch design starts with a specific hand cue instead of a generic pitch name.',
          'coach-observed',
          {
            label: 'RPP Baseball: How Spin Axis Is Generated',
            url: 'https://rocklandpeakperformance.com/pitch-development-and-design-grips-spin-axis-and-movement/',
          },
        ),
      ],
    },
  ],
  confidenceNote:
    'Sourced from Driveline, MLB glossary material, The Hardball Times, and coaching-analysis sources. The wing translates spin and wake concepts into shape words and grip cues without publishing pitch-behavior figures.',
  related: [
    { label: 'Pitch Design', to: '/learn/pitch-design' },
    { label: 'Mechanics', to: '/learn/mechanics' },
    { label: 'Reading Models', to: '/learn/metrics' },
    { label: 'Shape Map', to: '/movement-map' },
  ],
}
