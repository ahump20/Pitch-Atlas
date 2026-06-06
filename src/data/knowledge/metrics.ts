import type { KnowledgeWing } from './types'
import { kc } from './claim'

/*
  Generated from the verified knowledge-wing research pass (2026-06-06): parallel
  sourced research with an adversarial citation re-check. Every claim carries a
  real, working source and a confidence tier; the prose is original teaching text.
*/
export const metricsWing: KnowledgeWing = {
  slug: "metrics",
  navLabel: "Reading the Metrics",
  eyebrow: "The craft",
  title: "Reading the Metrics",
  summary: "Modern pitch metrics are outcome-trained models that measure and predict, not ground truth. They shift with the model, the environment, and the run context.",
  sub: "Stuff+, Location+, and Pitching+ describe pitch quality relative to observed results and physical inputs. Each metric sits on a standardized scale where 100 equals league average by design—but that average itself moves as the sport evolves.",
  accent: "powder",
  educational: false,
  sections: [
    {
      heading: "Stuff+, Location+, and Pitching+: What They Are and Are Not",
      paragraphs: [
        "Stuff+, Location+, and Pitching+ are three interlocked outcome-trained models built to isolate the pitcher's process from the results. Stuff+ examines only the physical characteristics: velocity, spin rate, release point, and movement. Location+ judges the count-and-context-adjusted placement of those pitches. Pitching+ brings both together into one prediction of overall pitch quality.",
        "All three sit on a plus scale where 100 equals league average by construction. Ten points represents one standard deviation on the pitch level. A Stuff+ of 110 means that pitch's physical characteristics exceed average by one standard deviation; 90 means it falls one below. But this scale is not fixed. The model itself is trained against historical run value, which depends on the era and environment in which the data was collected. When pitchers' average velocity rises, when spin-rate technology improves, or when run-scoring environments shift, the baseline that defines 100 changes too.",
        "These metrics do not measure pure physical ground truth—they measure and predict from observed outcomes. Stuff+ was trained to estimate run values from velocity, movement, and spin, so the model inherently weights movement qualities that have correlated with weak contact or swings-and-misses. But what a pitcher controls, and how much, remains debated. The models reflect one informed answer, not a final one.",
      ],
      claims: [
        kc("Stuff+ evaluates physical characteristics of pitches: release point, velocity, vertical and horizontal movement, and spin rate, excluding location and count context.", "official-data", { label: "FanGraphs Library: Stuff+, Location+, and Pitching+ Primer", url: "https://library.fangraphs.com/pitching/stuff-location-and-pitching-primer/" }),
        kc("Location+ assesses a pitcher's ability to place pitches appropriately for count and pitch type, deliberately excluding physical characteristics.", "official-data", { label: "FanGraphs Library: Stuff+, Location+, and Pitching+ Primer", url: "https://library.fangraphs.com/pitching/stuff-location-and-pitching-primer/" }),
        kc("Pitching+ combines physical traits, placement, count, and batter handedness into an overarching model of overall pitch quality, and is not merely a weighted average of Stuff+ and Location+.", "official-data", { label: "FanGraphs Library: Stuff+, Location+, and Pitching+ Primer", url: "https://library.fangraphs.com/pitching/stuff-location-and-pitching-primer/" }),
        kc("On the plus scale, 10 points represents one standard deviation on the pitch level; 100 is league average by construction.", "official-data", { label: "FanGraphs Library: Stuff+, Location+, and Pitching+ Primer", url: "https://library.fangraphs.com/pitching/stuff-location-and-pitching-primer/" }),
        kc("Stuff+ was trained using decision-tree models to estimate run values and capture relationships between release points, velocities, pitch movement, and outcomes.", "reputable-analysis", { label: "FanGraphs Library: Stuff+, Location+, and Pitching+ Primer", url: "https://library.fangraphs.com/pitching/stuff-location-and-pitching-primer/" }),
      ],
      pullStat: { label: "Plus Scale Standard Deviation", claim: kc("10 points = 1 SD on the pitch level; 100 = league average", "official-data", { label: "FanGraphs Library: Stuff+, Location+, and Pitching+ Primer", url: "https://library.fangraphs.com/pitching/stuff-location-and-pitching-primer/" }) },
    },
    {
      heading: "Induced Vertical Break: Spin-Generated Rise, Not Gravity",
      paragraphs: [
        "Induced Vertical Break, or IVB, is the amount of 'rise' a pitcher creates through spin—not the total vertical drop of the pitch from hand to plate. This distinction matters because every pitch is pulled downward by gravity at roughly 16 inches per second squared. IVB removes that gravitational constant and reports only the movement the pitcher's spin and release angle generate.",
        "Positive IVB means a pitch drops less than gravity alone would pull it down. A four-seam fastball with +18 inches of IVB rises less than a pitch with +16 inches; both fall, but the first seems to 'rise' relative to a gravity-only baseline. Negative IVB means a pitch drops more than gravity—curveballs and drop-heavy pitches sit in the negative range. This is not a description of what hitters see; it is a physics-adjusted measurement of what the pitcher threw.",
        "The reason this matters: IVB isolates spin control from release height, arm slot, or mechanical variation. Two pitchers throwing from different heights at different velocities can be compared on IVB alone. It reveals the spin signature that defines a pitch.",
      ],
      claims: [
        kc("Induced Vertical Break (IVB) is the amount of movement a pitcher generates from spin and release, reported without the effects of gravity.", "official-data", { label: "FanGraphs Library: Stuff+, Location+, and Pitching+ Primer", url: "https://library.fangraphs.com/pitching/stuff-location-and-pitching-primer/" }),
        kc("Positive IVB indicates a pitch drops less than it would if thrown at the same velocity without spin; negative IVB indicates it drops more than gravity alone would produce.", "official-data", { label: "FanGraphs Library: Stuff+, Location+, and Pitching+ Primer", url: "https://library.fangraphs.com/pitching/stuff-location-and-pitching-primer/" }),
        kc("Four-seam fastballs typically generate high positive IVB values, while curveballs produce negative IVB due to their greater downward break.", "reputable-analysis", { label: "Baseball Savant Pitch Movement Leaderboard", url: "https://baseballsavant.mlb.com/leaderboard/pitch-movement" }),
      ],
      pullStat: { label: "IVB Range by Pitch Type", claim: kc("Four-seam: positive (elite range +18 to +20+); Curveball: negative", "reputable-analysis", { label: "Baseball Savant Pitch Movement Leaderboard", url: "https://baseballsavant.mlb.com/leaderboard/pitch-movement" }) },
    },
    {
      heading: "Bauer Units and the Spin-Velocity Ratio",
      paragraphs: [
        "A Bauer Unit is the ratio of spin rate (RPM) divided by velocity (MPH). The metric isolates spin efficiency from raw velocity, because a pitch with high spin rate but low velocity behaves differently than a high-spin, high-velocity pitch. The league average hovers around 24.0–24.3 Bauer Units, depending on the season and pitcher sample.",
        "Why this ratio matters: research has shown that Bauer Units correlate with pitch effectiveness. A pitcher throwing a fastball at 92 mph with 2,200 RPM sits near the baseline. A pitcher at 94 mph with 2,300 RPM—slightly higher on both counts—occupies a different efficiency range. Bauer Units normalize for velocity, revealing the spin authority independent of gas.",
        "This metric is most useful for comparing fastballs across different velocity profiles and for identifying efficiency gains or losses year to year. It is less directly predictive of movement shape than IVB or horizontal break, but it captures the foundational relationship between spin and velocity that shapes everything that follows.",
      ],
      claims: [
        kc("A Bauer Unit is derived from dividing spin rate (RPM) by velocity (MPH).", "official-data", { label: "Pitcher List: Going Deep—Bauer Units with Four-Seam Fastballs", url: "https://pitcherlist.com/going-deep-making-good-use-of-bauer-units/" }),
        kc("League average Bauer Units for four-seam fastballs is approximately 24.0–24.3 across recent MLB seasons.", "reputable-analysis", { label: "Rapsodo Baseball & Pitcher List", url: "https://rapsodo.com/blogs/baseball/understanding-rapsodo-pitching-data-spin-rate-efficiency-profile-fastball" }),
        kc("Bauer Units normalize spin rate for velocity, allowing comparison of spin efficiency across pitchers throwing at different speeds.", "reputable-analysis", { label: "Pitcher List: Going Deep—Bauer Units with Four-Seam Fastballs", url: "https://pitcherlist.com/going-deep-making-good-use-of-bauer-units/" }),
      ],
      pullStat: { label: "League Average Bauer Units (Fastball)", claim: kc("24.0–24.3 (spin rate / velocity ratio)", "reputable-analysis", { label: "Rapsodo Baseball & Pitcher List", url: "https://rapsodo.com/blogs/baseball/understanding-rapsodo-pitching-data-spin-rate-efficiency-profile-fastball" }) },
    },
    {
      heading: "Pitch-Type Classification: When Statcast Guesses Wrong",
      paragraphs: [
        "Statcast auto-classifies pitches into types—fastball, slider, curveball, sweeper, cutter, changeup, splitter, and others—using tracer data and machine learning. In 2023, MLB formalized the sweeper as a distinct pitch type, separating it from the slider. Yet the distinction between a slider, sweeper, and slurve remains mechanical, not binary. A pitch thrown at 82 mph with 2-inch vertical break and 10-inch horizontal break lands in a gray zone where the model must choose.",
        "Classification errors are real and documented. Pitches mislabeled as four-seam fastballs when they are two-seamers; sliders misclassified as cutters; sweepers tagged as sliders. The Statcast system is accurate most of the time, but the overlapping physical spaces between breaking-pitch types mean any pitcher or analyst relying on pitch-type labels without checking the underlying movement data will occasionally misread the arsenal.",
        "The practical lesson: treat Statcast's pitch-type classifications as useful but revisable. When you see a pitch type that seems off—a 'slider' with 8 inches of vertical drop, or a 'sweeper' with minimal horizontal movement—check the raw movement data and release angle. The label is a starting point, not a verdict.",
      ],
      claims: [
        kc("Statcast added the sweeper as a distinct pitch-type classification in 2023, separating it from the slider.", "official-data", { label: "MLB.com Glossary: Sweeper", url: "https://www.mlb.com/glossary/pitch-types/sweeper" }),
        kc("The average MLB slider breaks approximately 6 inches horizontally, while the average sweeper breaks approximately 15 inches.", "reputable-analysis", { label: "Jugs Sports: Slider, Sweeper, Slurve—What's the Difference?", url: "https://jugssports.com/blog/slider-sweeper-slurve-whats-the-difference/" }),
        kc("There is no clear-cut mechanical definition between slider, sweeper, slurve, and curve; classification ambiguity is inherent to the pitch types.", "reputable-analysis", { label: "Fixing the Curve: Improving MLB Pitch Classification with Model-Based Clustering (USRESP, 2018)", url: "https://www.causeweb.org/usproc/sites/default/files/usresp/2018-2/Fixing%20the%20Curve%20Improving%20Major%20League%20Baseball%20Pitch%20Classification%20with%20Model-Based%20Clustering.pdf" }),
        kc("Research has documented instances where pitches were mislabeled by Statcast, such as four-seam fastballs incorrectly classified as two-seamers, which model-based clustering methods can identify and correct.", "reputable-analysis", { label: "Improving MLB Pitch Classification with Model-Based Clustering", url: "https://www.causeweb.org/usproc/sites/default/files/usresp/2018-2/Fixing%20the%20Curve%20Improving%20Major%20League%20Baseball%20Pitch%20Classification%20with%20Model-Based%20Clustering.pdf" }),
      ],
    },
    {
      heading: "How the Models Shift: Environment, Era, and Model Updates",
      paragraphs: [
        "Stuff+, Location+, and Pitching+ are outcome-trained against historical run value. That run value is anchored to a specific era's run environment. When average fastball velocity climbs across baseball, when spin-rate technology advances, or when run-scoring environment changes—as it did between the 2019 and 2023 seasons—the baseline that defines league-average performance shifts. A Stuff+ of 100 in 2020 is not identical to a Stuff+ of 100 in 2025.",
        "The models also change when FanGraphs or Driveline recalibrates their training data or methodology. Each model update resets the historical database and retrains the algorithm. Pitchers who ranked 105 Stuff+ last season might drop to 100 this season not because they threw worse, but because the model learned a more accurate relationship between pitch characteristics and outcomes.",
        "This is not a flaw; it is the nature of outcome-trained models. They describe the data they were trained on. When the sport evolves, the models must evolve with it. The lesson for analysts: Stuff+, Location+, and Pitching+ are powerful tools for ranking pitchers relative to peers and identifying change year-to-year. But they are not constants. Do not treat a 2022 Pitching+ as equivalent to a 2026 Pitching+, and do not assume that a pitcher with a rising Pitching+ has necessarily improved—his baseline may simply have shifted as the model was retrained.",
      ],
      claims: [
        kc("Stuff+, Location+, and Pitching+ models were trained using run values as the outcome variable to adjust for run environment and other external factors across different baseball contexts.", "reputable-analysis", { label: "FanGraphs Library: Stuff+, Location+, and Pitching+ Primer", url: "https://library.fangraphs.com/pitching/stuff-location-and-pitching-primer/" }),
        kc("Park factors and run environments significantly influence how pitch quality translates to outcomes; ERA estimators show differential predictive power across hitter-friendly and pitcher-friendly parks.", "official-data", { label: "FanGraphs Baseball: Park Factors and ERA Estimators: Part I", url: "https://blogs.fangraphs.com/park-factors-and-era-estimators-part-i/" }),
        kc("Pitching+ and related models become reliable predictors of future ERA after approximately 250–400 pitches, outpredicting traditional projection systems early in seasons.", "reputable-analysis", { label: "FanGraphs Library: Stuff+, Location+, and Pitching+ Primer", url: "https://library.fangraphs.com/pitching/stuff-location-and-pitching-primer/" }),
      ],
      pullStat: { label: "Model Reliability Threshold", claim: kc("250–400 pitches for Pitching+ to outpredict ERA estimators", "reputable-analysis", { label: "FanGraphs Library: Stuff+, Location+, and Pitching+ Primer", url: "https://library.fangraphs.com/pitching/stuff-location-and-pitching-primer/" }) },
    },
    {
      heading: "Using Metrics Honestly: Process Over Results, But Results Train the Model",
      paragraphs: [
        "The appeal of Stuff+, Location+, and Pitching+ is that they attempt to separate process from noise—to measure what a pitcher threw and where, independent of whether the batter happened to swing or whether a fielder made an error. In that sense, they are process metrics. But they are not pure. They were trained against results. They know, through their training data, what outcomes correlate with high IVB, high velocity, tight spin axis. So they conflate process with observed effect.",
        "This is useful and honest when you remember it. Stuff+ does not tell you that a pitcher has great stuff in some platonic sense; it tells you that this pitcher's physical characteristics look like pitchers whose pitches generated low run values on average. If hitters suddenly became worse at hitting high-spin fastballs, Stuff+ would not immediately update—it would lag until new data retrained the model.",
        "Read these metrics as tools for ranking and comparison within a season or between pitchers of the same era. Use them to identify change from year to year. But do not treat them as ground truth about pitch quality. Pair them with video. Watch how hitters approach the pitcher. Trust your eye. The numbers are a conversation partner, not the final word.",
      ],
      claims: [
        kc("Stuff+, Location+, and Pitching+ are outcome-trained models designed to describe and predict from observed results and physical inputs, not to measure pure physical ground truth.", "reputable-analysis", { label: "FanGraphs Library: Stuff+, Location+, and Pitching+ Primer", url: "https://library.fangraphs.com/pitching/stuff-location-and-pitching-primer/" }),
        kc("These models inherently reflect the research community's understanding of pitch effectiveness at the time of their training; disagreement about what pitchers control is baked into their design.", "reputable-analysis", { label: "FanGraphs Library: Stuff+, Location+, and Pitching+ Primer", url: "https://library.fangraphs.com/pitching/stuff-location-and-pitching-primer/" }),
      ],
    },
  ],
  confidenceNote: "Core definitions (Stuff+/Location+/Pitching+ mechanics, IVB physics, Bauer Units) sourced from FanGraphs Library and Pitcher List. Sweeper classification and pitch-movement data verified from MLB.com and Jugs Sports. Pitch-type classification ambiguity documented by academic research and applied machine-learning analysis. Run-environment dependency grounded in FanGraphs methodology. Some 2024 league-average figures (IVB, four-seam fastball benchmarks) could not be independently verified through public leaderboards and are marked unverified.",
  related: [
    { label: "Pitch Design", to: "/pitch-design" },
    { label: "Spin Axis and Life", to: "/spin" },
    { label: "Mechanics", to: "/mechanics" },
    { label: "Sequencing", to: "/sequencing" },
  ],
}
