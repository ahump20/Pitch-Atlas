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
  summary: "How a pitch gets built: measure current shape, find the gap, change one variable, re-measure, validate against hitters.",
  sub: "The iterative process of measuring a pitch's current shape, identifying gaps in the arsenal, testing one variable (grip, axis, seam orientation, intent), re-measuring, and validating against hitters—compressed from months into weeks through data and high-speed video feedback loops.",
  accent: "powder",
  educational: false,
  sections: [
    {
      heading: "The Design Loop",
      paragraphs: [
        "Pitch design is the iterative process of measuring a pitch's current shape, identifying gaps in the arsenal or ineffective zones against hitters, changing one mechanical variable, re-measuring, and validating against live bats. Unlike traditional pitch development—which emphasizes throwing enough bullpens until something sticks—pitch design closes the feedback loop through data and high-speed video, compressing the testing timeline from months to weeks.",
        "The sequence begins with measurement: TrackMan and Hawk-Eye (MLB Statcast) capture velocity, movement, spin rate, and spin axis. High-speed cameras (Edgertronic at 1,000 fps) reveal release point and seam orientation frame-by-frame. Once current shape is known, a pitcher and coach identify what the arsenal is missing—empty zones in movement profile, pitches that occupy the same release window as a primary offering, or movement shapes that favor hitters instead of the pitcher.",
        "The change is surgical. Grip adjustments, seam orientation (how the seams align relative to spin), axis tweaks, or mechanical intent are tested in isolation. The pitch is re-measured immediately, video is reviewed, and the data is compared to baseline. If the change moved the pitch toward the goal—sharper break, better separation from fastball, more induced vertical rise—it sticks. If not, another variable is tested. This tight feedback loop prevents the guesswork that traditionally delays pitch maturity.",
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
        "Spin axis—measured in degrees from 0 to 360—describes the orientation of the spin relative to the pitcher's arm side and the batter. A 180° axis represents pure backspin (typical 4-seam fastball), while 0° is pure topspin (curveball). Movement profiles are determined not by spin rate alone but by spin axis, effective transverse spin, seam effects, and release location. Two pitches with identical spin rate but different axes will move very differently.",
        "Seam orientation is the position of the baseball's seams relative to the spin axis. The seams act as microdetails that alter airflow around the ball, creating seam-shifted wake—an aerodynamic force beyond Magnus effect. Changing which seams are leading the rotation changes the pressure distribution and can add or subtract movement in inches. Some pitchers benefit from extreme seam orientation (gaining 3+ inches of run on sinkers); others see their pitches worsen (landing in ineffective zones where vertical and horizontal break become too similar).",
      ],
      claims: [
        kc("Spin axis is dictated by the final finger to touch the baseball, and shifting pressure can tilt the axis to change break direction", "coach-observed", { label: "RPP Baseball: Understanding How the Baseball Spin Axis is Generated", url: "https://rocklandpeakperformance.com/pitch-development-and-design-grips-spin-axis-and-movement/" }),
        kc("Seam-shifted wake occurs when altering seam orientation breaks the symmetry of the ball's wake, causing turbulence that generates additional force and movement beyond Magnus effect alone", "official-data", { label: "Rapsodo: Seam Shifted Wake Effect: What Is It and Why Does It Matter?", url: "https://rapsodo.com/blogs/baseball/seam-shifted-wake-effect-what-is-it-and-why-does-it-matter" }),
        kc("Sinkers benefit dramatically from seam-shifted wake, gaining over 3 inches of horizontal run and nearly 4 inches of additional drop on average, while about 42% of MLB pitches actually show lower quality when accounting for SSW effects", "reputable-analysis", { label: "Driveline Baseball: The Impact of Seam-Shifted Wakes on Pitch Quality", url: "https://www.drivelinebaseball.com/2021/03/the-impact-of-seam-shifted-wakes-on-pitch-quality/" }),
      ],
    },
    {
      heading: "Arsenal Context: The Repertoire Effect",
      paragraphs: [
        "A pitch does not live in isolation. Its value depends on the pitches surrounding it—velocity separation, movement separation at release, and how well it fits the pitcher's arm slot and release mechanics. A slider that is excellent in isolation may be worthless if it looks identical to the fastball as it leaves the pitcher's hand, giving hitters a clear separation cue. Conversely, a pedestrian slider can become devastating if it separates cleanly from a dominant fastball only late in flight, forcing late decisions.",
        "Driveline's Mix+ and Match+ scoring systems evaluate pitches within the context of the full repertoire. Match+ measures how similar pitches are coming out of the pitcher's hand (hitter's decision point); Mix+ evaluates how distinct pitches are at release. The goal of pitch design is not to maximize one pitch in a vacuum but to create a repertoire where pitches occupy different release windows, velocity bands, and late-movement profiles to maximize hitter uncertainty.",
        "Research shows that many pitchers consistently outperform the sum of their individual pitch grades because their repertoires create deception and timing disruption that single-pitch grades cannot measure. Baseball Prospectus's arsenal metrics incorporate pitch type probability, movement spread, velocity spread, and a surprise factor—how observed pitch movement compares to hitter expectations.",
      ],
      claims: [
        kc("Driveline Baseball developed Mix+ and Match+ metrics to evaluate pitches within the context of a pitcher's entire repertoire, with Match+ measuring how similar pitches are at the hitter's decision point and Mix+ evaluating how distinct pitches are at release", "reputable-analysis", { label: "Driveline Baseball R&D Podcast and Sabersminar presentations on quantifying arsenal effects", url: "https://www.youtube.com/watch?v=OdL6dafOArc" }),
        kc("Many pitchers consistently outperform the sum of their individual pitch grades because their repertoires create deception, uncertainty, and timing disruption that individual stuff models cannot measure", "reputable-analysis", { label: "Urama Analytics: From Stuff to Strategy: Improving MLB Pitch Profiles and Optimizing Usage", url: "https://www.uramanalytics.com/post/from-stuff-to-strategy-improving-mlb-pitch-profiles-and-optimizing-usage" }),
      ],
    },
    {
      heading: "Measurement Technology Stack",
      paragraphs: [
        "Modern pitch design relies on a layered tech stack, each tool providing different data. TrackMan and Hawk-Eye (Statcast) capture full ball flight in MLB stadiums. Rapsodo (portable, ground-based 14 feet from home plate) measures spin rate, velocity, and movement on demand in bullpens or practice facilities; Rapsodo PRO 3.0 units also record seam-shifted wake by comparing actual movement to theoretically predicted movement based on spin alone. Edgertronic high-speed cameras (1,000 fps) freeze release mechanics and seam orientation, revealing how finger pressure and release point dictate spin axis.",
        "For biomechanics, markerless motion capture systems (KinaTrax, 300 fps standard with 600 fps capability available) extract 3D joint location, bone segment orientation, elbow valgus torque, and shoulder rotation angle without markers. Force plates measure ground reaction forces, informing kinetic chain contribution. Baseball Savant (powered by Statcast) provides official MLB pitch data—velocity, movement, spin rate, release point, extension, and predictive metrics like expected ERA—available through CSV downloads and API.",
        "The iterative loop is tight because each tool provides immediate feedback. A pitcher changes grip, throws 10 pitches into Rapsodo, watches the movement profile update in real-time, reviews the high-speed video of release, adjusts again, and re-measures. This eliminates weeks of guesswork.",
      ],
      claims: [
        kc("Rapsodo PRO 3.0 enables seam-shifted wake measurement by observing pitch trajectory and analyzing actual movement versus theoretically predicted movement based on spin alone", "official-data", { label: "Rapsodo: Seam Shifted Wake Effect: What Is It and Why Does It Matter?", url: "https://rapsodo.com/blogs/baseball/seam-shifted-wake-effect-what-is-it-and-why-does-it-matter" }),
        kc("KinaTrax markerless motion capture systems operate at 300 fps standard with 600 fps capability available for capturing pitching kinematics without markers", "reputable-analysis", { label: "KinaTrax motion capture technology specifications", url: "https://www.kinatrax.com/kinatrax-motion-capture/" }),
        kc("Baseball Savant (Statcast) provides official MLB pitch metrics including velocity, movement, spin rate, release point, and extension available through CSV and API", "official-data", { label: "MLB Statcast Search CSV Documentation", url: "https://baseballsavant.mlb.com/csv-docs" }),
      ],
    },
    {
      heading: "Dedicated Pitch Design Facilities",
      paragraphs: [
        "Driveline Baseball and Tread Athletics are the dominant North American pitch design facilities. Driveline, headquartered in Seattle, pioneered the modern pitch design methodology and publishes extensively on their Stuff+ framework and recent research into arsenal-based evaluation. Their curriculum spans the fundamentals—how spin axis is generated, grip mechanics, seam orientation, and movement tradeoffs—through advanced arsenal optimization.",
        "Tread Athletics operates a 33,000 square foot facility in Pineville, North Carolina with in-person coaching, biomechanical analysis, and proprietary technology for pitch design. Tread's process accounts for an athlete's unique anatomy and leverages data to create and implement pitch shapes suited to live game conditions, not just bullpen parameters.",
        "Both facilities emphasize the validation phase: testing designed pitches in live at-bats with data collection and video analysis to confirm that bullpen gains translate to game performance. If results diverge from lab predictions, the design returns to the controlled setting to isolate variables and understand the gap. This is the honest constraint of pitch design—bullpen shape does not always equal game effectiveness.",
      ],
      claims: [
        kc("Tread Athletics operates a 33,000 square foot training facility in Pineville, North Carolina with in-person coaching, biomechanical analysis, and pitch design capabilities", "reputable-analysis", { label: "Tread Athletics: College Baseball Pitching Development", url: "https://treadathletics.com/college/" }),
        kc("Pitch design validation includes live at-bat testing with data collection and video analysis to confirm that bullpen results transfer to game performance", "reputable-analysis", { label: "PRP Baseball: Pitch Identity and Design with Rapsodo", url: "https://www.prpbaseball.com/blog/2018/6/29/pitch-identity-and-design-with-rapsodo" }),
      ],
    },
    {
      heading: "Honest Constraints and Hitter Adaptation",
      paragraphs: [
        "Not all changes translate from bullpen to game. A pitch that shows brilliant shape on Rapsodo might not deceive hitters when thrown at full effort in a count that matters. Environmental variables—elevation, temperature, humidity, barometric pressure—affect aerodynamics and change movement profiles between training sites. A pitch designed at sea level may play differently at 5,000 feet. This is why validation against live hitters, across venues, is non-negotiable.",
        "Seam-shifted wake illustrates complexity. While sinkers benefit dramatically from SSW (adding 3+ inches of movement on average), approximately 42% of MLB pitches show lower quality when accounting for SSW effects, suggesting that context and individual arm mechanics matter more than assuming a universal optimization path. Pitch design is individualized craft, not recipe application.",
      ],
      claims: [
        kc("Environmental variables such as elevation, temperature, humidity, and barometric pressure affect ball movement and may change pitch profiles between training sites and games", "reputable-analysis", { label: "Rapsodo: Seam Shifted Wake Effect: What Is It and Why Does It Matter?", url: "https://rapsodo.com/blogs/baseball/seam-shifted-wake-effect-what-is-it-and-why-does-it-matter" }),
        kc("Approximately 42% of MLB pitches show lower quality when accounting for seam-shifted wake effects, suggesting that context matters more than universal optimization assumptions", "reputable-analysis", { label: "Driveline Baseball: The Impact of Seam-Shifted Wakes on Pitch Quality", url: "https://www.drivelinebaseball.com/2021/03/the-impact-of-seam-shifted-wakes-on-pitch-quality/" }),
      ],
      pullStat: { label: "Facility Adoption", claim: kc("Driveline and Tread Athletics are the primary dedicated pitch design facilities in North America; dozens of MLB teams now operate in-house pitch design labs with TrackMan, Rapsodo, and high-speed video", "reputable-analysis", { label: "SI.com: From Trackman to Edgertronic to Rapsodo, the Tech Boom Is Fundamentally Altering Baseball", url: "https://www.si.com/mlb/2019/03/29/technology-revolution-baseball-trackman-edgertronic-rapsodo" }) },
    },
  ],
  confidenceNote: "Sourced from Driveline Baseball methodology, Baseball Prospectus arsenal research, and official MLB Statcast documentation. Seam-shifted wake claims from Driveline peer-reviewed analysis and equipment manufacturers (Rapsodo). Facility information from direct operator documentation. Not all pitch design methods have controlled outcome studies; most rely on coaching observation and proprietary analytics models. TrackMan accuracy specifications and RPE/intent claims from original draft could not be verified against cited sources and have been removed.",
  related: [
    { label: "Spin & Movement", to: "/spin" },
    { label: "Mechanics", to: "/mechanics" },
    { label: "Metrics", to: "/metrics" },
    { label: "Arsenal", to: "/repertoire" },
  ],
}
