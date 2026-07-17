import type { KnowledgeWing } from './types'
import { kc } from './claim'

/*
  A craft-first account of pitching sequence. The page describes observable motion
  and feel without turning biomechanics into a health or body-outcome claim.
*/
export const mechanicsWing: KnowledgeWing = {
  slug: 'mechanics',
  navLabel: 'Mechanics',
  eyebrow: 'The delivery',
  title: 'The Kinetic Chain: Motion from Ground to Hand',
  summary:
    'The pitch begins in the lower half, moves through the hips and trunk, and finishes at the hand. Sequence and timing make the delivery one connected motion.',
  sub:
    'Legs start the move, hips turn, the trunk follows, and the arm and hand finish it. Each segment passes momentum to the next; the order is the lesson.',
  accent: 'powder',
  educational: false,
  sections: [
    {
      heading: 'The chain: how motion travels',
      paragraphs: [
        'The kinetic chain is not a single arm move. It is a relay that begins when the back foot commits to the mound, gathers through the hips and trunk, and reaches the hand already moving fast.',
        'Think of a whip. The base starts the motion, the middle carries and speeds it up, and the tip releases it. The pitcher feels one connected move even though each segment reaches its fastest point at a different time.',
        'Four links are useful to watch: the lower half, the hips, the trunk and shoulder blade, then the arm and hand. Their order makes the delivery readable.',
      ],
      claims: [
        kc(
          'The kinetic chain coordinates muscle groups across the body and culminates in rapid upper-extremity motion.',
          'official-data',
          {
            label: 'The Kinetic Chain in Overhand Pitching: Its Potential Role for Performance Enhancement and Injury Prevention',
            url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3445080/',
          },
        ),
        kc(
          'Energy moves from larger proximal segments toward smaller distal segments, with each segment slowing as the next one accelerates.',
          'official-data',
          {
            label: 'The Kinetic Chain in Overhand Pitching',
            url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3445080/',
          },
        ),
      ],
    },
    {
      heading: 'Leg drive: the pitch starts in the ground',
      paragraphs: [
        'The first move comes from the drive leg pushing the body down the mound. The stride foot reaches toward the plate while the pelvis begins to move and turn.',
        'At foot contact, the lead knee is still flexed. It then firms as the trunk rotates over the front side. The feel is simple: the hips lead and the chest waits.',
      ],
      claims: [
        kc(
          'Stride length and lead-foot position contribute to how the delivery reaches foot contact.',
          'official-data',
          {
            label: "The Clinician's Guide to Baseball Pitching Biomechanics",
            url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9950989/',
          },
        ),
        kc(
          'Trail-hip rotational range relates to when the trunk begins rotating and how the body moves forward.',
          'official-data',
          {
            label: 'The Relationship Between Hip Range of Motion and Pitching Kinematics Related to Increased Elbow Valgus Loads in Collegiate Baseball Pitchers',
            url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8016430/',
          },
        ),
        kc(
          'The lead knee is flexed at foot contact and moves toward extension by release, creating a firm front side for trunk rotation.',
          'official-data',
          {
            label: "The Clinician's Guide to Baseball Pitching Biomechanics",
            url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9950989/',
          },
        ),
      ],
    },
    {
      heading: 'Hip-shoulder separation: the spring in the middle',
      paragraphs: [
        'At foot plant, the hips have started turning while the shoulders remain closed. That gap between pelvis rotation and upper-trunk rotation is hip-shoulder separation.',
        'The lower half leads, the trunk follows, and the hand arrives last. On video, the useful read is timing: when the pelvis starts, when the chest follows, and whether the release stays connected to both.',
        'Separation is not a number to copy from another pitcher. It is the visible space between two parts of one delivery, shaped by that pitcher’s own motion.',
      ],
      claims: [
        kc(
          'Hip-shoulder separation is the rotational difference between the pelvis and upper trunk.',
          'reputable-analysis',
          {
            label: 'Pitching Biomechanics: Understanding Hip Shoulder Separation',
            url: 'https://rocklandpeakperformance.com/pitching-biomechanics-hip-shoulder-separation/',
          },
        ),
        kc(
          'Hip-shoulder separation relates to trunk rotation and other pitching kinematics.',
          'official-data',
          {
            label: 'The Relationship of Range of Motion, Hip Shoulder Separation, and Pitching Kinematics',
            url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7727427/',
          },
        ),
      ],
    },
    {
      heading: 'Arm cocking: the last handoff before release',
      paragraphs: [
        'As the chest begins to rotate, the forearm lays back while the upper arm stays near shoulder height. Biomechanics calls the deepest point maximum external rotation.',
        'The position is one frame in a moving sequence, not a pose to hold. The trunk is already turning, the elbow is moving forward, and the hand is about to accelerate toward release.',
      ],
      claims: [
        kc(
          'Maximum external rotation marks the end of arm cocking, with the shoulder at the far point of external rotation and the elbow near shoulder height.',
          'official-data',
          {
            label: "The Clinician's Guide to Baseball Pitching Biomechanics",
            url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9950989/',
          },
        ),
        kc(
          'Shoulder internal rotation accelerates rapidly after maximum external rotation as the hand moves toward release.',
          'official-data',
          {
            label: "The Clinician's Guide to Baseball Pitching Biomechanics",
            url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9950989/',
          },
        ),
      ],
    },
    {
      heading: 'Wrist, fingers, and the shape the chain delivers',
      paragraphs: [
        'Everything before the hand built and aimed the motion. The wrist and fingers decide what spin leaves with it. This is where delivery meets grip.',
        'Arm slot describes the angle of the hand’s path at release. The trunk and shoulder establish that path; the fingers finish the ball from there.',
        'When the earlier sequence changes, release position and spin can change with it. Command and shape begin before the fingertips, even though the fingertips make the final mark.',
      ],
      claims: [
        kc(
          'Forearm and wrist action at release contribute to the spin and movement a pitch carries.',
          'official-data',
          {
            label: "The Clinician's Guide to Baseball Pitching Biomechanics",
            url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9950989/',
          },
        ),
        kc(
          'Arm slot and release point reflect the trunk and shoulder position delivered by the earlier sequence.',
          'official-data',
          {
            label: "The Clinician's Guide to Baseball Pitching Biomechanics",
            url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9950989/',
          },
        ),
        kc(
          'The wrist and fingers impart the final spin direction as the ball leaves the hand.',
          'reputable-analysis',
          {
            label: 'The Kinetic Chain in Overhand Pitching',
            url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3445080/',
          },
        ),
      ],
    },
    {
      heading: 'Release and finish: how the sequence completes',
      paragraphs: [
        'From deepest layback to release, the shoulder turns, the elbow extends, and the wrist and fingers carry the ball through the release window.',
        'After release, the arm continues across the body while the trunk folds over the front side. The finish is the last visible part of the same sequence, not a separate flourish.',
        'Film it as one connected motion: lead leg, pelvis, trunk, elbow, shoulder, hand, then the body moving through the finish.',
      ],
      claims: [
        kc(
          'The measured sequence runs from lead-knee bracing to pelvis rotation, upper-trunk rotation, elbow extension, and shoulder internal rotation.',
          'official-data',
          {
            label: "The Clinician's Guide to Baseball Pitching Biomechanics",
            url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9950989/',
          },
        ),
        kc(
          'The follow-through continues after release as the trunk flexes and the throwing arm decelerates across the body.',
          'official-data',
          {
            label: "The Clinician's Guide to Baseball Pitching Biomechanics",
            url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9950989/',
          },
        ),
      ],
    },
  ],
  confidenceNote:
    'The teaching here is sequence and observable motion, not a target angle or body outcome. The cited biomechanics literature supports the order and vocabulary; the prose keeps measured figures in their sources instead of turning them into universal instructions.',
  related: [
    { label: 'Spin & Shape', to: '/learn/spin' },
    { label: 'Pitch Design', to: '/learn/pitch-design' },
    { label: 'Health & Workload Boundary', to: '/learn/arm-health' },
    { label: 'Youth Training Boundary', to: '/learn/youth' },
  ],
}
