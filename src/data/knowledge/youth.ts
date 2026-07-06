import type { KnowledgeWing } from './types'
import { kc } from './claim'

/*
  Generated from the verified knowledge-wing research pass (2026-06-06): parallel
  sourced research with an adversarial citation re-check. Every claim carries a
  real, working source and a confidence tier; the prose is original teaching text.
*/
export const youthWing: KnowledgeWing = {
  slug: "youth",
  navLabel: "Youth Safety Sources",
  eyebrow: "The source boundary",
  title: "Youth Safety Source Record",
  summary: "What published youth-pitching authorities say about pitch-count tables, rest intervals, specialization research, and the limits of a website's advice.",
  sub: "This wing files published safety guidance as source context only. It does not choose pitches, set throwing volume, diagnose pain, or prescribe a plan.",
  accent: "seam",
  educational: true,
  sections: [
    {
      heading: "Pitch-type progression in published guidance",
      paragraphs: [
        "ASMI's adolescent-pitching statement describes a progression from basic throwing to fastball pitching, then change-up pitching, before breaking balls enter the discussion. Pitch Atlas records that sequence as source context, not as an age gate for a specific athlete.",
        "Two coaching sources describe the change-up as an early off-speed teaching pitch because its hand and wrist action can mirror the fastball. That is a source claim about teaching logic. It is not a Pitch Atlas recommendation to add the pitch.",
        "The same ASMI source treats curveballs and sliders as later skills and separates pitch type from the larger questions of fatigue, mechanics, and physical maturity. The archive keeps that boundary visible instead of telling a young pitcher what to throw next.",
      ],
      claims: [
        kc("ASMI presents a progression from basic throwing to fastball pitching, then change-up pitching, before breaking balls.", "official-data", { label: "American Sports Medicine Institute | Position Statement for Adolescent Baseball Pitchers", url: "https://asmi.org/position-statement-for-adolescent-baseball-pitchers/" }),
        kc("The cited Dugout Captain change-up guide describes the pitch as using hand and wrist positions that mirror the fastball.", "reputable-analysis", { label: "Dugout Captain, change-up coaching article", url: "https://www.dugoutcaptain.com/drill/how-to-coach-the-change-up/" }),
        kc("The cited Chad Moeller Baseball article describes three-finger and circle-change grips for smaller hands.", "reputable-analysis", { label: "Chad Moeller Baseball, change-up article", url: "https://chadmoellerbaseball.com/the-best-pitch-for-a-young-ball-player-to-learn-the-changeup/" }),
        kc("ASMI places fastball and change-up mechanics before curveballs or sliders in its adolescent-pitcher progression.", "official-data", { label: "American Sports Medicine Institute | Position Statement for Adolescent Baseball Pitchers", url: "https://asmi.org/position-statement-for-adolescent-baseball-pitchers/" }),
      ],
    },
    {
      heading: "MLB Pitch Smart published tables",
      paragraphs: [
        "MLB and USA Baseball publish Pitch Smart as age-group tables for daily pitch totals and calendar-day rest intervals. Pitch Atlas files the tables as official source material, not as a workload tool.",
        "The tables list daily maximums by age band and rest intervals by pitch-count band. Those numbers belong here because they are the official published figures a visitor may want to trace back to the source.",
        "The same source includes a three-consecutive-calendar-day restriction and annual innings guidance. This page records those source entries without applying them to a player, league, or season.",
      ],
      claims: [
        kc("Pitch Smart lists daily maximums of 75 pitches for ages 9-10, 85 for ages 11-12, 95 for ages 13-14, and 95-105 for ages 15-18.", "official-data", { label: "MLB Pitch Smart | Pitching Guidelines", url: "https://www.mlb.com/pitch-smart/pitching-guidelines" }),
        kc("Pitch Smart lists rest intervals for ages 9-14 by pitch-count band: 1-20, 21-35, 36-50, 51-65, and 66+.", "official-data", { label: "MLB Pitch Smart | Pitching Guidelines", url: "https://www.mlb.com/pitch-smart/pitching-guidelines" }),
        kc("Pitch Smart lists rest intervals for ages 15-18 by pitch-count band: 1-30, 31-45, 46-60, 61-80, and 81+.", "official-data", { label: "MLB Pitch Smart | Pitching Guidelines", url: "https://www.mlb.com/pitch-smart/pitching-guidelines" }),
        kc("Pitch Smart includes a restriction on pitching on three consecutive calendar days, regardless of pitch count.", "official-data", { label: "MLB Pitch Smart | Pitching Guidelines", url: "https://www.mlb.com/pitch-smart/pitching-guidelines" }),
        kc("Pitch Smart publishes annual innings guidance for ages 9-12, 13-14, and 15-18.", "official-data", { label: "MLB Pitch Smart | Pitching Guidelines", url: "https://www.mlb.com/pitch-smart/pitching-guidelines" }),
      ],
    },
    {
      heading: "Annual rest in ASMI guidance",
      paragraphs: [
        "ASMI's adolescent-pitcher statement includes time away from competitive pitching and overhead throwing in its published guidance. The source frames those intervals alongside fatigue, pitch volume, and overuse.",
        "Pitch Atlas records the guidance as a source position. It does not set a calendar for a young athlete or decide how a family, coach, physician, or league should apply it.",
      ],
      claims: [
        kc("ASMI's adolescent-pitcher statement lists 2-3 months away from overhead throwing per year, with 4 months preferred, and at least 4 months away from competitive baseball pitching.", "official-data", { label: "American Sports Medicine Institute | Position Statement for Adolescent Baseball Pitchers", url: "https://asmi.org/position-statement-for-adolescent-baseball-pitchers/" }),
        kc("Overuse (pitch volume and fatigue) is the principal risk factor for youth pitching injuries, more influential than pitch type alone.", "official-data", { label: "American Sports Medicine Institute | Position Statement for Adolescent Baseball Pitchers", url: "https://asmi.org/position-statement-for-adolescent-baseball-pitchers/" }),
        kc("ASMI's statement names fatigue signs such as declining ball pace, decreased accuracy, upright trunk posture, dropped elbow during pitching, and increased time between pitches.", "official-data", { label: "American Sports Medicine Institute | Position Statement for Adolescent Baseball Pitchers", url: "https://asmi.org/position-statement-for-adolescent-baseball-pitchers/" }),
      ],
    },
    {
      heading: "The Cost of Early Specialization",
      paragraphs: [
        "Single-sport specialization appears in the youth-baseball literature as a population-level risk topic. The sources define specialization around year-round baseball, multiple teams, overlapping seasons, and limited participation in other sports.",
        "In a study of 102 professional baseball players, 49% had specialized before high school, with a mean specialization age of 8.9 years. Early specializers sustained 2.3 times more serious injuries in their professional careers than non-specialized peers. Another youth-pitching study associated specialization with a higher rate of shoulder and elbow injury.",
        "Those studies do not diagnose one athlete from a profile. They belong here because they show how researchers frame the culture around youth baseball volume.",
      ],
      claims: [
        kc("49% of professional baseball players in one study specialized in baseball before high school, with a mean specialization age of 8.9 years (range 4-17).", "reputable-analysis", { label: "PMC | Early Sport Specialization: Effectiveness and Risk of Injury in Professional Baseball Players", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5613849/" }),
        kc("Early specializers (before high school) sustained a mean of 0.54 serious injuries during their professional careers, compared to 0.23 for non-specialized players—a 2.3-fold difference (P=0.044).", "reputable-analysis", { label: "PMC | Early Sport Specialization: Effectiveness and Risk of Injury in Professional Baseball Players", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5613849/" }),
        kc("63.4% of professional players surveyed believed that early sport specialization was not required to play professional baseball.", "reputable-analysis", { label: "PMC | Early Sport Specialization: Effectiveness and Risk of Injury in Professional Baseball Players", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5613849/" }),
        kc("Among youth baseball pitchers aged 9-12, all 21 arm injuries recorded in one prospective study occurred in specialized athletes; specialized players had a 6.7-fold higher odds ratio for shoulder/elbow injury compared to non-specialized peers (P=0.03).", "reputable-analysis", { label: "PMC | Sport Specialization and Increased Injury Frequency in Youth Baseball Players", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6805058/" }),
        kc("57.9% of specialized youth baseball players and their parents were unaware of the athlete's specialization status; only 31% self-identified as specialized, while 83% met research-based specialization criteria.", "reputable-analysis", { label: "PMC | Sport Specialization and Increased Injury Frequency in Youth Baseball Players", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6805058/" }),
        kc("Training volume exceeding an athlete's age in hours per week (e.g., 12 years old training more than 12 hours weekly) doubles serious overuse injury risk.", "reputable-analysis", { label: "National Council of Youth Sports | Early Sports Specialization Risks", url: "https://ncys.org/blog-early-sports-specialization-risks/" }),
      ],
    },
    {
      heading: "Practical Safeguards for Youth Pitchers",
      paragraphs: [
        "Beyond pitch counts and rest intervals, ASMI's position statement lists pitcher-catcher overlap, radar-gun pressure, overlapping teams, fatigue signs, and pain reporting among the concerns it wants adults to notice.",
        "Pitch Atlas does not turn that list into instructions. It files the source categories so the boundary is visible: grip and craft live here; athlete-specific medical and workload decisions do not.",
      ],
      claims: [
        kc("ASMI identifies pitcher-catcher overlap as a concern because the combination increases total throws.", "official-data", { label: "American Sports Medicine Institute | Position Statement for Adolescent Baseball Pitchers", url: "https://asmi.org/position-statement-for-adolescent-baseball-pitchers/" }),
        kc("ASMI identifies radar-gun pressure as a youth-pitching concern because it can push throwers toward harder effort.", "official-data", { label: "American Sports Medicine Institute | Position Statement for Adolescent Baseball Pitchers", url: "https://asmi.org/position-statement-for-adolescent-baseball-pitchers/" }),
        kc("ASMI identifies overlapping seasons on multiple teams as a concern because throwing volume and fatigue can accumulate.", "official-data", { label: "American Sports Medicine Institute | Position Statement for Adolescent Baseball Pitchers", url: "https://asmi.org/position-statement-for-adolescent-baseball-pitchers/" }),
      ],
    },
    {
      heading: "The Long View: Rest Now, Durability Later",
      paragraphs: [
        "The pattern across these sources is plain: youth-pitching literature keeps returning to mechanics, throwing volume, months played, fatigue, specialization, and adult oversight.",
        "That pattern is useful for an archive because it explains why safety-source pages exist next to grip-source pages. It still does not make Pitch Atlas a medical, coaching, or workload authority.",
      ],
      claims: [
        kc("ASMI's adolescent-pitcher statement lists at least 4 months away from competitive pitching every year for ages 15-18, including at least 2-3 continuous months away from overhead throwing.", "official-data", { label: "American Sports Medicine Institute | Position Statement for Adolescent Baseball Pitchers", url: "https://asmi.org/position-statement-for-adolescent-baseball-pitchers/" }),
      ],
    },
  ],
  confidenceNote: "All claims tie to primary or named secondary sources: Pitch Smart pitch-count and rest tables from official MLB.com guidelines; ASMI source positions from the published Position Statement for Adolescent Baseball Pitchers; specialization research from peer-reviewed studies indexed in PMC. Change-up instruction remains attributed to coaching websites. Quantitative claims carry official-data or reputable-analysis confidence backed by working URLs.",
  related: [
    { label: "Mechanics", to: "/learn/mechanics" },
    { label: "Arm Health", to: "/learn/arm-health" },
    { label: "Circle Change", to: "/pitch/circle-change" },
    { label: "Pitch Design", to: "/learn/pitch-design" },
  ],
}
