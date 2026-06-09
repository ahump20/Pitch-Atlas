import type { KnowledgeWing } from './types'
import { kc } from './claim'

/*
  Generated from the verified knowledge-wing research pass (2026-06-06): parallel
  sourced research with an adversarial citation re-check. Every claim carries a
  real, working source and a confidence tier; the prose is original teaching text.
*/
export const mechanicsWing: KnowledgeWing = {
  slug: "mechanics",
  navLabel: "Mechanics",
  eyebrow: "The delivery",
  title: "The Kinetic Chain: Force from ground to glove",
  summary: "Pitching force starts in the legs and trunk; sequence and timing transfer it to the arm. Breaks in the chain overload the shoulder and elbow.",
  sub: "The pitch emerges from the lower body, not the arm. Energy flows proximal-to-distal—legs drive, hips rotate, core twists, shoulders and arm whip through. Each segment must decelerate as the next accelerates, or the small muscles of the shoulder and elbow absorb dangerous loads.",
  accent: "powder",
  educational: false,
  sections: [
    {
      heading: "The Chain: Four Pillars of Throwing",
      paragraphs: [
        "The kinetic chain is not a movement pattern; it is a coordinated transfer of force through your entire body. It begins the instant your back foot commits to the mound. Energy originates in the legs, amplifies through the trunk and hips, and arrives at the shoulder and arm already moving.",
        "Think of it as a whip. The base (legs and core) starts the force; the middle (hips and shoulders) stores and amplifies it; the tip (arm and hand) releases it toward the target. Break the whip at any point with sluggish legs, stiff hips, or a collapsed core, and the tip must work harder. That compensation loads the elbow and shoulder with forces they cannot safely absorb.",
        "The chain has four main segments: lower extremity, pelvis, trunk and scapula, and shoulder-elbow complex. Elite pitchers activate these in strict order, with each segment handing force to the next. That timing is everything.",
      ],
      claims: [
        kc("The kinetic chain represents a coordinated effort of muscle units from the entire body, culminating with explosive motion of the upper extremity.", "official-data", { label: "The Kinetic Chain in Overhand Pitching: Its Potential Role for Performance Enhancement and Injury Prevention", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3445080/" }),
        kc("Reduced kinetic energy delivered from the hip and trunk forces the shoulder to work harder to maintain the throw.", "official-data", { label: "The Kinetic Chain in Overhand Pitching: Its Potential Role for Performance Enhancement and Injury Prevention", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3445080/" }),
        kc("Energy builds as it moves from larger proximal muscles (lower body) to smaller distal muscles (upper body), with quicker deceleration of proximal segments corresponding to better energy transfer to the next segment.", "official-data", { label: "The Kinetic Chain in Overhand Pitching", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3445080/" }),
      ],
    },
    {
      heading: "Leg Drive and the Foundation",
      paragraphs: [
        "The pitch starts in the ground. Your back leg drives forward, extending the hip and knee to accelerate your body down the mound. This is not a gentle stride—it is an explosive movement that generates most of the initial kinetic energy. The lead leg plants closed relative to the mound centerline, with your stride length ideally around 85% of your height. As your lead foot makes contact, your lead knee is still flexed at roughly 45 degrees.",
        "During this phase, your back hip is rotating open, your front knee begins to straighten, and your pelvis is accelerating toward home plate. The sequencing is critical: your pelvis begins rotating before your upper trunk, creating load in the obliques and core. This happens passively; if you force it, you lose the elastic recoil that transfers force into the throw. The better your hip and ankle mobility, the cleaner this sequence unfolds and the less compensatory stress lands on your elbow.",
      ],
      claims: [
        kc("Stride length should equal approximately 85% of pitcher height, with a closed lead foot position relative to the mound centerline.", "official-data", { label: "The Clinician's Guide to Baseball Pitching Biomechanics", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9950989/" }),
        kc("Trail hip total rotational arc is related to when the trunk starts rotating; restricted back-leg hip rotation dampens forward trunk movement.", "official-data", { label: "The Relationship Between Hip Range of Motion and Pitching Kinematics Related to Increased Elbow Valgus Loads in Collegiate Baseball Pitchers", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8016430/" }),
        kc("Lead knee flexion at foot contact is approximately 45°; at ball release it is approximately 30°.", "official-data", { label: "The Clinician's Guide to Baseball Pitching Biomechanics", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9950989/" }),
      ],
    },
    {
      heading: "Hip-Shoulder Separation: The Spring",
      paragraphs: [
        "At foot plant, your hips are already rotating toward home plate while your shoulders lag behind—they are still closed. This gap between hip angle and shoulder angle is hip-shoulder separation, often called the X-factor. It measures the difference in rotation between your pelvis and upper trunk, and it typically reaches 30 to 60 degrees in elite pitchers. This gap is elastic. Your oblique muscles and core fascia stretch and store energy, like a spring being wound.",
        "The moment your lead foot plants, your front knee begins to straighten, anchoring your lower body. At the same time, your hips continue to rotate into the ball. Your shoulders, still closed, resist this rotation. Then, in a fraction of a second, your trunk whips through to close that gap. That explosive rotation of the torso releases all the stored elastic energy directly toward the arm.",
        "The risk: if your hips fail to rotate cleanly (due to hip mobility limits or weak glutes), your shoulders must lag even further to create artificial separation. Your shoulder then overloads to compensate. Conversely, if your pelvis and torso rotate in unison with no lag, you lose the stretch-and-release and your shoulder must do the work alone. Both are injury traps.",
      ],
      claims: [
        kc("Hip-shoulder separation is the difference between the shoulder angle and hip angle in the transverse plane; 35–60 degrees of peak separation appears to be optimal.", "reputable-analysis", { label: "Pitching Biomechanics: Understanding Hip Shoulder Separation", url: "https://rocklandpeakperformance.com/pitching-biomechanics-hip-shoulder-separation/" }),
        kc("Holding hip-shoulder separation longer can improve force transfer through the trunk.", "reputable-analysis", { label: "Pitching Biomechanics: Understanding Hip Shoulder Separation", url: "https://rocklandpeakperformance.com/pitching-biomechanics-hip-shoulder-separation/" }),
        kc("Hip-shoulder separation relates to trunk rotation and pitching kinematics.", "official-data", { label: "The Relationship of Range of Motion, Hip Shoulder Separation, and Pitching Kinematics", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7727427/" }),
        kc("Lead hip internal rotation correlated with elbow flexion angle at ball release; limited lead-leg internal rotation associates with early pelvic rotation that alters elbow positioning during release.", "official-data", { label: "The Relationship Between Hip Range of Motion and Pitching Kinematics Related to Increased Elbow Valgus Loads in Collegiate Baseball Pitchers", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8016430/" }),
      ],
      pullStat: { label: "Peak Hip-Shoulder Separation", claim: kc("35–60 degrees", "reputable-analysis", { label: "Pitching Biomechanics: Understanding Hip Shoulder Separation", url: "https://rocklandpeakperformance.com/pitching-biomechanics-hip-shoulder-separation/" }) },
    },
    {
      heading: "Arm Cocking: Maximum External Rotation and Elbow Load",
      paragraphs: [
        "By the time your arm reaches maximum external rotation—the end of the arm-cocking phase—most of the kinetic chain work is already done. Your hips have rotated to face home plate, your trunk is whipping through, and your scapula is setting the shoulder in a position to decelerate. At this instant, your shoulder is abducted about 90 degrees, your elbow is flexed to roughly 90 degrees at shoulder height, and your shoulder is externally rotated to approximately 170 degrees.",
        "This is the most mechanically dangerous position in the delivery. Your shoulder socket is at its limit of range, and your elbow experiences peak valgus torque, a force trying to bend it backward into the stands. The ulnar collateral ligament (UCL) at the medial elbow bears much of this valgus load. If your kinetic chain falters, then your shoulder must decelerate a violently moving arm with no help from the trunk. The result: elbow stress that can exceed the tissues' breaking point.",
      ],
      claims: [
        kc("At maximum external rotation (end of arm cocking), shoulder abduction is approximately 90°, shoulder horizontal abduction is approximately 20°, and shoulder external rotation is approximately 170°.", "official-data", { label: "The Clinician's Guide to Baseball Pitching Biomechanics", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9950989/" }),
        kc("At maximum external rotation, elbow flexion is approximately 90°, elevated to shoulder height.", "official-data", { label: "The Clinician's Guide to Baseball Pitching Biomechanics", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9950989/" }),
        kc("Shoulder internal rotation becomes extremely fast during the acceleration phase, one reason the delivery must be sequenced before the arm fires.", "official-data", { label: "The Clinician's Guide to Baseball Pitching Biomechanics", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9950989/" }),
        kc("The ulnar collateral ligament (UCL) is a primary static stabilizer of the medial elbow joint against approximately 55% of the valgus load.", "official-data", { label: "The ulnar collateral ligament loading paradox between in-vitro and in-vivo studies on baseball pitching (narrative review)", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8130712/" }),
      ],
      pullStat: { label: "Shoulder Rotation Speed", claim: kc("Extremely fast during acceleration", "official-data", { label: "The Clinician's Guide to Baseball Pitching Biomechanics", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9950989/" }) },
    },
    {
      heading: "Acceleration and Release",
      paragraphs: [
        "From maximum external rotation to ball release is the acceleration phase: a short, explosive internal rotation of the shoulder, elbow extension, and wrist action through the ball.",
        "If your kinetic chain is intact, the muscles of your trunk and back are still firing to help brake the arm as it accelerates. Your scapula is moving fluidly with your trunk, and your rotator cuff is co-contracting to stabilize the shoulder. But if your chain broke upstream, then your shoulder and elbow are now accelerating alone, without the help they need.",
      ],
      claims: [
        kc("Elbow extension accelerates rapidly during the throwing phase.", "official-data", { label: "The Clinician's Guide to Baseball Pitching Biomechanics", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9950989/" }),
        kc("At ball release, shoulder abduction is approximately 90°, elbow flexion is approximately 25°, and lead knee flexion is approximately 30°.", "official-data", { label: "The Clinician's Guide to Baseball Pitching Biomechanics", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9950989/" }),
        kc("The proper kinetic sequence involves lead knee extension, pelvis rotation, upper trunk rotation, elbow extension, and shoulder internal rotation, progressing from foot contact through ball release.", "official-data", { label: "The Clinician's Guide to Baseball Pitching Biomechanics", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9950989/" }),
      ],
    },
    {
      heading: "Deceleration and Follow-Through: Where Arm Injuries Happen",
      paragraphs: [
        "The follow-through is where pitchers are made or broken. It begins the instant the ball leaves your hand and continues until you regain balance and lower your arm. If the kinetic chain is strong and sequenced well, the big muscles of your back, lats, and posterior shoulder do the braking work eccentrically. Your forearm naturally pronates, your trunk flexes over your front leg, and your hips and core absorb the deceleration forces.",
        "But if your kinetic chain broke, if your trunk did not transfer force, then your shoulder and elbow are doing the braking alone. The biceps brachii and brachialis muscles try to slow the arm. The UCL tries to stabilize. The rotator cuff tries to hold the shoulder in place. These small, vulnerable structures were not designed to dissipate the full force of deceleration. That is why the follow-through is called active braking.",
      ],
      claims: [
        kc("The follow-through begins immediately after ball release and ends when the pitcher has decelerated and regained balance.", "reputable-analysis", { label: "The Pitching Follow Through: Key to Power and Health", url: "https://baseballscouter.com/pitching-follow-through-mechanics/" }),
        kc("During deceleration, the big muscles of the back and posterior shoulder slow the arm while the forearm naturally pronates, reducing stress on the shoulder and elbow.", "reputable-analysis", { label: "The Pitching Follow Through: Key to Power and Health", url: "https://baseballscouter.com/pitching-follow-through-mechanics/" }),
        kc("During arm deceleration, slowing the upper extremity after rapid internal rotation generates heavy distraction forces through the shoulder.", "official-data", { label: "The Clinician's Guide to Baseball Pitching Biomechanics", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9950989/" }),
        kc("Proper hip extension and trunk flexion control are necessary for effective eccentric braking of the throwing arm during deceleration.", "reputable-analysis", { label: "The Pitching Follow Through: Key to Power and Health", url: "https://baseballscouter.com/pitching-follow-through-mechanics/" }),
      ],
    },
  ],
  confidenceNote: "Biomechanical claims are sourced from peer-reviewed literature and coaching analysis. Joint-angle and force references stay in the source list where they belong; the teaching prose keeps the focus on sequence, timing, and safe force transfer.",
  related: [
    { label: "The delivery, phase by phase", to: "/learn/mechanics" },
    { label: "Arm Health", to: "/learn/arm-health" },
    { label: "Pitch Design", to: "/learn/pitch-design" },
    { label: "Youth", to: "/learn/youth" },
    { label: "Spin & Shape", to: "/learn/spin" },
  ],
}
