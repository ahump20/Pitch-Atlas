import type { LostPitch, DocumentationTier } from '../types'
import { claim, secondhand, unverified } from '../sources'

/*
  Lost Pitches of the Negro Leagues. The statistics are being recovered; the
  technique mostly never will be. So every entry wears a documentation tier rather
  than a precision the record cannot support. The tier IS the feature. Same
  provenance model as the Craftsmen: our framing is original, every claim carries
  its source and the honest confidence an adversarial pass recommended, and a quote
  appears only when a real one was found.

  Reading order: documented anchors first (the hesitation pitch leads), then
  partially documented, then the legend tier — shown to mark the gap, never as fact.
*/

export const LOST_PITCHES: LostPitch[] = [
  {
    slug: "satchel-paige-hesitation-pitch",
    name: "Satchel Paige's Hesitation Pitch",
    kind: "pitch",
    era: "Negro Leagues / 1948 American League",
    tier: "documented",
    specimenNo: "N-01",
    tagline: "The pause the rulebook outlawed",
    intro: "Not a grip but a piece of timing: a two-stage delivery with a deliberate hitch at the very top of the windup, the front foot already planted, everything frozen for a beat before the arm finally came through. The pause broke the hitter's internal clock so completely that men swung before the ball was even gone. It is the rare lost pitch that died not from forgotten technique but from a presidential ruling.",
    what: claim(
      "A windup with a built-in stall at its peak, the lead foot down and the body held motionless for up to a beat before release, designed to desynchronize the hitter's timing so badly that some committed to a swing before the ball left Paige's hand.",
      "wiki-satchel-paige",
      "reputable-analysis",
    ),
    whyLost: claim(
      "The moment it reached the integrated majors it triggered a rules fight. After Paige threw it on July 9, 1948, the hitter flung his bat in disgust; American League president Will Harridge then ruled the move a balk under the continuous-motion rule, declaring any repeat illegal. The rulebook killed it on arrival, and it has no modern major-league equivalent.",
      "wiki-satchel-paige",
      "reputable-analysis",
    ),
    record: [
      {
        label: "The bat-throwing batter",
        claim: claim(
          "Paige threw the hesitation pitch to St. Louis Browns hitter Whitey Platt, who was so caught out that he hurled his bat up the third-base line; the Browns' bench argued it was a balk, but the on-field umpire let the strike stand.",
          "wiki-satchel-paige",
          "reputable-analysis",
        ),
      },
      {
        label: "The ruling",
        claim: claim(
          "AL president Will Harridge subsequently declared the hesitation pitch illegal, ruling that if Paige threw it again it would be called a balk.",
          "wiki-satchel-paige",
          "reputable-analysis",
        ),
      },
      {
        label: "Year",
        claim: claim(
          "The incident and ruling came during the 1948 American League season, Paige's rookie year in the majors at roughly age 42.",
          "wiki-satchel-paige",
          "reputable-analysis",
          { approximate: true },
        ),
      },
    ],
    rights: 'original',
  },
  {
    slug: "hilton-smith-curveball",
    name: "Hilton Smith's Curveball",
    kind: "pitcher",
    era: "Negro Leagues / 1930s-1940s",
    tier: "documented",
    specimenNo: "N-02",
    tagline: "The best curve a Hall of Famer ever saw, behind the most famous arm alive",
    intro: "The grip is gone; nobody wrote it down. But the movement survives in the testimony of men who are themselves in Cooperstown, which is a stronger paper trail than most grips ever get. Buck O'Neil, who roomed with him for a decade, said it was the best curveball he ever saw. Monte Irvin said you could know it was coming and the late break still beat you. This is the emotional center of the wing: a pitch documented entirely by the eyes of great hitters, thrown by a man the spotlight never found.",
    what: claim(
      "An exceptionally sharp curveball with a hard, late downward break, remembered by Hall of Fame contemporaries as among the finest they ever faced; the grip itself went unrecorded, but the movement is documented through eyewitness testimony.",
      "sabr-hilton-smith",
      "coach-observed",
    ),
    whyLost: claim(
      "Smith spent his Kansas City Monarchs years relieving Satchel Paige, who would throw a few crowd-pleasing innings before handing the real workload to Smith; the headlines followed Satchel, leaving Smith remembered as the 'forgotten star' of the Negro Leagues.",
      "bbhof-hilton-smith",
      "reputable-analysis",
    ),
    record: [
      {
        label: "Buck O'Neil's verdict",
        claim: secondhand(
          "O'Neil, Smith's roommate for roughly a decade, held that from 1940 to 1946 Smith might have been the best pitcher in the world, and said that after seeing the curve in 1941 exhibitions, big-leaguers Stan Musial and Johnny Mize had never seen a curveball like it.",
          "sabr-hilton-smith",
          "O'Neil recollection as recorded in Smith's SABR biography; eyewitness testimony relayed through the bio, not measured data.",
        ),
      },
      {
        label: "Career league wins",
        claim: claim(
          "Smith won about 161 recorded league games over his career and was inducted into the Hall of Fame in 2001, eighteen years after his death.",
          "sabr-hilton-smith",
          "reputable-analysis",
          { approximate: true },
        ),
      },
    ],
    quote: secondhand(
      "Monte Irvin recalled that Smith had one of the finest curveballs he ever had the displeasure of trying to hit — that it fell off the table, and that even when you knew where it was coming from you still couldn't hit it because it was that sharp.",
      "bbhof-hilton-smith",
      "Paraphrase of a Monte Irvin recollection as published on the Baseball Hall of Fame's Hilton Smith page; relayed quote rather than primary measured data.",
    ),
    rights: 'original',
  },
  {
    slug: "rube-foster-fadeaway",
    name: "Rube Foster's Fadeaway",
    kind: "pitcher",
    era: "Negro Leagues / 1900s-1910s",
    tier: "documented",
    specimenNo: "N-03",
    tagline: "The screwball of the man who built the leagues",
    intro: "Before he was the architect of organized Black baseball, Andrew Foster was its best pitcher, and his out-pitch was a screwball his own players described as a fadeaway — a ball that ran away from the bat the way Christy Mathewson's did. Teammate Dave Malarcher named it. Foster is remembered now as the founder, not the arm, which is its own kind of losing.",
    what: claim(
      "A screwball that broke away from hitters — what teammate Dave Malarcher described as a fadeaway — paired with a baffling curve and a strong fastball, the out-pitch of the era's most dominant Black pitcher before he turned to building leagues.",
      "sabr-rube-foster",
      "coach-observed",
    ),
    whyLost: claim(
      "Foster's identity as the founder of organized Black baseball eclipsed his pitching legacy; he is remembered as the 'Father of Black Baseball' and the man who built the first viable Negro League, not for the fadeaway that made his name on the mound.",
      "sabr-rube-foster",
      "reputable-analysis",
    ),
    record: [
      {
        label: "Malarcher's description",
        claim: secondhand(
          "Dave Malarcher recalled that Foster had one of the most baffling curveballs he ever looked at, a real fastball, and a breaking ball that was more what people would call a fadeaway.",
          "sabr-rube-foster",
          "Malarcher recollection as recorded in Foster's SABR biography; teammate testimony relayed through the bio.",
        ),
      },
      {
        label: "Founded the Negro National League",
        claim: claim(
          "Foster organized the original Negro National League on February 13, 1920, at a Kansas City meeting where eight Black baseball teams agreed to form a league modeled on the white majors.",
          "sabr-rube-foster",
          "reputable-analysis",
        ),
      },
    ],
    rights: 'original',
  },
  {
    slug: "bullet-rogan-arsenal",
    name: "Bullet Rogan's Arsenal",
    kind: "pitcher",
    era: "Negro Leagues / 1920s",
    tier: "documented",
    specimenNo: "N-04",
    tagline: "Everything, from no windup, both arm slots",
    intro: "Most pitchers have a pitch. Bullet Rogan had a toolbox: a fastball that gave him the nickname, an array of curves, a forkball, a palmball, and a spitball — and he threw all of it from a no-windup delivery, switching between overhand and sidearm to change the angle on the hitter. His own catcher said he had every kind of ball, and threw a master curve right out of his palm.",
    what: claim(
      "An unusually deep repertoire — fastball, multiple curves, a forkball, a palmball, and a spitball — delivered with no windup and from both overhand and sidearm angles, letting Rogan vary movement and release point against any hitter.",
      "wiki-bullet-rogan",
      "reputable-analysis",
    ),
    whyLost: claim(
      "Rogan's two-way brilliance — he both pitched and hit at an elite level — and the disappearance of the spitball and emery ball from the rulebook left his finesse-heavy, doctored-ball arsenal without a legal home once the white majors integrated.",
      "sabr-bullet-rogan",
      "reputable-analysis",
    ),
    record: [
      {
        label: "No-windup, two arm slots",
        claim: claim(
          "Rogan used a no-windup delivery and threw from both overhand and sidearm motions, working in an array of curveballs, a spitball, a palmball, a forkball, and the fastball that earned his nickname.",
          "wiki-bullet-rogan",
          "reputable-analysis",
        ),
      },
      {
        label: "Recorded pitching line",
        claim: claim(
          "Seamheads' reconstruction credits Rogan with roughly 130 wins against 61 losses, a 2.70 ERA, and over 1,000 strikeouts across his career; he was elected to the Hall of Fame in 1998.",
          "seamheads-rogan",
          "reputable-analysis",
          { approximate: true },
        ),
      },
    ],
    quote: secondhand(
      "His catcher Frank Duncan said Rogan threw hard and had everything — forkballs, spitballs, any kind of ball — plus a master curve he threw right out of his palm, and could drop down sidearm so it jumped in on right-handed hitters.",
      "sabr-bullet-rogan",
      "Frank Duncan recollection as recorded in Rogan's SABR biography; teammate testimony relayed through the bio.",
    ),
    rights: 'original',
  },
  {
    slug: "smokey-joe-williams-fastball",
    name: "Smokey Joe Williams's Fastball",
    kind: "pitcher",
    era: "Negro Leagues / 1910s-1930s",
    tier: "documented",
    specimenNo: "N-05",
    tagline: "27 strikeouts at 44, in a duel where the gentlemen's agreement broke",
    intro: "Williams's fastball legend survives through testimony and a single recovered box score. On August 2, 1930, at age 44, he and the Monarchs' Chet Brewer met in a night game and a side agreement was struck that neither would throw the emery ball. Brewer broke it first when runners reached base; Williams was handed sandpaper, and the duel was on. Williams struck out 27 over twelve innings and won 1-0 on a one-hitter.",
    what: claim(
      "A feared fastball from the testimony era — an overpowering pitch that, even at age 44, produced one of the most dominant strikeout performances in the recovered Negro Leagues record.",
      "sabr-smokey-bandit",
      "reputable-analysis",
    ),
    whyLost: claim(
      "Williams pitched almost entirely before reliable record-keeping and before integration, so his fastball legend survives mostly through testimony and a handful of reconstructed box scores rather than measurement; there is no radar reading, only the 27-strikeout night to point to.",
      "sabr-smokey-bandit",
      "reputable-analysis",
    ),
    record: [
      {
        label: "The line",
        claim: claim(
          "On August 2, 1930, the 44-year-old Williams struck out 27 batters over 12 innings, allowing one hit, in a 1-0 Homestead Grays win over the Kansas City Monarchs.",
          "sabr-smokey-bandit",
          "reputable-analysis",
        ),
      },
      {
        label: "The broken emery-ball pact",
        claim: secondhand(
          "By Cum Posey's later account, both sides agreed before the game that neither pitcher would use the emery ball; when the Grays got runners on in the first, Brewer brought out his 'work,' Williams was then handed a sheet of sandpaper, and both threw the doctored ball the rest of the way.",
          "baseball-history-daily-brewer",
          "The agreement-then-violation detail traces to Cum Posey's 1936 Pittsburgh Courier recollection as quoted by Baseball History Daily; the SABR account of the game does not carry the pact detail, so it is relayed through a secondary source.",
        ),
      },
    ],
    rights: 'original',
  },
  {
    slug: "chet-brewer-emery-ball",
    name: "Chet Brewer's Emery Ball",
    kind: "pitcher",
    era: "Negro Leagues / 1920s-1930s",
    tier: "documented",
    specimenNo: "N-06",
    tagline: "Scuff one side and it dives like a spitter, no spit required",
    intro: "Brewer roughed one side of the ball so it dove like a spitball without any moisture — a dry doctored pitch he learned from the men who specialized in it. He set it next to a live, running fastball and a hard overhand drop, and the package made him one of the great finesse arms of the Negro Leagues. The same scuffing that made him was banned in the white majors before he ever could have crossed over.",
    what: claim(
      "An emery ball — one side of the baseball deliberately scuffed so it dove sharply like a spitball without any moisture — paired with a lively running fastball and a hard overhand drop, learned from established emery specialists.",
      "sabr-chet-brewer",
      "reputable-analysis",
    ),
    whyLost: claim(
      "The emery ball was banned in the white major leagues after 1920; Brewer built his career on a pitch that was legal in his game and illegal in theirs, so when integration came his signature offering had no lawful place.",
      "wiki-chet-brewer",
      "reputable-analysis",
    ),
    record: [
      {
        label: "Where he learned it",
        claim: claim(
          "Brewer learned the emery ball from Emory 'Country' Osborne and Ted 'Double Duty' Radcliffe, and threw it alongside a live fastball and a devastating overhand drop that was especially hard on left-handed hitters.",
          "wiki-chet-brewer",
          "reputable-analysis",
        ),
      },
      {
        label: "Radcliffe on the technique",
        claim: secondhand(
          "Radcliffe, who taught it, claimed to be the best at the emery ball — hiding a piece of emery cloth in his chewing gum and using it to make the ball break any way he wanted.",
          "wiki-chet-brewer",
          "Radcliffe's own description as relayed in Brewer's Wikipedia entry; first-person claim quoted through a secondary source.",
        ),
      },
    ],
    rights: 'original',
  },
  {
    slug: "phil-cockrell-spitball",
    name: "Phil Cockrell's Spitball",
    kind: "pitcher",
    era: "Negro Leagues / 1918-1932",
    tier: "documented",
    specimenNo: "N-07",
    tagline: "A moist-ball artist, and the day the leagues' divergence stood on the field",
    intro: "Cockrell was a 'moist ball' artist — a controlled spitballer, not a slobberer — with uncanny command and a stack of no-hitters across fifteen years for Hilldale. His pitch is the cleanest illustration of the two-rulebook world: in the 1924 Colored World Series, a white umpire from the International League stopped play to enforce the spitball ban, and the dispute was only settled when Hilldale's side appealed to commissioner Rube Foster, who told them to let him keep throwing it.",
    what: claim(
      "A controlled 'moist ball' spitball — lightly dampened rather than heavily loaded — thrown with uncanny command, the foundation of a fifteen-year Hilldale career studded with no-hitters.",
      "sabr-phil-cockrell",
      "reputable-analysis",
    ),
    whyLost: claim(
      "The spitball was banned in the white majors after 1919, but the Negro National and Eastern Colored Leagues never adopted the ban — so Cockrell's whole craft was legal in his game and outlawed in the other, leaving it no path forward when the leagues finally merged.",
      "sabr-phil-cockrell",
      "reputable-analysis",
    ),
    record: [
      {
        label: "The 1924 on-field standoff",
        claim: claim(
          "In Game One of the 1924 Colored World Series, on a 1-and-2 count to the Monarchs' Lem Hawkins, Cockrell's spitball prompted a white International League umpire to stop play to enforce the ban; Hilldale's Ed Bolden appealed to NNL commissioner Rube Foster to let the game continue without prohibiting the pitch, and Foster agreed.",
          "sabr-phil-cockrell",
          "reputable-analysis",
          { note: "SABR records the intervention as Ed Bolden appealing to Foster, who agreed — not Foster physically halting play on the field; framed to match the bio." },
        ),
      },
      {
        label: "No-hitters",
        claim: claim(
          "Cockrell is credited with about six no-hitters over his career, including performances against the Detroit Stars and the Chicago American Giants.",
          "sabr-phil-cockrell",
          "reputable-analysis",
          { approximate: true },
        ),
      },
    ],
    rights: 'original',
  },
  {
    slug: "doctored-ball-divergence-and-recovery",
    name: "The Doctored-Ball Divergence and the Recovery",
    kind: "doctored",
    era: "1920 ban through 2024 recovery",
    tier: "documented",
    specimenNo: "N-08",
    tagline: "Two rulebooks, one career-killer, and a hundred-year correction",
    intro: "Here is the killer insight that ties the wing together. When the white majors banned the spitball, shine ball, emery ball, and mud ball in 1920, the Negro National and Eastern Colored Leagues did not adopt the ban — these pitches were permitted, not banned, in Black baseball, though even that was contested at the edges. So a whole generation built careers on craft that was legal in their game and illegal in the other; integration gave that skill no legal home. The record almost vanished with it — and then, a century later, baseball went looking for it.",
    what: claim(
      "A divergence in the rulebooks: the spitball, shine, emery, and mud ball were outlawed in the white majors after 1919-1920, but the Negro National and Eastern Colored Leagues left them permitted — so an entire cohort of Black pitchers mastered pitches that had no lawful future once the leagues merged. Best read as 'permitted / not banned' rather than affirmatively legalized, and even that was contested at the edges, as the 1924 Cockrell standoff shows.",
      "sabr-phil-cockrell",
      "reputable-analysis",
    ),
    whyLost: claim(
      "These careers were lost twice — first because the pitches that defined them were illegal in the integrated game, and second because the statistical record was nearly erased. The recovery came late: in December 2020 MLB granted major-league status to seven Negro Leagues (1920-1948), and in May 2024 it folded roughly 2,300 players' statistics into the official record. The reconstruction was possible only because the Seamheads Negro Leagues Database had rebuilt the numbers from surviving box scores.",
      "cbs-negro-leagues-2024",
      "reputable-analysis",
    ),
    record: [
      {
        label: "2020: major-league status restored",
        claim: claim(
          "On December 16, 2020, MLB elevated seven Negro Leagues operating from 1920 to 1948 to major-league status, covering roughly 3,400 players, and stated that the 1969 Special Baseball Records Committee's omission of the Negro Leagues was 'clearly an error.'",
          "pbs-negro-leagues-2020",
          "reputable-analysis",
        ),
      },
      {
        label: "2024: stats fold into the record",
        claim: claim(
          "In late May 2024, MLB integrated the statistics of more than 2,300 Negro Leagues players into the official record, which moved Josh Gibson to the all-time career leads in batting average (about .372), slugging, and OPS, ahead of Ty Cobb and Babe Ruth.",
          "cbs-negro-leagues-2024",
          "official-data",
          { approximate: true },
        ),
      },
      {
        label: "How the record was rebuilt",
        claim: claim(
          "The Seamheads Negro Leagues Database reconstructed the statistics game-by-game from contemporary box scores, newspaper accounts, and scoresheets, covering every U.S. season from 1886 through 1948, with the 1920s the most completely documented decade — researchers believe they have roughly 90% of that decade's box scores.",
          "seamheads-db",
          "reputable-analysis",
          { note: "The reconstruction method and 1886-1948 coverage are confirmed on the reachable Seamheads database homepage; the specific ~90%-of-1920s-box-scores figure is reported in Baseball-Reference's Negro Leagues data FAQ, which I confirmed via search but could not load directly (the site blocks the fetcher), so the precise percentage is relayed rather than first-hand verified.", approximate: true },
        ),
      },
    ],
    rights: 'original',
  },
  {
    slug: "cannonball-dick-redding",
    name: "Cannonball Dick Redding",
    kind: "pitcher",
    era: "Deadball / Negro Leagues (1911–1936)",
    tier: "partial",
    specimenNo: "N-09",
    tagline: "Three fastballs and superb control",
    intro: "An early power ace of Black baseball, Redding earned his nickname the only way it could be earned — by throwing the ball past everyone. The reputation is enormous and well-attested; the granular pitch detail is not. What survives is the shape of his game, not the grip of his hand on the ball.",
    what: claim(
      "An overpowering fastball thrown from a no-windup delivery, so dominant early in his career that he leaned almost entirely on raw power.",
      "nl-redding-sabr",
      "reputable-analysis",
    ),
    whyLost: claim(
      "His era predates pitch-tracking and detailed mechanical writeups; what survives is reputation and contemporary testimony, not grip or movement data.",
      "nl-redding-sabr",
      "reputable-analysis",
    ),
    record: [
      {
        label: "Repertoire as described",
        claim: secondhand(
          "A writer characterized his arsenal as essentially three fastballs — one on the outer half, one down the middle, one inside — backed by superb control.",
          "nl-redding-sabr",
          "Paraphrase of writer David Barr as relayed in the SABR BioProject biography; a secondary characterization, not a measured arsenal.",
        ),
      },
      {
        label: "Nickname origin",
        claim: claim(
          "The 'Cannonball' nickname is attributed to a fastball said to knock catchers back behind the plate.",
          "nl-redding-sabr",
          "reputable-analysis",
          { approximate: true },
        ),
      },
    ],
    rights: 'original',
  },
  {
    slug: "leon-day-no-windup",
    name: "Leon Day",
    kind: "pitcher",
    era: "Negro Leagues (1934–1950)",
    tier: "partial",
    specimenNo: "N-10",
    tagline: "He cocked it at his ear and threw",
    intro: "Day was the rare Negro Leagues ace whose deception lived in his delivery rather than a signature breaking ball — a short-arm, no-windup motion that gave hitters almost nothing to time. A Hall of Famer by 1995, he is remembered for how little he announced himself, on the mound and off. The exact grip behind the heat did not survive.",
    what: claim(
      "A blazing fastball delivered from a short-arm, no-windup motion — he essentially cocked the ball at his ear and threw, a delivery he traced to throwing from second base.",
      "nl-day-sabr",
      "reputable-analysis",
    ),
    whyLost: claim(
      "The biography documents the delivery and a general fastball-curve-changeup mix but no grip-level technical detail; the mechanics that made it work are described, not diagrammed.",
      "nl-day-sabr",
      "reputable-analysis",
    ),
    record: [
      {
        label: "How the fastball read",
        claim: secondhand(
          "A teammate remembered the fastball as genuinely overpowering, set off by a strong curveball.",
          "nl-day-sabr",
          "Attributed to Larry Doby in the SABR biography; a contemporary teammate's impression of the heat from an era without radar, kept as a read of the pitch rather than a measured figure.",
        ),
      },
      {
        label: "Versatility",
        claim: secondhand(
          "Between starts he played the field, including center field, well enough that teammates rated his glove with the regulars.",
          "nl-day-sabr",
          "Based on Monte Irvin's recollection as quoted by SABR.",
        ),
      },
    ],
    rights: 'original',
  },
  {
    slug: "dave-brown-lefty-ace",
    name: "Dave Brown",
    kind: "pitcher",
    era: "Negro Leagues (1918–1925, then under aliases)",
    tier: "partial",
    specimenNo: "N-11",
    tagline: "The early-'20s lefty whose record outran his record",
    intro: "For three seasons Brown was the best left-handed pitcher in Black baseball — the ace of a dominant Chicago American Giants staff. Then a 1925 killing he was tied to sent him underground, and the on-field record simply stops. The arm was elite; the documentation of how it worked is thin and got thinner the moment he disappeared.",
    what: claim(
      "An elite left-hander who anchored the Chicago American Giants in the early 1920s, leading the league in run prevention at his peak.",
      "nl-brown-sabr",
      "reputable-analysis",
    ),
    whyLost: claim(
      "His career ended abruptly when he became a fugitive in 1925 and pitched only under aliases afterward; the biography records statistics and the disappearance, not pitch mechanics.",
      "nl-brown-sabr",
      "reputable-analysis",
    ),
    record: [
      {
        label: "Breakout season run prevention",
        claim: claim(
          "In his 1920 breakout he led the league in earned-run average at 1.82 while going 13-3.",
          "nl-brown-sabr",
          "reputable-analysis",
          { note: "Negro Leagues league totals are reconstructed from surviving box scores and carry season-to-season completeness gaps; treat the figures as the best available reconstruction.", approximate: true },
        ),
      },
      {
        label: "Career cut short",
        claim: claim(
          "His professional career effectively ended in 1925 when he went on the lam and later pitched semipro ball under the alias 'Lefty Wilson.'",
          "nl-brown-sabr",
          "reputable-analysis",
        ),
      },
    ],
    rights: 'original',
  },
  {
    slug: "william-bell-sr-workhorse",
    name: "William Bell Sr.",
    kind: "pitcher",
    era: "Negro Leagues (1923–1937)",
    tier: "partial",
    specimenNo: "N-12",
    tagline: "Outsmarted you at the plate",
    intro: "Bell was the kind of pitcher contemporaries compared to a polished big-leaguer: durable, in command, mixing his pitches and thinking ahead of the hitter. He carried pennant-winning Kansas City Monarchs staffs through the mid-1920s. What we have is the texture of his craft — control and guile — not the grips that produced it.",
    what: claim(
      "A durable, intelligent workhorse with excellent control who, in a contemporary's words, would mix his pitches and out-think hitters at the plate.",
      "nl-bell-sabr",
      "reputable-analysis",
    ),
    whyLost: claim(
      "The SABR biography stresses his command and intelligence but gives no grip-level pitch detail; the technique is described by its effect, not its mechanics.",
      "nl-bell-sabr",
      "reputable-analysis",
    ),
    record: [
      {
        label: "Pitch mix as described",
        claim: claim(
          "A museum profile credits him with a moving fastball, a good curve and change, a slider, and excellent control.",
          "nl-bell-emuseum",
          "reputable-analysis",
          { note: "Pitch-type labels like 'slider' are applied retrospectively by the museum profile; for a 1920s pitcher these are descriptive categorizations, not contemporary measured definitions.", approximate: true },
        ),
      },
      {
        label: "Spitball-era context",
        claim: unverified(
          "He pitched in the era when the spitball was being phased out of organized baseball, but no source documents Bell himself throwing one.",
          "Neither the SABR biography nor the eMuseum profile attributes a spitball to Bell; the spitball framing is era context only, included to avoid implying a documented pitch that the sources do not support.",
          "nl-bell-sabr",
        ),
      },
    ],
    rights: 'original',
  },
  {
    slug: "paige-bee-ball",
    name: "Satchel Paige's Bee Ball",
    kind: "pitch",
    era: "Negro Leagues / MLB (1920s–1960s)",
    tier: "partial",
    specimenNo: "N-13",
    tagline: "It be where I want it to be",
    intro: "The Bee Ball was Paige's high, hard fastball, and its famous name was as much a control boast as a movement description — he said it would 'be' right where he wanted it. It sits in the documented part of Paige's named-pitch catalog, which is why it lands as partial rather than legend. The name survives precisely; the mechanics are theater on top of a fastball.",
    what: claim(
      "A hard fastball Paige named the Bee Ball, with the name doubling as a control boast — that it would be exactly where he wanted it.",
      "nl-paige-sabr-journal",
      "reputable-analysis",
    ),
    whyLost: claim(
      "Paige's pitch names were showmanship layered over what was essentially a fastball; the catalog of names survives, but no grip or movement specification does.",
      "nl-paige-sabr-journal",
      "reputable-analysis",
    ),
    record: [
      {
        label: "The name's meaning",
        claim: claim(
          "A SABR journal article records the Bee-Ball's name as Paige's line that 'it be where I want it to be' — a statement of pinpoint command more than spin.",
          "nl-paige-sabr-journal",
          "reputable-analysis",
        ),
      },
      {
        label: "Pitch family",
        claim: claim(
          "It belonged to a fastball-heavy repertoire; the same source lists Long Tom as a 'super fastball' alongside it.",
          "nl-paige-sabr-journal",
          "reputable-analysis",
        ),
      },
    ],
    rights: 'original',
  },
  {
    slug: "paige-trouble-ball",
    name: "Satchel Paige's Trouble Ball",
    kind: "pitch",
    era: "Negro Leagues / MLB (1920s–1960s)",
    tier: "partial",
    specimenNo: "N-14",
    tagline: "A named fastball, specifics unrecoverable",
    intro: "The Trouble Ball is another entry in Paige's catalog of colorfully named pitches, attested in the same documented SABR set as the Bee Ball. Beyond the name and its place in his arsenal, the specifics are thin — what exactly distinguished it is not recoverable. It is real and attested, and honestly that is most of what can be said.",
    what: claim(
      "A named pitch in Paige's documented arsenal — one of the colorful labels he applied to what were largely fastballs.",
      "nl-paige-sabr-journal",
      "reputable-analysis",
    ),
    whyLost: claim(
      "The name is documented but the distinguishing grip or movement is not; like most of Paige's catalog, the specifics behind the label were never recorded in recoverable detail.",
      "nl-paige-sabr-journal",
      "reputable-analysis",
    ),
    record: [
      {
        label: "Attestation",
        claim: claim(
          "A SABR journal article lists the Trouble ball among Paige's pitches alongside the Blooper, Long Tom, and the Bee-Ball.",
          "nl-paige-sabr-journal",
          "reputable-analysis",
        ),
      },
      {
        label: "Recoverable specifics",
        claim: unverified(
          "What physically set the Trouble Ball apart from his other fastball variants is not documented in any source consulted.",
          "The pitch name is attested in the SABR journal article, but no consulted source describes its grip or movement; the gap is genuine, not an oversight.",
          "nl-paige-sabr-journal",
        ),
      },
    ],
    rights: 'original',
  },
  {
    slug: "paige-showman-arsenal",
    name: "Paige's named arsenal (the showman layer)",
    kind: "pitch",
    era: "Negro Leagues / barnstorming, 1920s–1950s",
    tier: "legend",
    specimenNo: "N-15",
    tagline: "A marketing campaign disguised as a repertoire — repeated everywhere, documented almost nowhere.",
    intro: "Satchel Paige sold pitches the way a carnival sells rides. Long Tom and Short Tom, the Midnight Creeper, the Jump Ball, the Wobbly Ball, the Whipsy-Dipsy-Do, the Bat Dodger, the Nothin' Ball, the Bee Ball, and the round-number boast of nineteen different pitches — the list shows up in trivia roundups, encyclopedias, and museum copy. The trouble is that the list and the record do not match, and the names themselves drift from one telling to the next. This entry ships as legend on purpose: it is the cleanest illustration on the whole site of the gap between a good story and a sourced one.",
    what: claim(
      "A long roster of self-named pitches Paige marketed across his career, most of which the documented record treats as one overpowering fastball wearing many names rather than distinct, separable pitch shapes.",
      "loc-whipsy-dipsy",
      "pitcher-own-words",
      { note: "The names are Paige's own showmanship, quoted directly by the Library of Congress from Paige; they are not a verified pitch taxonomy and do not appear in the SABR biographical record." },
    ),
    whyLost: claim(
      "Many of these never existed as discrete, documented pitches. By the analysis a major baseball writer applied, Paige threw essentially one pitch — a fastball — and renamed it Bat Dodger, Midnight Rider, Midnight Creeper, Jump Ball, Trouble Ball and the rest. The legend swallowed the mechanics: the naming was the act, and the act outlived any record of distinct grips.",
      "wiki-satchel-paige",
      "reputable-analysis",
      { note: "Wikipedia relays writer Joe Posnanski's read that the differently-named pitches were essentially all fastballs; shipped as analysis, not as a confirmed mechanical inventory." },
    ),
    record: [
      {
        label: "Claimed pitch count",
        claim: secondhand(
          "The marketed boast of nineteen different pitches, carried in trivia and roundup retellings and attributed to Paige's own salesmanship rather than to any pitch-tracking record.",
          "trivia-mafia-paige",
          "Sourced to Trivia Mafia relaying Negro Leagues Baseball Museum president Bob Kendrick; framed there as Paige playing the game of oral history. This is a showman label, not a documented count, and does not appear in SABR's Paige biography.",
        ),
      },
      {
        label: "Names quoted in Paige's own words",
        claim: claim(
          "In a quoted boast Paige rattled off a jump ball, be ball, screwball, wobbly ball, whipsy-dipsy-do, hurry-up ball, nothin' ball, and bat dodger, on top of his fastball Long Tom.",
          "loc-whipsy-dipsy",
          "pitcher-own-words",
          { note: "Quoted by the Library of Congress; these are showman labels Paige assigned, not a verified pitch taxonomy, and none appear in the SABR Paige biography." },
        ),
      },
      {
        label: "Names drift between tellings",
        claim: secondhand(
          "The same legend lists the lob pitch as a Two-Hopper in one museum-sourced telling and a Two-Hump Blooper in others — the names shift from source to source, which is itself the tell that this is oral tradition, not a documented arsenal.",
          "trivia-mafia-paige",
          "The Two-Hopper / Two-Hump drift across Trivia Mafia and trivia roundups demonstrates the instability of the list; shipped as legend, not fact.",
        ),
      },
      {
        label: "What the documented record actually shows",
        claim: claim(
          "Paige's SABR biography, the most authoritative life account, names none of these showman pitches at all — its only line on his stuff says he relied on raw power with no curve, slider, or change-of-pace finesse for most of his prime.",
          "sabr-paige-bioproj",
          "reputable-analysis",
        ),
      },
    ],
    rights: 'original',
  },
]

/** Tier display order and labels for the hall. */
export const LOST_PITCH_TIERS: { tier: DocumentationTier; index: string; label: string; note: string }[] = [
  {
    tier: 'documented',
    index: 'N',
    label: 'Documented',
    note: 'A hard paper trail: a rule change, league records, or a named eyewitness on the record.',
  },
  {
    tier: 'partial',
    index: 'P',
    label: 'Partially documented',
    note: 'Attested but thin. A name and a description survive; the grip does not.',
  },
  {
    tier: 'legend',
    index: 'L',
    label: 'Legend',
    note: 'Showman labels and oral tradition. Shipped flagged, shown to mark the gap, never as fact.',
  },
]

const BY_SLUG: Record<string, LostPitch> = Object.fromEntries(
  LOST_PITCHES.map((p) => [p.slug, p]),
)

export function lostPitchBySlug(slug: string): LostPitch | undefined {
  return BY_SLUG[slug]
}

export function lostPitchesByTier(tier: DocumentationTier): LostPitch[] {
  return LOST_PITCHES.filter((p) => p.tier === tier)
}
