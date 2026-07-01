import type { KnowledgeWing } from './types'
import { kc } from './claim'

/*
  Generated from the verified knowledge-wing research pass (2026-06-06): parallel
  sourced research with an adversarial citation re-check. Every claim carries a
  real, working source and a confidence tier; the prose is original teaching text.
*/
export const armHealthWing: KnowledgeWing = {
  slug: "arm-health",
  navLabel: "Safety Source Record",
  eyebrow: "The source boundary",
  title: "Safety Source Record for Pitchers",
  summary: "Published source context on fatigue, workload, UCL research, and the limits of what Pitch Atlas can responsibly claim.",
  sub: "This wing files safety literature as source context only. It does not diagnose pain, prescribe rehab, set workload, or guarantee injury prevention.",
  accent: "seam",
  educational: true,
  sections: [
    {
      heading: "The UCL Epidemic: Scale and Shift to Youth",
      paragraphs: [
        "Tommy John surgery (UCL reconstruction) has risen dramatically over the past decade, becoming endemic in baseball. The shift in timing is alarming: where surgeries once clustered among professional pitchers in their late 20s, the majority now occur in teenagers aged 15-19. High school and college pitchers dominate modern caseloads, indicating that initial ligament damage typically occurs during youth competition rather than at the professional level.",
        "This demographic reversal reflects systemic changes in youth baseball culture: year-round participation across multiple teams, inconsistent enforcement of pitch-count limits, and widespread noncompliance with evidence-based workload guidelines. A major sports health publication found that 90% of youth baseball teams do not follow Pitch Smart protocols, meaning most young pitchers exceed safe throwing thresholds and receive insufficient recovery time.",
      ],
      claims: [
        kc("More than half of all Tommy John surgeries are performed on teenagers aged 15-19", "reputable-analysis", { label: "The Conversation, 50 years after Tommy John surgery analysis", url: "https://theconversation.com/50-years-after-the-first-procedure-tommy-john-surgery-is-more-common-than-ever-especially-for-young-athletes-236293" }),
        kc("90% of surveyed youth baseball teams do not comply with Pitch Smart guidelines", "reputable-analysis", { label: "The Conversation, survey on Pitch Smart compliance", url: "https://theconversation.com/50-years-after-the-first-procedure-tommy-john-surgery-is-more-common-than-ever-especially-for-young-athletes-236293" }),
      ],
      pullStat: { label: "Youth surgeries", claim: kc(">50% of procedures", "reputable-analysis", { label: "The Conversation", url: "https://theconversation.com/50-years-after-the-first-procedure-tommy-john-surgery-is-more-common-than-ever-especially-for-young-athletes-236293" }, "Ages 15-19; dramatic reversal from professional-dominated decades prior") },
    },
    {
      heading: "Throwing Intensity and Elbow Stress",
      paragraphs: [
        "Higher throwing intensity can correlate with greater stress on the ulnar collateral ligament and the structures stabilizing the elbow. This relationship is biomechanical, not theoretical: throwing harder generates greater valgus torque, the rotational force that pulls the elbow open.",
        "However, the injury link varies by pitcher. Researchers found that some collegiate pitchers showed a clear relationship between ball speed and elbow torque while others did not. Mechanics, arm slot, sequencing efficiency, and anatomical tolerance all change the risk profile.",
        "The broader lesson is not that throwing hard alone causes injury. Throwing hard while fatigued, under-recovered, poorly sequenced, or overused creates the danger.",
      ],
      claims: [
        kc("Collegiate pitcher research found that the relationship between ball speed and elbow torque varies meaningfully by individual pitcher.", "official-data", { label: "PMC/NIH, collegiate pitcher biomechanics study", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10611893/" }),
        kc("Professional and high school pitchers showed different absolute elbow loads, but relative elbow stress became comparable after normalizing for body size.", "official-data", { label: "PMC/NIH, segmental power analysis in baseball pitching", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6390228/" }),
        kc("When normalized to body weight and height, both professional and high school pitchers experienced comparable relative elbow stress", "official-data", { label: "PMC/NIH, segmental power analysis in baseball pitching", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6390228/" }),
      ],
      pullStat: { label: "Elbow stress driver", claim: kc("Valgus torque rises with throwing intensity", "official-data", { label: "PMC/NIH biomechanics research", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10611893/" }, "Effect varies by pitcher mechanics and individual tolerance") },
    },
    {
      heading: "Fatigue: The Dominant Modifiable Risk Factor",
      paragraphs: [
        "Of all factors predicting arm injury in youth and professional pitchers, fatigue is the most consistently modifiable. Research from the American Sports Medicine Institute shows that adolescent pitchers who underwent elbow or shoulder surgery were dramatically more likely to have pitched while fatigued compared to uninjured peers. Fatigue is not a cosmetic sign—it is a biomechanical inflection point where injury risk accelerates.",
        "When a pitcher tires, mechanics degrade: hip-to-shoulder separation decreases, reducing the efficient transfer of force from the lower body. The arm slot drifts, forcing the shoulder and elbow to compensate. The load shifts from the legs and core to the smaller, more fragile structures of the shoulder and elbow. A fatigued pitcher cannot dissipate force through large muscle groups; the ligaments and tendons must absorb the blow instead.",
        "The practical implication is straightforward: rest is non-negotiable. If a pitcher reports arm fatigue during a game or practice, or if you observe declining pace, accuracy, or form, remove him. This is not overprotection—it is injury prevention. An extra appearance now may mean an operating room later.",
      ],
      claims: [
        kc("Adolescent pitchers who underwent elbow or shoulder surgery were significantly more likely to have routinely pitched with arm fatigue", "official-data", { label: "PMC/NIH, prevention of elbow injuries in youth baseball pitchers", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3435945/" }),
        kc("Pitching while fatigued, competitive pitching volume, playing on multiple teams, year-round pitching, and poor mechanics are strongly linked to UCL injury", "official-data", { label: "ASMI Position Statement for Tommy John Injuries", url: "https://asmi.org/position-statement-for-tommy-john-injuries-in-baseball-pitchers/" }),
      ],
      pullStat: { label: "Fatigue as injury driver", claim: kc("Strongly linked to UCL injury", "official-data", { label: "ASMI Position Statement", url: "https://asmi.org/position-statement-for-tommy-john-injuries-in-baseball-pitchers/" }, "One of the most modifiable risk factors; immediate rest when observed can prevent escalation") },
    },
    {
      heading: "The 100-Inning Threshold and Annual Workload",
      paragraphs: [
        "One of the most actionable findings in pitching injury research comes from a 10-year prospective study of 481 youth pitchers aged 9-14 conducted by ASMI researchers. Annual injury outcomes—elbow surgery, shoulder surgery, or retirement due to throwing injury—tracked cleanly against workload thresholds. Youth pitchers who exceeded 100 innings in a single year were 3.5 times more likely to suffer injury than those who stayed below that threshold.",
        "The 100-inning limit reflects both volume and recovery window. A pitcher throwing 100 innings across a season typically makes 12-16 appearances, scattered across months with recovery days between. A pitcher throwing 120 innings pitches more frequently, recovers less fully between starts, and accumulates microtrauma at a faster rate. The threshold is empirical, not arbitrary, derived from injury data across a decade.",
        "Beyond annual innings, research also stresses that pitchers who play competitively for more than 8 months per year face 5 times greater injury risk than those with shorter seasons. Year-round throwing without an off-season provides no window for tissue adaptation and repair. A mandatory 2- to 3-month annual shutdown (4 months preferred) from all overhead throwing is foundational injury prevention.",
      ],
      claims: [
        kc("Youth pitchers who pitched >100 innings annually were 3.5 times more likely to suffer arm injury (95% CI = 1.16-10.44)", "official-data", { label: "PubMed, 10-year prospective cohort study of 481 youth pitchers aged 9-14", url: "https://pubmed.ncbi.nlm.nih.gov/21098816/" }),
        kc("Pitchers who played competitively more than 8 months per year had 5.05 times greater injury risk versus shorter-season pitchers", "official-data", { label: "PMC/NIH, prevention of elbow injuries in youth baseball pitchers", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3435945/" }),
        kc("Recommended annual rest: 2-3 months minimum (4 months preferred) of no overhead throwing", "official-data", { label: "PMC/NIH, prevention of elbow injuries in youth baseball pitchers", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3435945/" }),
      ],
      pullStat: { label: "Innings threshold", claim: kc("100/year", "official-data", { label: "10-year ASMI prospective cohort, 481 youth pitchers", url: "https://pubmed.ncbi.nlm.nih.gov/21098816/" }, "Exceeding this threshold more than tripled injury risk in prospective follow-up") },
    },
    {
      heading: "Acute-to-Chronic Workload: Managing the Spike",
      paragraphs: [
        "Simply counting total innings misses acute injury risk. The acute-to-chronic workload ratio monitors whether a pitcher's short-term load (current week) spikes dangerously relative to his baseline (rolling 4-week average). A pitcher averaging 50 throws per week can likely tolerate a spike to 60; jumping to 75 creates hazard. This ratio captures the off-season ramp-up, mid-season surge, or tournament overload—moments when pitchers exceed their adapted capacity.",
        "Research on athletes across sports shows that injury risk climbs substantially when acute workload increases more than 10-20% beyond chronic baseline in a single week. A pitcher moving from once-per-week appearances to twice-per-week suddenly creates a volume spike that requires compensatory rest afterward. However, some experts note that ratio-based models alone may not fully capture injury risk, since they measure external load but not how an individual pitcher actually adapts physiologically or whether hidden mechanical compensation is occurring.",
        "Practically, this means: build volume gradually. Do not jump from off-season rest directly into heavy competition. Gradually increase throws and appearances over 2-3 weeks of preseason work. During the season, monitor not just game pitches but also bullpen work, long-toss, and weighted-ball exercises—all add to chronic load. If a pitcher suddenly pitches twice in a week, provide compensatory rest and mechanical assessment afterward to ensure he is adapting rather than compensating.",
      ],
      claims: [
        kc("Injury risk increases when acute workload exceeds chronic baseline by more than 10-20% in a single week", "reputable-analysis", { label: "Workload monitoring research for baseball pitchers", url: "https://blog.armcare.com/rethinking-acute-to-chronic-workload-for-pitchers/" }),
        kc("Acute-to-chronic workload ratio models measure external load but may not fully capture individual physiological adaptation or mechanical compensation during pitch spikes", "reputable-analysis", { label: "ArmCare blog, rethinking acute-to-chronic workload for pitchers", url: "https://blog.armcare.com/rethinking-acute-to-chronic-workload-for-pitchers/" }, "Some experts caution that ACWR alone is insufficient; functional assessment of mechanics and recovery is also needed"),
      ],
      pullStat: { label: "Safe spike limit", claim: kc("+10-20% per week", "reputable-analysis", { label: "Workload monitoring research", url: "https://blog.armcare.com/rethinking-acute-to-chronic-workload-for-pitchers/" }, "Exceeding this threshold increases injury risk; model limitations suggest combining with mechanical and functional assessment") },
    },
    {
      heading: "Actionable Arm-Health Framework: Rest, Monitoring, Mechanics",
      paragraphs: [
        "Arm health is not determined by genetics or destiny. It is determined by choices: workload management, recovery protocols, and mechanical efficiency. The evidence supports a straightforward framework applicable across youth, amateur, college, and professional levels.",
        "Enforce workload limits: no more than 100 innings per season in youth; no pitching for more than 8-9 months per year; mandatory 2-3-month off-season shutdown from overhead throwing. Monitor fatigue in real time: if a pitcher reports arm soreness, declining pace, or loss of control, rest him immediately. Attend to mechanics: a pitcher with poor hip-to-shoulder separation or excessive arm lag absorbs more elbow stress per throw. Coaching and biomechanical assessment should be preventive, not reactive. Account for total throwing volume beyond game pitches alone: bullpen work, long-toss, and weighted balls all accumulate load. Build volume gradually in spring training and avoid acute spikes. Finally, communicate collectively across coaching staff, athletic trainers, and the pitcher. Injury risk detection requires shared awareness, not siloed decision-making.",
      ],
      claims: [
        kc("Evidence-based prevention guidelines for youth pitchers include monitoring fatigue, limiting overhead throwing, following pitch count limits, avoiding overlapping seasons, teaching proper mechanics, not chasing radar readings, separating pitching from catching, seeking medical evaluation if pain develops, and promoting multi-sport participation", "official-data", { label: "PMC/NIH, prevention of elbow injuries in youth baseball pitchers", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3435945/" }),
        kc("Approximately 80% of pitchers return to competitive play after Tommy John surgery; approximately 30% require a second operation", "reputable-analysis", { label: "The Conversation, 50 years after Tommy John surgery analysis", url: "https://theconversation.com/50-years-after-the-first-procedure-tommy-john-surgery-is-more-common-than-ever-especially-for-young-athletes-236293" }),
        kc("Professional prevention strategies include optimizing mechanics, varying pitch effort, maintaining open communication about discomfort, monitoring fatigue, implementing a team approach, using controlled-effort drills, taking annual rest, prioritizing recovery, and accounting for intensity-based risk", "official-data", { label: "ASMI Position Statement for Tommy John Injuries", url: "https://asmi.org/position-statement-for-tommy-john-injuries-in-baseball-pitchers/" }),
      ],
      pullStat: { label: "Return to play rate", claim: kc("~80% full return post-surgery", "reputable-analysis", { label: "The Conversation", url: "https://theconversation.com/50-years-after-the-first-procedure-tommy-john-surgery-is-more-common-than-ever-especially-for-young-athletes-236293" }, "But 30% require repeat surgery; prevention is far superior to repair") },
    },
  ],
  confidenceNote: "All surviving claims tied to verifiable working sources: peer-reviewed studies indexed on PubMed Central/NIH, ASMI official position statements, and reputable sports health publications. Workload thresholds confirmed via prospective cohort data. Biomechanical stress claims are sourced from primary PMC research. Acute-to-chronic workload discussion revised to acknowledge model limitations per the cited source. X/Twitter statistic on MLB prevalence removed due to link failure; youth surgery demographic shift confirmed through reputable secondary analysis. No figures invented; all claims tied to working URLs or explicitly marked unverified when sources were unreachable.",
  related: [
    { label: "Pitch Design & Mechanics", to: "/learn/pitch-design" },
    { label: "Youth Baseball Guidelines", to: "/learn/youth" },
    { label: "Workload & Recovery", to: "/learn/metrics" },
    { label: "Pitching Trends", to: "/learn/trends" },
  ],
}
