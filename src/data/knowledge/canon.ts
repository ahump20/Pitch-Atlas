import type { KnowledgeWing } from './types'
import { kc } from './claim'

/*
  Generated from the verified knowledge-wing research pass (2026-06-06): parallel
  sourced research with an adversarial citation re-check. Every claim carries a
  real, working source and a confidence tier; the prose is original teaching text.
*/
export const canonWing: KnowledgeWing = {
  slug: "canon",
  navLabel: "The Canon",
  eyebrow: "The lineage",
  title: "The Canon: Foundational Texts and Thought Lineages in Pitching",
  summary: "A curated reading path through classic pitching philosophy, mental routines, measurement, scouting, and modern analytical language. Solutions, not idols.",
  sub: "From the craft writing of Tom Seaver and Bob Gibson to motion capture, Statcast, FanGraphs, and Baseball Prospectus, the canon traces how pitching knowledge has accumulated and how its vocabulary changed.",
  accent: "powder",
  educational: false,
  sections: [
    {
      heading: "The Classic Craft: Seaver, Gibson, and the Lineage of Pitching Thought",
      paragraphs: [
        "Tom Seaver's 'The Art of Pitching' (1984) stands as the foundational pedagogical text for how the game is taught. Written with sports writer Lee Lowenfish and published by Hearst Books, Seaver's book addresses the challenge of pitching through mechanical preparation, pitch taxonomy (fastballs, breaking pitches, changeups), and the broader artistry of the craft. It remains a reference point for how coaches articulate fastball mechanics, breaking-ball sequencing, and the psychological resilience required at the highest level.",
        "Bob Gibson and Reggie Jackson's 'Sixty Feet, Six Inches' (2009), co-written with Lonnie Wheeler and published by Anchor, offers a rare dialogue between a Hall of Fame pitcher and a Hall of Fame hitter. Rather than a traditional memoir, the book functions as a collaborative masterclass in how the pitcher-batter dynamic shapes the game. Gibson's voice—direct, tactical, and steeped in the mental pressure of elite performance—articulates the competitive framework within which all pitch design and execution must operate.",
        "These texts form an intellectual lineage not because they are comprehensive technical manuals, but because they articulate durable principles: the marriage of mechanics and artistry, the non-negotiable importance of mental discipline, and the recognition that pitching is fundamentally a competitive act performed in isolation.",
      ],
      claims: [
        kc("Tom Seaver's 'The Art of Pitching' was published by Hearst Books in 1984 and covers fastball mechanics, breaking pitches, changeups, and defensive coordination.", "official-data", { label: "Internet Archive - Hearst Books catalog", url: "https://archive.org/details/artofpitching0000seav" }),
        kc("Bob Gibson and Reggie Jackson's 'Sixty Feet, Six Inches' (2009, Anchor) is a dialogue between pitcher and hitter on mechanics, psychology, and baseball culture, co-written with Lonnie Wheeler.", "official-data", { label: "Penguin Random House - Publisher catalog", url: "https://www.penguinrandomhouse.com/books/59601/sixty-feet-six-inches-by-bob-gibson-and-reggie-jackson-with-lonnie-wheeler/" }),
        kc("Gay Talese's 'The Silent Season of a Hero' appeared in Esquire (July 1966) as a profile of Joe DiMaggio based on direct observation rather than interview, exemplifying a model of sports journalism focused on human character and vulnerability.", "official-data", { label: "Random House (collected essays)", url: "https://www.randomhouse.com/kvpa/talese/essays/dimaggio.html" }),
      ],
    },
    {
      heading: "Mental Mechanics: Dorfman and the Psychology of Performance Under Pressure",
      paragraphs: [
        "H.A. Dorfman's 'The Mental Game of Baseball' (1989, co-authored with Karl Kuehl) and 'The Mental ABC's of Pitching' represent a critical inflection point in pitching pedagogy: the systematic study of how attention, routine, and emotional regulation affect pitch execution. Dorfman worked as a mental skills consultant with MLB organizations and trained Hall of Famers including Greg Maddux, Roy Halladay, and Bob Welch. His central insight—that on-field distractions cause anxiety and that anxiety can be managed through learned mental skills and pre-pitch routines—became foundational to modern coaching.",
        "Dorfman's approach differs fundamentally from generic motivational advice. It is behaviorally specific: he teaches pitchers to develop stable pre-pitch routines, to recognize and interrupt anxiety spirals, and to distinguish between controllable elements (release point, breathing) and uncontrollable ones (umpire calls, weather). This framework remains the gold standard in mental skills coaching for pitchers and has influenced every major pitching development organization.",
      ],
      claims: [
        kc("H.A. Dorfman's 'The Mental Game of Baseball: A Guide to Peak Performance' was published in 1989 (co-authored with Karl Kuehl) and is considered the classic guide to mental mechanics in baseball.", "official-data", { label: "Simon & Schuster - Publisher catalog", url: "https://www.simonandschuster.com/books/The-Mental-Game-of-Baseball/H-A-Dorfman/9781630761820" }),
        kc("Dorfman also authored 'The Mental ABC's of Pitching: A Handbook for Performance Enhancement,' covering 80 topics on mental skills for pitchers.", "official-data", { label: "Amazon catalog", url: "https://www.amazon.com/Mental-ABCs-Pitching-Performance-Enhancement/dp/1888698292" }),
        kc("Dorfman worked as a mental skills consultant with MLB organizations and trained Hall of Famers including Greg Maddux, Roy Halladay, and Bob Welch, earning World Series rings with the 1989 Oakland A's and 1997 Florida Marlins.", "reputable-analysis", { label: "Sports Illustrated and Wikipedia", url: "https://en.wikipedia.org/wiki/Harvey_Dorfman" }),
      ],
    },
    {
      heading: "Biomechanics and the modern measurement lineage",
      paragraphs: [
        "High-speed video and motion capture changed the language of pitching instruction. A delivery could be compared frame by frame, with the pelvis, trunk, arm, hand, and release described as one timed sequence instead of a collection of poses.",
        "Driveline Baseball and Tread Athletics helped bring those tools into modern pitch development alongside ball tracking and high-speed release video. Their place in the canon comes from the vocabulary they spread: sequence, release, seam presentation, shape, and arsenal fit.",
        "Pitch Atlas uses that vocabulary to describe craft. It does not turn a measurement system into a universal body target or personal training program.",
      ],
      claims: [
        kc("Driveline Baseball uses motion capture, Rapsodo, and Trackman in its published pitching research and development work.", "reputable-analysis", { label: "Driveline Baseball Research", url: "https://www.drivelinebaseball.com/pitching-research-biomechanics/" }),
        kc("Tread Athletics operates an in-person pitch-design facility with ball tracking, high-speed video, and biomechanical analysis.", "reputable-analysis", { label: "Tread Athletics: College Baseball Pitching Development", url: "https://treadathletics.com/college/" }),
      ],
    },
    {
      heading: "Data-Driven Pitch Analysis: From Statcast to Model Language",
      paragraphs: [
        "Baseball Savant, MLB.com's Statcast platform, provides the official public data layer for modern pitching analysis. It gives analysts a shared language for release, shape, location, and pitch identity. Pitch Atlas treats that language as source context, not as permission to publish fabricated measurements for untracked grips.",
        "FanGraphs, Baseball Prospectus, and team analysts build model language on top of that tracked data. Those models can sharpen scouting questions, but they do not replace the grip story: how the ball is held, how it leaves the hand, and what shape the pitcher is trying to create.",
        "Baseball Prospectus developed StuffPro and PitchPro metrics using machine learning to grade pitch characteristics and contextual effectiveness, quantifying pitch value from the batter's perspective across release, decision point, and plate location. This represents a shift from pure biomechanics to situational, hitter-focused pitch design.",
      ],
      claims: [
        kc("Baseball Savant is MLB.com's official Statcast platform and public reference layer for modern pitch data.", "official-data", { label: "MLB.com Statcast Glossary", url: "https://www.mlb.com/glossary/statcast" }),
        kc("FanGraphs publishes Stuff+, Location+, and Pitching+ as model language derived from public pitch data and context.", "reputable-analysis", { label: "FanGraphs Library - Pitcher Evaluation Tools", url: "https://library.fangraphs.com/pitching/stuff-location-and-pitching-primer/" }),
        kc("Baseball Prospectus developed StuffPro and PitchPro metrics using machine learning to grade individual pitch characteristics and contextual effectiveness, quantifying pitch value from the batter's perspective.", "reputable-analysis", { label: "Baseball Prospectus - StuffPro, PitchPro introduction", url: "https://www.baseballprospectus.com/news/article/89245/stuffpro-pitchpro-introduction-new-pitch-metrics-bp/" }),
      ],
    },
    {
      heading: "Scouting, Evaluation, and the Integration of Data and Judgment",
      paragraphs: [
        "Baseball America uses the traditional scouting scale to grade pitcher tools, where fastball grades depend on power, command, and life, not raw force alone. A harder fastball with ordinary shape may grade lower than a livelier pitch that plays better in games. This framework acknowledges that what matters is not the raw attribute but its application under game conditions.",
        "Modern scouting integrates Statcast data, video review, and personal observation. Scout credentialing—the ability to identify talent before validation at high levels—remains grounded in pattern recognition, biomechanical literacy, and competitive judgment. Baseball America's scouting reports synthesize input from hundreds of scouts and front-office personnel.",
        "The tension between scouting and analytics has resolved into synthesis: data validates what good scouts observe (mechanics consistency, pitch extension, sequencing intelligence), and scouts contextualize what data cannot explain (competitive fire, adjustability). Modern pitching coaches operate fluidly across philosophy, psychology, biomechanics, and analytics—this is the canon in practice.",
      ],
      claims: [
        kc("Baseball America uses the traditional scouting scale to grade pitcher tools, with fastball reads depending on power, command, and life rather than raw power alone.", "reputable-analysis", { label: "Baseball America - Explaining the Scouting Scale", url: "https://www.baseballamerica.com/stories/explaining-the-20-80-baseball-scouting-scale/" }),
        kc("Baseball America's scouting reports integrate input from hundreds of MLB scouts, coaches, and front-office personnel to aggregate industry evaluation of pitching prospects.", "reputable-analysis", { label: "Baseball America - 2026 Top 100 Prospects methodology", url: "https://www.baseballamerica.com/rankings/2026-top-100-prospects/" }),
      ],
    },
  ],
  confidenceNote: "Foundational texts were verified through publisher catalogs and library archives. Modern measurement sources come from published facility materials; analytical frameworks come from FanGraphs and Baseball Prospectus methodology pages. One date correction remains recorded: Gibson and Jackson's 'Sixty Feet, Six Inches' was published in 2009, not 2010.",
  related: [
    { label: "Pitch mechanics fundamentals", to: "/learn/mechanics" },
    { label: "Pitch design and sequencing", to: "/learn/pitch-design" },
    { label: "Safety source record", to: "/learn/arm-health" },
    { label: "Reading models", to: "/learn/metrics" },
  ],
}
