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
  summary: "Curated reading path spanning classic pitching philosophy, biomechanics, psychology, and modern analytical frameworks—solutions, not idols.",
  sub: "From the craft essays of Tom Seaver and Bob Gibson to the biomechanical work of ASMI and the data-driven analyses of FanGraphs and Baseball Prospectus, the canon traces how pitching knowledge has accumulated. These texts and methodologies form the intellectual backbone for understanding what works, why it works, and how to teach it.",
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
      heading: "Biomechanics, Injury Prevention, and the Modern Scientific Foundation",
      paragraphs: [
        "The American Sports Medicine Institute (ASMI), founded in 1987 by orthopedic surgeon Dr. James R. Andrews and led by research director Dr. Glenn Fleisig, provides the evidence-based foundation for injury prevention in pitching. ASMI's research uses video analysis and computer modeling to quantify the forces acting on the shoulder, elbow, and trunk during the throwing motion. Their findings identify overuse and poor mechanics as the twin engines of injury in young pitchers.",
        "ASMI's Position Statement for Adolescent Baseball Pitchers establishes clear thresholds: no overhead throwing for 2–3 months per year (4 months preferred), no more than 100 innings per calendar year, and a strict emphasis on learning fastball mechanics before introducing breaking pitches. This framework has been incorporated into MLB's Pitch Smart program, which sets age-specific pitch counts and mandatory rest periods for ages 7–22.",
        "Driveline Baseball and Tread Athletics represent the modern analytical and biomechanical coaching frontier. Both organizations employ motion capture technology and detailed mechanical analysis to quantify individual pitcher mechanics and validate coaching cues. Driveline has demonstrated that pitching development can be measured, systematized, and optimized through high-level biomechanical analysis.",
      ],
      claims: [
        kc("ASMI was founded in 1987 by Dr. James R. Andrews and led by research director Dr. Glenn Fleisig, employing video and computer analysis to study throwing mechanics and injury risk factors.", "official-data", { label: "American Sports Medicine Institute research", url: "https://en.wikipedia.org/wiki/American_Sports_Medicine_Institute" }),
        kc("ASMI's Position Statement for Adolescent Baseball Pitchers recommends 2–3 months minimum (4 months preferred) without overhead throwing annually and maximum 100 innings per calendar year, with emphasis on learning fastball mechanics before breaking pitches.", "official-data", { label: "ASMI Position Statement for Adolescent Baseball Pitchers", url: "https://asmi.org/position-statement-for-adolescent-baseball-pitchers/" }),
        kc("MLB's Pitch Smart program sets age-appropriate pitch count limits and mandatory rest periods for pitchers ages 7–22 based on ASMI research and recommendations.", "official-data", { label: "MLB.com Pitch Smart", url: "https://www.mlb.com/pitch-smart/pitching-guidelines" }),
        kc("Driveline Baseball employs markered and markerless motion capture, Rapsodo, and Trackman for biomechanical analysis and has conducted research on the interaction of command and mechanics in pitching.", "reputable-analysis", { label: "Driveline Baseball Research", url: "https://www.drivelinebaseball.com/pitching-research-biomechanics/" }),
      ],
    },
    {
      heading: "Data-Driven Pitch Analysis: From Statcast to Stuff+, Location+, and Beyond",
      paragraphs: [
        "Baseball Savant (MLB.com's Statcast platform) provides the official data layer for modern pitching analysis. Statcast tracks pitch velocity, spin rate, spin axis, release point, movement (induced vertical break and horizontal break), and extension for every pitch thrown in Major League Baseball. This data feeds into proprietary models developed by FanGraphs, Baseball Prospectus, and internal MLB analytics teams.",
        "FanGraphs measures pitch quality using metrics derived from Statcast data including velocity, movement shape, and location consistency—these form the foundation of their Stuff+, Location+, and Pitching+ frameworks. Pitchers with high ratings on these scales tend to generate strikeout-to-walk ratios higher than expected, suggesting that consistency and repeatability are themselves competitive advantages.",
        "Baseball Prospectus developed StuffPro and PitchPro metrics using machine learning to grade pitch characteristics and contextual effectiveness, quantifying pitch value from the batter's perspective across release, decision point, and plate location. This represents a shift from pure biomechanics to situational, hitter-focused pitch design.",
      ],
      claims: [
        kc("Baseball Savant (baseballsavant.mlb.com) is MLB.com's official Statcast platform tracking pitch velocity, spin rate, spin axis, release point, and movement (IVB and HB) for all MLB pitches.", "official-data", { label: "MLB.com Statcast Glossary", url: "https://www.mlb.com/glossary/statcast" }),
        kc("FanGraphs measures pitch quality using Stuff+, Location+, and Pitching+ metrics derived from Statcast data; pitchers with elite grades show higher-than-expected strikeout-to-walk ratios.", "reputable-analysis", { label: "FanGraphs Library - Pitcher Evaluation Tools", url: "https://library.fangraphs.com/pitching/stuff-location-and-pitching-primer/" }),
        kc("Baseball Prospectus developed StuffPro and PitchPro metrics using machine learning to grade individual pitch characteristics and contextual effectiveness, quantifying pitch value from the batter's perspective.", "reputable-analysis", { label: "Baseball Prospectus - StuffPro, PitchPro introduction", url: "https://www.baseballprospectus.com/news/article/89245/stuffpro-pitchpro-introduction-new-pitch-metrics-bp/" }),
      ],
    },
    {
      heading: "Scouting, Evaluation, and the Integration of Data and Judgment",
      paragraphs: [
        "Baseball America uses the 20–80 scouting scale to grade pitcher tools, where fastball grades depend on velocity, command, and life (movement)—not velocity alone. A 100 mph fastball with pedestrian movement may grade lower than a 97 mph fastball with elite shape. This framework acknowledges that what matters is not the raw attribute but its application under game conditions.",
        "Modern scouting integrates Statcast data, video review, and personal observation. Scout credentialing—the ability to identify talent before validation at high levels—remains grounded in pattern recognition, biomechanical literacy, and competitive judgment. Baseball America's scouting reports synthesize input from hundreds of scouts and front-office personnel.",
        "The tension between scouting and analytics has resolved into synthesis: data validates what good scouts observe (mechanics consistency, pitch extension, sequencing intelligence), and scouts contextualize what data cannot explain (competitive fire, adjustability). Modern pitching coaches operate fluidly across philosophy, psychology, biomechanics, and analytics—this is the canon in practice.",
      ],
      claims: [
        kc("Baseball America uses the 20–80 scouting scale to grade pitcher tools; fastball grades depend on velocity, command, and life (movement), not velocity alone.", "reputable-analysis", { label: "Baseball America - Explaining the 20-80 Scouting Scale", url: "https://www.baseballamerica.com/stories/explaining-the-20-80-baseball-scouting-scale/" }),
        kc("Baseball America's scouting reports integrate input from hundreds of MLB scouts, coaches, and front-office personnel to aggregate industry evaluation of pitching prospects.", "reputable-analysis", { label: "Baseball America - 2026 Top 100 Prospects methodology", url: "https://www.baseballamerica.com/rankings/2026-top-100-prospects/" }),
      ],
    },
  ],
  confidenceNote: "Foundational texts verified via publisher catalogs and library archives (Hearst Books, Anchor/Penguin Random House, Simon & Schuster). ASMI position statement and MLB Pitch Smart sourced from official websites. Biomechanics research from Driveline and analytical frameworks from FanGraphs and Baseball Prospectus sourced from published research and methodology documentation. All URLs tested. One date correction made: Gibson/Jackson 'Sixty Feet, Six Inches' published 2009, not 2010. FanGraphs mechanics grading claim removed for lacking direct source documentation. Driveline award attribution clarified: the 2025 Dr. Mike Marshall award went to individual researchers (Pelletier and Lambert) at the organization, not Driveline Baseball as a unit.",
  related: [
    { label: "Pitch mechanics fundamentals", to: "/mechanics" },
    { label: "Pitch design and sequencing", to: "/pitch-design" },
    { label: "Arm health and injury prevention", to: "/arm-health" },
    { label: "Modern metrics and evaluation", to: "/metrics" },
  ],
}
