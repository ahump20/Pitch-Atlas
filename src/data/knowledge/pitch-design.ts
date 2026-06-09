import type { KnowledgeWing } from './types'
import { kc } from './claim'

/*
  Generated from the verified knowledge-wing research pass (2026-06-06): parallel
  sourced research with an adversarial citation re-check. Every claim carries a
  real, working source and a confidence tier; the prose is original teaching text.
*/
export const pitchDesignWing: KnowledgeWing = {
  slug: "pitch-design",
  navLabel: "Pitch Design",
  eyebrow: "The craft",
  title: "Pitch Design",
  summary: "How a pitch gets built: read the current shape, find the arsenal gap, change one grip cue, and validate against hitters.",
  sub: "The design loop starts with a pitcher-owned shape goal, tests one variable at a time, and checks whether that grip or release cue survives against live bats.",
  accent: "powder",
  educational: false,
  sections: [
    {
      heading: "The Design Loop",
      paragraphs: [
        "Pitch design is the iterative process of reading a pitch's current shape, identifying the missing lane in the arsenal, changing one mechanical variable, and validating against live bats. Unlike the old bullpen-only approach, it gives the pitcher a clear feedback loop: grip, throw, watch the shape, adjust.",
        "The sequence starts with a plain-language goal. Does the pitch need later ride, heavier arm-side run, sharper glove-side bite, softer fade, or more deadened tumble? Once the goal is named, the pitcher and coach test one thing at a time: grip depth, finger pressure, seam orientation, axis intent, or release feel.",
        "The change is surgical. A grip cue either moves the pitch toward the intended shape or it does not. Video and tracking can help, but the field-manual question remains the same: can the pitcher feel it, repeat it, and make a hitter respond to it?",
      ],
      claims: [
        kc("Edgertronic high-speed cameras record at 1,000 frames per second to reveal seam orientation and release point details", "official-data", { label: "SI.com: From Trackman to Edgertronic to Rapsodo, the Tech Boom Is Fundamentally Altering Baseball", url: "https://www.si.com/mlb/2019/03/29/technology-revolution-baseball-trackman-edgertronic-rapsodo" }),
        kc("The pitch design process involves measuring current shape, identifying gaps in the arsenal, changing one variable (grip, axis, seam orientation, or mechanical intent), re-measuring, and validating against hitters", "reputable-analysis", { label: "Driveline Baseball: Basics of Pitch Design Using Rapsodo", url: "https://www.drivelinebaseball.com/2017/04/basics-pitch-design-using-rapsodo/" }),
      ],
    },
    {
      heading: "Key Variables: Grip, Axis, Seam Orientation",
      paragraphs: [
        "Grip mechanics directly govern spin axis. The final finger to touch the baseball at release determines the axis direction; by shifting pressure across the fingers—typically loading more force on the inside edge of the index finger—a pitcher can tilt the axis and change break direction. Changing grip alone can turn a straight fastball into a cutting fastball or shift a slider's tilt toward more horizontal or vertical break.",
        "A practical grip-read starts with resistance. The four-seam is the least-resistance version: two loose fingers, shallow ball depth, clean fingertip exit. Changeups sit on the other end: more surface area, more fingers, deeper palm contact, and more hand pressure so the same fastball arm speed releases a slower ball instead of slinging it cleanly off the fingertips.",
        "Spin axis describes how the ball is rotating relative to the pitcher and hitter. In coach language, backspin rides, topspin drops, and side-tilt creates run or sweep. Two pitches can leave the hand with similar effort and still move differently because the axis and seam presentation are different.",
        "Seam orientation is the position of the baseball's seams relative to the spin axis. The seams act as microdetails that alter airflow around the ball, creating seam-shifted wake—an aerodynamic force beyond Magnus effect. Changing which seams are leading the rotation changes the pressure distribution and can add or subtract movement. Some pitchers benefit from extreme seam orientation (gaining extra run on sinkers); others see their pitches worsen (landing in ineffective zones where vertical and horizontal break become too similar).",
      ],
      claims: [
        kc("Spin axis is dictated by the final finger to touch the baseball, and shifting pressure can tilt the axis to change break direction", "coach-observed", { label: "RPP Baseball: Understanding How the Baseball Spin Axis is Generated", url: "https://rocklandpeakperformance.com/pitch-development-and-design-grips-spin-axis-and-movement/" }),
        kc("Seam-shifted wake occurs when altering seam orientation breaks the symmetry of the ball's wake, causing turbulence that generates additional force and movement beyond Magnus effect alone", "official-data", { label: "Rapsodo: Seam Shifted Wake Effect: What Is It and Why Does It Matter?", url: "https://rapsodo.com/blogs/baseball/seam-shifted-wake-effect-what-is-it-and-why-does-it-matter" }),
        kc("Sinkers can benefit from seam-shifted wake when seam presentation adds arm-side run and depth, while other pitch shapes may not benefit from the same effect.", "reputable-analysis", { label: "Driveline Baseball: The Impact of Seam-Shifted Wakes on Pitch Quality", url: "https://www.drivelinebaseball.com/2021/03/the-impact-of-seam-shifted-wakes-on-pitch-quality/" }),
      ],
    },
    {
      heading: "Arsenal Context: The Repertoire Effect",
      paragraphs: [
        "A pitch does not live in isolation. Its value depends on the pitches around it: timing contrast, release similarity, shape separation, and how well it fits the pitcher's arm slot. A slider that looks different out of the hand can give the hitter an early cue. A quieter slider can play better if it separates late.",
        "Driveline's Mix+ and Match+ scoring systems evaluate pitches inside the full repertoire. The useful coaching translation is simple: some pitches should look alike early, some should separate late, and every added pitch has to solve a real problem in the mix.",
        "Research and scouting both point at the same lesson. A repertoire can play above the sum of its individual pitches when it creates uncertainty, timing disruption, and hard-to-read release windows.",
      ],
      claims: [
        kc("Driveline Baseball developed Mix+ and Match+ metrics to evaluate pitches within the context of a pitcher's entire repertoire, with Match+ measuring how similar pitches are at the hitter's decision point and Mix+ evaluating how distinct pitches are at release", "reputable-analysis", { label: "Driveline Baseball R&D Podcast and Sabersminar presentations on quantifying arsenal effects", url: "https://www.youtube.com/watch?v=OdL6dafOArc" }),
        kc("Many pitchers consistently outperform the sum of their individual pitch grades because their repertoires create deception, uncertainty, and timing disruption that individual stuff models cannot measure", "reputable-analysis", { label: "Urama Analytics: From Stuff to Strategy: Improving MLB Pitch Profiles and Optimizing Usage", url: "https://www.uramanalytics.com/post/from-stuff-to-strategy-improving-mlb-pitch-profiles-and-optimizing-usage" }),
      ],
    },
    {
      heading: "Measurement Technology Stack",
      paragraphs: [
        "Modern pitch design relies on layered feedback. Ball-tracking systems show flight and release information. High-speed video shows what the hand, fingers, and seams were doing at release. Biomechanical tools show whether the delivery can repeat the cue without putting the arm in a bad position.",
        "Those tools are useful because they make the conversation more specific. They do not replace the conversation. A pitcher still has to know what the grip feels like, what the intended shape is, and whether the pitch belongs with the rest of the arsenal.",
        "The loop is tight: change one cue, throw it, inspect the shape and release, then keep or discard the cue. The best design sessions do not chase novelty. They remove guesswork.",
      ],
      claims: [
        kc("Rapsodo describes seam-shifted wake by comparing the pitch's observed flight with a spin-only expectation, making seam presentation part of the design conversation.", "official-data", { label: "Rapsodo: Seam Shifted Wake Effect: What Is It and Why Does It Matter?", url: "https://rapsodo.com/blogs/baseball/seam-shifted-wake-effect-what-is-it-and-why-does-it-matter" }),
        kc("KinaTrax markerless motion capture systems operate at 300 fps standard with 600 fps capability available for capturing pitching kinematics without markers", "reputable-analysis", { label: "KinaTrax motion capture technology specifications", url: "https://www.kinatrax.com/kinatrax-motion-capture/" }),
        kc("Baseball Savant provides MLB Statcast pitch data and release information for public research, but this atlas translates those references into sourced shape prose.", "official-data", { label: "MLB Statcast Search CSV Documentation", url: "https://baseballsavant.mlb.com/csv-docs" }),
      ],
    },
    {
      heading: "Dedicated Pitch Design Facilities",
      paragraphs: [
        "Driveline Baseball and Tread Athletics are two major North American pitch design facilities. Driveline, headquartered in Seattle, helped popularize the modern pitch design method and publishes on grip mechanics, axis, seam orientation, and arsenal fit.",
        "Tread Athletics operates a 33,000 square foot facility in Pineville, North Carolina with in-person coaching, biomechanical analysis, and proprietary technology for pitch design. Tread's process accounts for an athlete's unique anatomy and leverages data to create and implement pitch shapes suited to live game conditions, not just bullpen parameters.",
        "Both facilities stress the validation phase: testing designed pitches in live at-bats with data collection and video analysis to confirm that bullpen gains translate to game performance. If results diverge from lab predictions, the design returns to the controlled setting to isolate variables and understand the gap. This is the honest constraint of pitch design—bullpen shape does not always equal game effectiveness.",
      ],
      claims: [
        kc("Tread Athletics operates a 33,000 square foot training facility in Pineville, North Carolina with in-person coaching, biomechanical analysis, and pitch design capabilities", "reputable-analysis", { label: "Tread Athletics: College Baseball Pitching Development", url: "https://treadathletics.com/college/" }),
        kc("Pitch design validation includes live at-bat testing with data collection and video analysis to confirm that bullpen results transfer to game performance", "reputable-analysis", { label: "PRP Baseball: Pitch Identity and Design with Rapsodo", url: "https://www.prpbaseball.com/blog/2018/6/29/pitch-identity-and-design-with-rapsodo" }),
      ],
    },
    {
      heading: "Honest Constraints and Hitter Adaptation",
      paragraphs: [
        "Not all changes translate from bullpen to game. A pitch that shows beautiful shape in a controlled session might not deceive hitters when thrown in a count that matters. Environment can also change how the ball carries, so validation against live hitters is non-negotiable.",
        "Seam-shifted wake illustrates the complexity. Some sinkers gain a better arm-side read from seam presentation. Other shapes do not. Context and individual arm mechanics matter more than any universal recipe.",
      ],
      claims: [
        kc("Environmental variables such as elevation, temperature, humidity, and barometric pressure affect ball movement and may change pitch profiles between training sites and games", "reputable-analysis", { label: "Rapsodo: Seam Shifted Wake Effect: What Is It and Why Does It Matter?", url: "https://rapsodo.com/blogs/baseball/seam-shifted-wake-effect-what-is-it-and-why-does-it-matter" }),
        kc("A large share of MLB pitches show lower quality when accounting for seam-shifted wake effects, suggesting that context matters more than universal optimization assumptions", "reputable-analysis", { label: "Driveline Baseball: The Impact of Seam-Shifted Wakes on Pitch Quality", url: "https://www.drivelinebaseball.com/2021/03/the-impact-of-seam-shifted-wakes-on-pitch-quality/" }),
        kc("Driveline and Tread Athletics are dedicated pitch-design facilities, and MLB organizations increasingly use ball tracking and high-speed video as part of development.", "reputable-analysis", { label: "SI.com: From Trackman to Edgertronic to Rapsodo, the Tech Boom Is Fundamentally Altering Baseball", url: "https://www.si.com/mlb/2019/03/29/technology-revolution-baseball-trackman-edgertronic-rapsodo" }),
      ],
    },
  ],
  confidenceNote: "Sourced from Driveline methodology, repertoire research, MLB Statcast documentation, Rapsodo, and facility materials. The grip-resistance paragraph is a coaching frame, not a measured claim. This route keeps the tools as context and translates the lesson into craft language.",
  related: [
    { label: "Spin & Movement", to: "/learn/spin" },
    { label: "Mechanics", to: "/learn/mechanics" },
    { label: "Metrics", to: "/learn/metrics" },
    { label: "Arsenal", to: "/repertoire" },
  ],
}
