import type { KnowledgeWing } from './types'
import { kc } from './claim'

/*
  The biomechanics wing, rewritten craft-first (2026-06-14). The earlier draft
  taught the delivery through joint angles and percentages — degrees of separation,
  stride length as a fraction of height, abduction figures at cocking. That is the
  exact fabricated-precision the rest of the atlas forbids: nobody reading this is
  measured, so a number stated as instruction is a number invented. The teaching
  prose here is the feel a pitcher can actually use — sequence, timing, and where
  force should be when. The literature still backs every teaching point; its
  figures live in the source list on the right, where a measured figure belongs,
  the same way the record digits live with the record-keepers elsewhere in the
  atlas. Every claim carries a real, working source and a confidence tier.
*/
export const mechanicsWing: KnowledgeWing = {
  slug: "mechanics",
  navLabel: "Mechanics",
  eyebrow: "The delivery",
  title: "The Kinetic Chain: Force from ground to glove",
  summary: "The pitch is built in the legs and trunk, then handed to the arm. Sequence and timing transfer the force; a break in the chain makes the shoulder and elbow pay for it.",
  sub: "The pitch comes out of the lower body, not the arm. Force flows from the big segments to the small ones — legs drive, hips turn, the trunk whips, the arm and hand finish it. Each segment has to slow down as the next one fires. Lose that order and the small muscles of the shoulder and elbow are left to do work they were never built for.",
  accent: "powder",
  educational: false,
  sections: [
    {
      heading: "The Chain: how force travels through you",
      paragraphs: [
        "The kinetic chain is not a single move you make with your arm. It is a relay — force handed from one part of the body to the next, starting the instant your back foot commits to the mound. The energy is born in the legs, gathered through the hips and trunk, and arrives at the shoulder already moving fast. The arm doesn't generate the pitch so much as deliver what the body built.",
        "Think of a whip. The base — your legs and core — starts the motion. The middle — hips and shoulders — stores and amplifies it. The tip — arm and hand — lets it go toward the target. Crack the whip cleanly and the tip barely has to work. Break it anywhere — sluggish legs, stiff hips, a core that collapses — and the tip has to make up the difference. That make-up work is what lands on the elbow and shoulder as stress they can't safely absorb.",
        "There are four links worth feeling: the lower half, the hips, the trunk and shoulder blade, and the shoulder-elbow at the end. Good arms fire them in strict order, each one passing force to the next. The order is the whole lesson. Get the timing right and the arm feels free; get it wrong and the arm feels like it's doing everything alone.",
      ],
      claims: [
        kc("The kinetic chain represents a coordinated effort of muscle units from the entire body, culminating with explosive motion of the upper extremity.", "official-data", { label: "The Kinetic Chain in Overhand Pitching: Its Potential Role for Performance Enhancement and Injury Prevention", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3445080/" }),
        kc("Reduced kinetic energy delivered from the hip and trunk forces the shoulder to work harder to maintain the throw.", "official-data", { label: "The Kinetic Chain in Overhand Pitching: Its Potential Role for Performance Enhancement and Injury Prevention", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3445080/" }),
        kc("Energy builds as it moves from larger proximal muscles (lower body) to smaller distal muscles (upper body), with quicker deceleration of proximal segments corresponding to better energy transfer to the next segment.", "official-data", { label: "The Kinetic Chain in Overhand Pitching", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3445080/" }),
      ],
    },
    {
      heading: "Leg drive: the pitch starts in the ground",
      paragraphs: [
        "The first force in the throw comes up out of the dirt. Your back leg pushes you down the mound — not a soft glide, a real shove that sets the whole delivery's pace. The front leg reaches out and lands a touch closed, toward the arm side of straight, so the hips have something firm to turn into. When the front foot touches down, the lead knee is still soft and bent, ready to take the load and then brace against it.",
        "As you stride, the back hip is already opening, the front knee is starting to firm up, and the pelvis is accelerating toward the plate. The feel to chase: the hips lead, the chest waits. The pelvis begins to turn before the upper body follows — and that should happen on its own, out of good timing, not because you yank it open. Force it and you spend the elastic load early. The freer your hips and ankles move, the cleaner this unfolds, and the less the elbow has to cover for a lower half that didn't do its share.",
      ],
      claims: [
        kc("Stride length is a meaningful contributor to delivery, with a closed lead-foot landing relative to the mound centerline.", "official-data", { label: "The Clinician's Guide to Baseball Pitching Biomechanics", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9950989/" }),
        kc("Trail-hip rotational range relates to when the trunk starts rotating; restricted back-leg hip rotation dampens forward trunk movement.", "official-data", { label: "The Relationship Between Hip Range of Motion and Pitching Kinematics Related to Increased Elbow Valgus Loads in Collegiate Baseball Pitchers", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8016430/" }),
        kc("The lead knee is flexed at foot contact and braces toward extension by release; that bracing anchors the lower half so the trunk can rotate over it.", "official-data", { label: "The Clinician's Guide to Baseball Pitching Biomechanics", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9950989/" }),
      ],
    },
    {
      heading: "Hip-shoulder separation: the spring you wind",
      paragraphs: [
        "At foot plant, the hips are already turning toward the plate while the shoulders stay closed and lag behind. That gap between the lower body and the upper body is hip-shoulder separation — the wind in the spring. Your obliques and the fascia across your core stretch as the gap opens, and they store that stretch like a drawn bow. You don't see it as a number; you feel it as a coil across the belly and back, the chest held shut a beat longer than the hips.",
        "Then the front knee firms up, the lower half anchors, the hips keep driving into the ball, and the chest finally whips through to close the gap. That late, fast unwinding of the trunk is what releases the stored energy into the arm. The cue is patience, not effort: let the hips get ahead, hold the chest closed, and let the trunk snap through last.",
        "Here's the trap. If the hips can't turn cleanly — tight hips, weak glutes — the only way to feel separation is to drag the shoulders back even further, and now the shoulder is overstretched to fake a coil the lower half should have made. The opposite failure is just as costly: if the hips and chest turn together with no lag, there's no stretch to release, and the arm is left to supply the speed on its own. Both roads end at the same place — the arm doing the body's job.",
      ],
      claims: [
        kc("Hip-shoulder separation is the difference between the upper-trunk and pelvis rotation in the transverse plane; holding a window of peak separation is associated with better trunk force transfer.", "reputable-analysis", { label: "Pitching Biomechanics: Understanding Hip Shoulder Separation", url: "https://rocklandpeakperformance.com/pitching-biomechanics-hip-shoulder-separation/" }),
        kc("Holding hip-shoulder separation longer can improve force transfer through the trunk.", "reputable-analysis", { label: "Pitching Biomechanics: Understanding Hip Shoulder Separation", url: "https://rocklandpeakperformance.com/pitching-biomechanics-hip-shoulder-separation/" }),
        kc("Hip-shoulder separation relates to trunk rotation and pitching kinematics.", "official-data", { label: "The Relationship of Range of Motion, Hip Shoulder Separation, and Pitching Kinematics", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7727427/" }),
        kc("Limited lead-leg internal rotation is associated with early pelvic rotation that alters elbow positioning at release.", "official-data", { label: "The Relationship Between Hip Range of Motion and Pitching Kinematics Related to Increased Elbow Valgus Loads in Collegiate Baseball Pitchers", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8016430/" }),
      ],
    },
    {
      heading: "Lay-back: the riskiest position in the throw",
      paragraphs: [
        "By the time the arm reaches its deepest lay-back — the moment the forearm cocks back and the palm faces nearly up to the sky — most of the chain's work is already done. The hips are facing the plate, the chest is whipping through, and the shoulder blade is setting the arm in position to be slowed down. The arm is wound to the edge of what the shoulder can give, loaded and about to fire.",
        "This is the most dangerous instant in the delivery. The shoulder is at the far end of its range, and the inside of the elbow takes its hardest load — a force trying to pry the elbow open the wrong way. The ligament on the inside of the elbow, the UCL, holds the line against most of that load. When the chain is intact, the trunk is still feeding the arm and sharing the work. When the chain broke upstream, the shoulder and elbow meet that load alone — and that is where the tissue can be pushed past what it can take.",
      ],
      claims: [
        kc("At maximum external rotation (the end of arm cocking), the shoulder is at the extreme of its rotational range while the elbow is loaded at shoulder height.", "official-data", { label: "The Clinician's Guide to Baseball Pitching Biomechanics", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9950989/" }),
        kc("Shoulder internal rotation becomes extremely fast during the acceleration phase — one reason the delivery must be sequenced before the arm fires.", "official-data", { label: "The Clinician's Guide to Baseball Pitching Biomechanics", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9950989/" }),
        kc("The ulnar collateral ligament (UCL) is a primary static stabilizer of the medial elbow against the majority of the valgus load.", "official-data", { label: "The ulnar collateral ligament loading paradox between in-vitro and in-vivo studies on baseball pitching (narrative review)", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8130712/" }),
      ],
    },
    {
      heading: "Wrist, fingers, and the shape the chain delivers",
      paragraphs: [
        "Everything to this point built and aimed the energy. The wrist and fingers decide what it becomes. The chain delivers the speed; the hand writes the spin. This is the seam where biomechanics meets the grip — the same throw can leave as a four-seam that holds its line or a breaking ball that dives, and the difference lives in the last few inches at the fingertips.",
        "Feel it as a handoff. The arm comes through on its slot — the angle the hand travels, set by where the shoulder and trunk put it — and the slot tilts the axis the ball will spin on. A higher slot stands the spin up toward true backspin and a ball that fights gravity; a lower slot lays the axis over and turns ride into run. Then the fingers finish it. Staying behind the ball with even pressure sends it off clean and straight. Letting the ball come off the side of the fingers, or pulling down across it, tilts and rifles the spin into a breaking shape. The pitch is the chain's force, stamped by the hand at the very end.",
        "This is also why a tired or out-of-sync delivery flattens good pitches before the grip ever fails. If the chain broke upstream and the arm is dragging, the slot drops, the hand gets late, and the spin the grip was built to make never gets put on cleanly. Command and shape both start where the force does — in the ground — and the fingers only ever finish what the body already set up.",
      ],
      claims: [
        kc("Release kinematics — including forearm and wrist action at ball release — shape the spin and therefore the movement the pitch carries.", "official-data", { label: "The Clinician's Guide to Baseball Pitching Biomechanics", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9950989/" }),
        kc("Arm-slot and release point are governed by the trunk and shoulder position the kinetic chain delivers, linking lower-body sequence to the angle the ball leaves on.", "official-data", { label: "The Clinician's Guide to Baseball Pitching Biomechanics", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9950989/" }),
        kc("The wrist and fingers impart the final spin; finger pressure and the path of the hand off the ball determine spin direction and the resulting movement shape.", "reputable-analysis", { label: "The Kinetic Chain in Overhand Pitching", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3445080/" }),
      ],
    },
    {
      heading: "Release and braking: where arms break",
      paragraphs: [
        "From deepest lay-back to release is the fast part — a short, violent unspooling: the shoulder turns in, the elbow snaps straight, the wrist and fingers come through the ball. When the chain held, the trunk and back are still firing through this, helping brake the arm even as it accelerates. When the chain broke, the shoulder and elbow are accelerating alone, with none of the help they were counting on.",
        "Then comes the follow-through, and this is where pitchers are made or broken. It starts the instant the ball leaves the hand and runs until you've caught your balance and lowered the arm. Done right, the big muscles of the back and the rear of the shoulder do the slowing-down work, the forearm rolls over on its own, and the trunk folds out over the front leg so the hips and core soak up the stop. The whole body brakes the arm.",
        "Done wrong — when the trunk never passed the force along — the small structures are left to stop a fast-moving arm by themselves. The muscles around the elbow strain to slow it, the UCL strains to hold the joint, the rotator cuff strains to keep the shoulder seated. Those tissues were never meant to absorb the full stop alone. That is why the follow-through is real work, not a flourish: it is the body actively braking, and a body that braked the throw is a body that can throw again tomorrow.",
      ],
      claims: [
        kc("The proper kinetic sequence runs lead-knee bracing, pelvis rotation, upper-trunk rotation, elbow extension, then shoulder internal rotation — foot contact through ball release.", "official-data", { label: "The Clinician's Guide to Baseball Pitching Biomechanics", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9950989/" }),
        kc("During arm deceleration, slowing the upper extremity after rapid internal rotation generates heavy distraction forces through the shoulder.", "official-data", { label: "The Clinician's Guide to Baseball Pitching Biomechanics", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9950989/" }),
        kc("During deceleration, the big muscles of the back and posterior shoulder slow the arm while the forearm naturally pronates, reducing stress on the shoulder and elbow.", "reputable-analysis", { label: "The Pitching Follow Through: Key to Power and Health", url: "https://baseballscouter.com/pitching-follow-through-mechanics/" }),
        kc("Proper hip extension and trunk flexion control are necessary for effective eccentric braking of the throwing arm during deceleration.", "reputable-analysis", { label: "The Pitching Follow Through: Key to Power and Health", url: "https://baseballscouter.com/pitching-follow-through-mechanics/" }),
      ],
    },
  ],
  confidenceNote: "The teaching here is feel and sequence — what to do with your body, not what angle to hit. The biomechanics literature backing each point is peer-reviewed and coaching analysis; where those studies report joint angles, stride figures, or force percentages, that precision stays in the source list on the right, because nobody reading this has been measured and a number stated as instruction would be invented. Read the prose for the craft; follow the sources for the figures.",
  related: [
    { label: "Spin & Shape", to: "/learn/spin" },
    { label: "Pitch Design", to: "/learn/pitch-design" },
    { label: "Arm Health", to: "/learn/arm-health" },
    { label: "Youth", to: "/learn/youth" },
  ],
}
