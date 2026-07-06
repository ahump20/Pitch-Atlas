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
  summary: "Published source context on fatigue, throwing volume, UCL research, and the limits of what Pitch Atlas can responsibly claim.",
  sub: "This wing files safety literature as source context only. It does not diagnose pain, prescribe rehab, set throwing volume, or claim a plan prevents injury.",
  accent: "seam",
  educational: true,
  sections: [
    {
      heading: "The UCL literature: scale and youth shift",
      paragraphs: [
        "Tommy John surgery (UCL reconstruction) appears often enough in the baseball literature that Pitch Atlas treats it as a source-boundary topic, not a coaching topic. The cited review says modern procedure counts have shifted toward teenagers aged 15-19, where earlier eras clustered more heavily around professional pitchers.",
        "The same source points to year-round participation, multiple teams, uneven pitch-count enforcement, and low Pitch Smart compliance as possible cultural drivers. That is filed here as published context. It is not a diagnosis of any pitcher, team, tournament, or training plan.",
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
        "Biomechanics papers connect higher throwing intensity with greater stress on the ulnar collateral ligament and the structures that stabilize the elbow. The technical term is valgus torque: the rotational force that pulls the elbow open during a throw.",
        "The source record is not simple. Researchers found that some collegiate pitchers showed a clear relationship between ball speed and elbow torque while others did not. Mechanics, arm slot, sequencing efficiency, and anatomy all change the interpretation.",
        "Pitch Atlas can file that relationship. It cannot turn a radar reading, effort cue, or pitch type into an individual risk score.",
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
        "ASMI and peer-reviewed papers repeatedly name fatigue as a risk signal in pitching injury research. One youth-pitching paper reports that adolescent pitchers who underwent elbow or shoulder surgery were more likely to have pitched while fatigued than uninjured peers.",
        "The biomechanics explanation is also source-bound: when fatigue changes timing, hip-to-shoulder separation, arm slot, or force transfer, the shoulder and elbow can take a different load than they did earlier in the outing.",
        "That is where this page stops. It records what the literature says about fatigue and mechanics; it does not decide whether a pitcher keeps throwing, rests, rehabs, or changes a role.",
      ],
      claims: [
        kc("Adolescent pitchers who underwent elbow or shoulder surgery were significantly more likely to have routinely pitched with arm fatigue", "official-data", { label: "PMC/NIH, prevention of elbow injuries in youth baseball pitchers", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3435945/" }),
        kc("Pitching while fatigued, competitive pitching volume, playing on multiple teams, year-round pitching, and poor mechanics are strongly linked to UCL injury", "official-data", { label: "ASMI Position Statement for Tommy John Injuries", url: "https://asmi.org/position-statement-for-tommy-john-injuries-in-baseball-pitchers/" }),
      ],
      pullStat: { label: "Fatigue as injury driver", claim: kc("Strongly linked to UCL injury", "official-data", { label: "ASMI Position Statement", url: "https://asmi.org/position-statement-for-tommy-john-injuries-in-baseball-pitchers/" }, "ASMI lists fatigue among the modifiable factors in its UCL injury position statement.") },
    },
    {
      heading: "The 100-Inning Threshold and Annual Workload",
      paragraphs: [
        "A 10-year prospective study of 481 youth pitchers aged 9-14 is the source behind the 100-inning figure. The study associated more than 100 innings in a year with a higher rate of serious throwing injury outcomes than lower annual totals.",
        "The number is an observed threshold in that cohort, not a personalized cap generated by Pitch Atlas. It belongs in the record because it is one of the clearest published links between annual volume and injury outcome.",
        "Other cited literature discusses months played per year and time away from overhead throwing. This page records those source positions without building a throwing calendar for a specific athlete.",
      ],
      claims: [
        kc("Youth pitchers who pitched >100 innings annually were 3.5 times more likely to suffer arm injury (95% CI = 1.16-10.44)", "official-data", { label: "PubMed, 10-year prospective cohort study of 481 youth pitchers aged 9-14", url: "https://pubmed.ncbi.nlm.nih.gov/21098816/" }),
        kc("Pitchers who played competitively more than 8 months per year had 5.05 times greater injury risk versus shorter-season pitchers", "official-data", { label: "PMC/NIH, prevention of elbow injuries in youth baseball pitchers", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3435945/" }),
        kc("The cited youth-pitching paper records an annual no-overhead-throwing interval of 2-3 months, with 4 months preferred.", "official-data", { label: "PMC/NIH, prevention of elbow injuries in youth baseball pitchers", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3435945/" }),
      ],
      pullStat: { label: "Innings threshold", claim: kc("100/year", "official-data", { label: "10-year ASMI prospective cohort, 481 youth pitchers", url: "https://pubmed.ncbi.nlm.nih.gov/21098816/" }, "Observed association in prospective follow-up, not an individualized workload rule.") },
    },
    {
      heading: "Acute-to-Chronic Workload: Managing the Spike",
      paragraphs: [
        "Counting season totals can miss short-term spikes. Acute-to-chronic workload ratio is a model for comparing recent throwing volume with a longer baseline, usually a rolling multi-week average.",
        "Some workload-monitoring literature flags weekly spikes beyond a baseline band of roughly 10-20%. The cited source also warns that ratio models are incomplete because they measure external load, not how one pitcher adapts physiologically or compensates mechanically.",
        "The useful archive point is vocabulary. Pitch Atlas can explain what the model tries to measure and why researchers debate its limits; it cannot infer readiness from the ratio alone.",
      ],
      claims: [
        kc("Some workload-monitoring literature flags acute load increases beyond a 10-20% chronic-baseline band in a single week.", "reputable-analysis", { label: "Workload monitoring research for baseball pitchers", url: "https://blog.armcare.com/rethinking-acute-to-chronic-workload-for-pitchers/" }),
        kc("Acute-to-chronic workload ratio models measure external load but may not fully capture individual physiological adaptation or mechanical compensation during pitch spikes", "reputable-analysis", { label: "ArmCare blog, rethinking acute-to-chronic workload for pitchers", url: "https://blog.armcare.com/rethinking-acute-to-chronic-workload-for-pitchers/" }, "Some experts caution that ACWR alone is insufficient; functional assessment of mechanics and recovery is also needed"),
      ],
      pullStat: { label: "Spike model band", claim: kc("+10-20% per week", "reputable-analysis", { label: "Workload monitoring research", url: "https://blog.armcare.com/rethinking-acute-to-chronic-workload-for-pitchers/" }, "A model threshold in the cited literature, not a Pitch Atlas clearance rule.") },
    },
    {
      heading: "What the literature groups together",
      paragraphs: [
        "Across the cited sources, the same buckets keep appearing: throwing volume, fatigue signals, months played, mechanics, intensity, pain reporting, and coordination among the adults around a pitcher.",
        "Those are source categories, not a Pitch Atlas checklist. The atlas can show where the literature clusters. It leaves medical judgment, coaching decisions, and athlete-specific throwing plans to qualified people working with the pitcher.",
      ],
      claims: [
        kc("The reviewed youth-pitching guidelines discuss fatigue monitoring, overhead throwing volume, pitch-count limits, overlapping seasons, mechanics, radar readings, pitcher-catcher overlap, pain evaluation, and multi-sport participation.", "official-data", { label: "PMC/NIH, prevention of elbow injuries in youth baseball pitchers", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3435945/" }),
        kc("Approximately 80% of pitchers return to competitive play after Tommy John surgery; approximately 30% require a second operation", "reputable-analysis", { label: "The Conversation, 50 years after Tommy John surgery analysis", url: "https://theconversation.com/50-years-after-the-first-procedure-tommy-john-surgery-is-more-common-than-ever-especially-for-young-athletes-236293" }),
        kc("ASMI's professional-position statement discusses mechanics, pitch effort, discomfort reporting, fatigue, team communication, controlled-effort drills, annual time away, recovery, and intensity-based risk.", "official-data", { label: "ASMI Position Statement for Tommy John Injuries", url: "https://asmi.org/position-statement-for-tommy-john-injuries-in-baseball-pitchers/" }),
      ],
      pullStat: { label: "Surgical outcome record", claim: kc("~80% full return post-surgery", "reputable-analysis", { label: "The Conversation", url: "https://theconversation.com/50-years-after-the-first-procedure-tommy-john-surgery-is-more-common-than-ever-especially-for-young-athletes-236293" }, "The same source reports that about 30% require a second operation.") },
    },
  ],
  confidenceNote: "All surviving claims tie to verifiable working sources: peer-reviewed studies indexed on PubMed Central/NIH, ASMI official position statements, and reputable sports health publications. Volume thresholds come from prospective cohort data. Biomechanical stress claims are sourced from primary PMC research. Acute-to-chronic workload discussion acknowledges model limitations per the cited source. X/Twitter statistic on MLB prevalence removed due to link failure; youth surgery demographic shift confirmed through reputable secondary analysis. No figures invented; all claims tied to working URLs or explicitly marked unverified when sources were unreachable.",
  related: [
    { label: "Pitch Design & Mechanics", to: "/learn/pitch-design" },
    { label: "Youth Baseball Guidelines", to: "/learn/youth" },
    { label: "Workload & Recovery", to: "/learn/metrics" },
    { label: "Pitching Trends", to: "/learn/trends" },
  ],
}
