(function (g) {
g.CATALOG_RAW = {
  "version": 1,
  "notes": "Single source of truth for upgrades, cosmetics and balls. All numbers are multipliers of the game's existing base values (paddle length, paddle speed, ball speed) so they plug into whatever the current code uses. Neon Pong 4.0 live copy: this file is embedded in NeonPong.exe and assets/catalog.json overrides it at startup. Both online players must use the same file.",
  "match": {
    "pointsToWin": 21,
    "pointsToWinOptions": [
      11,
      21,
      31
    ],
    "winByTwo": false,
    "matchPointBannerAt": 20
  },
  "upgradeEconomy": {
    "currency": "UP",
    "currencyName": "Upgrade Points",
    "adaptNote": "Adapted to the existing game (SPEC 0.3): UP is earned by scoring and unspent UP resets when the opponent scores (the v2 streak rule). The shop still opens after every point (everyNTotalPoints 1); set it to 4 for the spec's default cadence.",
    "earnPerPointScored": 1,
    "underdogEarn": {
      "trailingBy": 4,
      "bonusUPWhenConceding": 1,
      "keepUnspent": true
    },
    "underdogDiscount": {
      "trailingBy": 5,
      "tiers": [
        2,
        3
      ],
      "discount": 1,
      "minCost": 1
    },
    "upgradeBreak": {
      "everyNTotalPoints": 1,
      "timerSeconds": 15,
      "skipWhenBothReady": true,
      "noBreakAtMatchPoint": false,
      "goalBeatSec": 1.4
    },
    "slots": {
      "mod": 1,
      "ultimate": 1
    },
    "caps": {
      "paddleLengthMax": 1.6,
      "paddleLengthMin": 0.6,
      "paddleSpeedMax": 1.5,
      "ballSpeedMax": 2.2,
      "ballSpeedMaxDuringSmash": 2.6
    },
    "resetUnspentOnConcede": true,
    "base": {
      "paddleLength": 108,
      "paddleSpeed": 650,
      "ballSpeed": 443,
      "hitSpeedMult": 1.045,
      "maxAngleDeg": 59,
      "paddleAccelSec": 0.08,
      "serveDelaySec": 1.5
    }
  },
  "upgradeTiers": [
    {
      "tier": 1,
      "name": "Tune-Ups",
      "cost": 1,
      "color": "#00f0ff",
      "rule": "Permanent for the match. Each one stacks up to its max.",
      "items": [
        {
          "id": "t1_long",
          "name": "Long Paddle",
          "icon": "arrows-v",
          "type": "passive",
          "maxStacks": 2,
          "effect": "+12% paddle length per stack.",
          "params": {
            "paddleLength": 0.12
          },
          "formerly": "Extension"
        },
        {
          "id": "t1_quick",
          "name": "Quick Hands",
          "icon": "bolt",
          "type": "passive",
          "maxStacks": 2,
          "effect": "+10% paddle speed per stack.",
          "params": {
            "paddleSpeed": 0.1
          },
          "formerly": "Thrust"
        },
        {
          "id": "t1_heavy",
          "name": "Heavy Hitter",
          "icon": "fist",
          "type": "passive",
          "maxStacks": 2,
          "effect": "Your returns leave 6% faster per stack.",
          "params": {
            "returnSpeed": 0.06
          },
          "formerly": "Hot Return"
        },
        {
          "id": "t1_grip",
          "name": "Grip Tape",
          "icon": "angle",
          "type": "passive",
          "maxStacks": 2,
          "effect": "+6° max return angle per stack. More control over where it goes.",
          "params": {
            "maxAngleDeg": 6
          }
        },
        {
          "id": "t1_dash",
          "name": "Dash",
          "icon": "dash",
          "type": "active",
          "maxStacks": 2,
          "key": "dash",
          "effect": "Tap Dash for a 0.2s burst at 2x paddle speed. Cooldown 4s (2.5s at 2 stacks).",
          "params": {
            "burstMult": 2.0,
            "burstSec": 0.2,
            "cooldownSec": [
              4,
              2.5
            ]
          }
        },
        {
          "id": "t1_tracer",
          "name": "Tracer",
          "icon": "dots",
          "type": "passive",
          "maxStacks": 2,
          "effect": "Shows a dotted preview of the first 20% of the ball's path after your opponent hits (35% at 2 stacks).",
          "params": {
            "previewFraction": [
              0.2,
              0.35
            ]
          }
        },
        {
          "id": "t1_steady",
          "name": "Steady Serve",
          "icon": "target",
          "type": "passive",
          "maxStacks": 1,
          "effect": "Serves toward you start 15% slower, so you can set up.",
          "params": {
            "incomingServeSpeed": -0.15
          }
        }
      ]
    },
    {
      "tier": 2,
      "name": "Mods",
      "cost": 2,
      "color": "#ff2bd6",
      "rule": "Max 1 of each. Passives stack with Tune-Ups up to the caps. Only ONE active Mod at a time (1 Mod slot).",
      "worthItNote": "Why Mods are worth it: stat Mods give ~15% per UP vs 10–12% for Tune-Ups, skip the stack limits, and the active Mods can't be bought anywhere else.",
      "items": [
        {
          "id": "t2_titan",
          "name": "Titan Paddle",
          "icon": "arrows-v-big",
          "type": "passive",
          "maxStacks": 1,
          "effect": "+30% paddle length.",
          "params": {
            "paddleLength": 0.3
          },
          "formerly": "Titan Frame"
        },
        {
          "id": "t2_overdrive",
          "name": "Overdrive",
          "icon": "bolt-big",
          "type": "passive",
          "maxStacks": 1,
          "effect": "+25% paddle speed and instant acceleration (no ramp-up).",
          "params": {
            "paddleSpeed": 0.25,
            "instantAccel": true
          },
          "formerly": "Overdrive"
        },
        {
          "id": "t2_curve",
          "name": "Curveball",
          "icon": "curve",
          "type": "passive",
          "maxStacks": 1,
          "effect": "Moving your paddle as you hit bends the ball's path, up to a 35° arc across the court.",
          "params": {
            "maxCurveDeg": 35
          }
        },
        {
          "id": "t2_mirage",
          "name": "Mirage",
          "icon": "twin-dots",
          "type": "active",
          "slot": "mod",
          "maxStacks": 1,
          "key": "mod",
          "effect": "Arm it, and your next hit also fires an identical decoy ball on a different angle. The decoy vanishes 70% of the way across. Once per point.",
          "params": {
            "decoyVanishAt": 0.7,
            "decoyAngleOffsetDeg": 18,
            "usesPerPoint": 1
          }
        },
        {
          "id": "t2_bullet",
          "name": "Bullet Time",
          "icon": "hourglass",
          "type": "active",
          "slot": "mod",
          "maxStacks": 1,
          "key": "mod",
          "effect": "The ball moves at 50% speed for 1.2s while it's on your half. Cooldown 15s.",
          "params": {
            "ballSpeedMult": 0.5,
            "durationSec": 1.2,
            "cooldownSec": 15
          }
        },
        {
          "id": "t2_magnet",
          "name": "Magnet",
          "icon": "magnet",
          "type": "active",
          "slot": "mod",
          "maxStacks": 1,
          "key": "mod",
          "effect": "Pulls the ball toward your paddle's height for 1.5s. Cooldown 15s.",
          "params": {
            "pullStrength": 0.6,
            "durationSec": 1.5,
            "cooldownSec": 15
          }
        }
      ]
    },
    {
      "tier": 3,
      "name": "Ultimates",
      "cost": 3,
      "color": "#ffb020",
      "rule": "Hold ONE active Ultimate at a time; buying another replaces it — actives show a cooldown ring and a visible tell so the other player can react. Twin Paddle and Guardian Drone are passives and don't compete for that slot, so you can run both together (and alongside an active Ultimate).",
      "items": [
        {
          "id": "t3_twin",
          "name": "Twin Paddle",
          "icon": "two-bars",
          "type": "passive",
          "slot": "ultimate",
          "effect": "A second paddle (55% length) floats at 35% court depth on your side and mirrors your movement.",
          "params": {
            "lengthMult": 0.55,
            "depth": 0.35
          }
        },
        {
          "id": "t3_barrage",
          "name": "Barrage",
          "icon": "three-balls",
          "type": "active",
          "slot": "ultimate",
          "key": "ultimate",
          "effect": "Arm it, and your next hit splits into 3 balls (±15°). The first goal ends the rally. Usable once every 3 points.",
          "params": {
            "balls": 3,
            "spreadDeg": 15,
            "cooldownPoints": 3
          }
        },
        {
          "id": "t3_cryo",
          "name": "Cryo Beam",
          "icon": "snowflake",
          "type": "active",
          "slot": "ultimate",
          "key": "ultimate",
          "effect": "The opponent's paddle flashes blue for 0.3s, then moves at 40% speed for 2s. Cooldown 25s.",
          "params": {
            "telegraphSec": 0.3,
            "slowMult": 0.4,
            "durationSec": 2.0,
            "cooldownSec": 25
          }
        },
        {
          "id": "t3_blackhole",
          "name": "Black Hole",
          "icon": "vortex",
          "type": "active",
          "slot": "ultimate",
          "key": "ultimate",
          "effect": "Spawns a gravity well on the opponent's half for 4s that bends the ball's path. Cooldown 30s.",
          "params": {
            "durationSec": 4,
            "strength": 0.9,
            "cooldownSec": 30
          }
        },
        {
          "id": "t3_smash",
          "name": "Supernova Smash",
          "icon": "flame",
          "type": "active",
          "slot": "ultimate",
          "key": "ultimate",
          "effect": "Arm it, and your next hit launches at 1.8x speed with a fire trail. The speed drops back to normal after one wall bounce. Cooldown 20s.",
          "params": {
            "speedMult": 1.8,
            "decayAfterWallBounces": 1,
            "cooldownSec": 20
          }
        },
        {
          "id": "t3_guardian",
          "name": "Guardian Drone",
          "icon": "drone",
          "type": "passive",
          "slot": "ultimate",
          "effect": "A small drone (35% paddle length) patrols your goal line, tracking the ball at 45% of your paddle speed.",
          "params": {
            "lengthMult": 0.35,
            "speedMult": 0.45
          }
        },
        {
          "id": "t3_shrink",
          "name": "Shrink Ray",
          "icon": "shrink",
          "type": "active",
          "slot": "ultimate",
          "key": "ultimate",
          "effect": "The opponent's paddle shrinks 30% for 10s. Cooldown 30s.",
          "params": {
            "lengthMult": 0.7,
            "durationSec": 10,
            "cooldownSec": 30
          }
        }
      ]
    }
    ,
    {
      "tier": 4,
      "name": "Legendary",
      "cost": 5,
      "color": "#ff2b6a",
      "rule": "Hold ONE Legendary at a time; buying another replaces it. Costs 5 UP — these are game-changers.",
      "items": [
        {
          "id": "t4_snare",
          "name": "Snare",
          "icon": "snare",
          "type": "active",
          "slot": "legendary",
          "key": "legendary",
          "effect": "Arm it, and your next hit catches the ball on your paddle for 1.2s instead of returning it. Move to aim, then it launches on its own at 15% extra speed. Cooldown 20s.",
          "params": {
            "holdSec": 1.2,
            "releaseSpeedMult": 1.15,
            "cooldownSec": 20
          }
        },
        {
          "id": "t4_secondwind",
          "name": "Second Wind",
          "icon": "heartbeat",
          "type": "active",
          "slot": "legendary",
          "key": "legendary",
          "effect": "Arm it, and the next round you'd lose is voided instead — no score change, the ball just re-serves. Cooldown 30s.",
          "params": {
            "cooldownSec": 30
          }
        },
        {
          "id": "t4_shield",
          "name": "Shield Wall",
          "icon": "shield",
          "type": "passive",
          "slot": "legendary",
          "effect": "A glowing barrier on your goal blocks one round loss, then breaks. Recharges after 3 more points are played.",
          "params": {
            "blocks": 1,
            "rechargePoints": 3
          },
          "formerly": "Second Chance"
        }
      ]
    }
  ],
  "coinEconomy": {
    "currencyName": "Coins",
    "perPlayerWallets": true,
    "earn": {
      "win": 25,
      "loss": 10,
      "perPointScored": 1,
      "rallyBonus": {
        "minHits": 15,
        "coins": 10,
        "maxPerMatch": 5
      }
    },
    "rarities": {
      "default": {
        "label": "Default",
        "price": 0,
        "color": "#8b88b3"
      },
      "common": {
        "label": "Common",
        "price": 100,
        "color": "#9aa4b2"
      },
      "rare": {
        "label": "Rare",
        "price": 200,
        "color": "#3fa9ff"
      },
      "epic": {
        "label": "Epic",
        "price": 350,
        "color": "#b36bff"
      },
      "legendary": {
        "label": "Legendary",
        "price": 600,
        "color": "#ffb020",
        "animatedBorder": true
      }
    },
    "cheatCode": {
      "code": "NEONRICH",
      "where": "type on the title screen",
      "effect": "+5000 coins to both players (for testing / fun)"
    }
  },
  "cosmeticCategories": [
    {
      "id": "paddle",
      "name": "Paddles",
      "slot": "per-player",
      "desc": "What your paddle looks like."
    },
    {
      "id": "glow",
      "name": "Glow",
      "slot": "per-player",
      "desc": "An outline that glows around your paddle (and your half of the court border)."
    },
    {
      "id": "aura",
      "name": "Auras",
      "slot": "per-player",
      "desc": "Lights and particles that follow your paddle. They combine with any glow."
    },
    {
      "id": "board",
      "name": "Boards",
      "slot": "match",
      "desc": "The animated background. Picked in Match Setup from either player's unlocked boards."
    },
    {
      "id": "trail",
      "name": "Ball Trails",
      "slot": "per-player",
      "desc": "Trail the ball leaves after YOU hit it."
    },
    {
      "id": "goalfx",
      "name": "Goal FX",
      "slot": "per-player",
      "desc": "What happens on screen when YOU score."
    },
    {
      "id": "hud",
      "name": "Scoreboard",
      "slot": "per-player",
      "desc": "The style of your score digits."
    },
    {
      "id": "ball",
      "name": "Balls",
      "slot": "match",
      "desc": "What the ball looks like. Picked in Match Setup from either player's unlocked balls."
    }
  ],
  "cosmetics": [
    {
      "id": "p_classic",
      "cat": "paddle",
      "name": "Classic",
      "rarity": "default",
      "desc": "Clean white bar with a soft neon edge."
    },
    {
      "id": "p_chrome",
      "cat": "paddle",
      "name": "Chrome",
      "rarity": "common",
      "desc": "Mirrored metal with a shine that sweeps across it."
    },
    {
      "id": "p_candy",
      "cat": "paddle",
      "name": "Candy Stripe",
      "rarity": "common",
      "desc": "Red and white stripes that scroll as you move."
    },
    {
      "id": "p_circuit",
      "cat": "paddle",
      "name": "Circuit",
      "rarity": "rare",
      "desc": "Green circuit traces with pulses running along them. Pulses fire on every hit."
    },
    {
      "id": "p_molten",
      "cat": "paddle",
      "name": "Molten",
      "rarity": "rare",
      "desc": "Slowly churning lava with glowing cracks."
    },
    {
      "id": "p_hotdog",
      "cat": "paddle",
      "name": "Hot Dog",
      "rarity": "rare",
      "desc": "It's a hot dog. Mustard squiggle included."
    },
    {
      "id": "p_baguette",
      "cat": "paddle",
      "name": "Baguette",
      "rarity": "rare",
      "desc": "Crusty, golden, and gives off a few crumbs on every hit."
    },
    {
      "id": "p_glitch",
      "cat": "paddle",
      "name": "Glitch",
      "rarity": "epic",
      "desc": "RGB-split jitter that spikes whenever you hit the ball."
    },
    {
      "id": "p_plasma",
      "cat": "paddle",
      "name": "Plasma Bar",
      "rarity": "epic",
      "desc": "A humming bar of pure energy with a flickering white core."
    },
    {
      "id": "p_chevron",
      "cat": "paddle",
      "name": "Chevron",
      "rarity": "rare",
      "desc": "Dark racing chevrons that stream along the bar. Carried over from v2."
    },
    {
      "id": "p_knife",
      "cat": "paddle",
      "name": "Knife",
      "rarity": "rare",
      "desc": "A polished blade with a wrapped handle."
    },
    {
      "id": "p_surfboard",
      "cat": "paddle",
      "name": "Surfboard",
      "rarity": "common",
      "desc": "A rounded board with a racing stripe and a single fin line."
    },
    {
      "id": "p_soccergoal",
      "cat": "paddle",
      "name": "Soccer Goal",
      "rarity": "common",
      "desc": "A turfy green goalmouth with a taut net and painted goal line."
    },
    {
      "id": "p_lightsaber",
      "cat": "paddle",
      "name": "Lightsaber",
      "rarity": "legendary",
      "desc": "A humming energy blade in your colour, with a machined metal hilt."
    },
    {
      "id": "o_none",
      "cat": "glow",
      "name": "No Glow",
      "rarity": "default",
      "desc": "No glow."
    },
    {
      "id": "o_cyan",
      "cat": "glow",
      "name": "Cyan Glow",
      "rarity": "common",
      "desc": "A steady cyan glow."
    },
    {
      "id": "o_pink",
      "cat": "glow",
      "name": "Hot Pink Glow",
      "rarity": "common",
      "desc": "A steady hot-pink glow."
    },
    {
      "id": "o_pulse",
      "cat": "glow",
      "name": "Beat Pulse",
      "rarity": "epic",
      "desc": "The glow pulses in time with the music's tempo."
    },
    {
      "id": "o_rainbow",
      "cat": "glow",
      "name": "Rainbow Glow",
      "rarity": "legendary",
      "desc": "An animated rainbow glow that flows around your paddle and your side of the court border."
    },
    {
      "id": "o_lime",
      "cat": "glow",
      "name": "Lime Glow",
      "rarity": "common",
      "desc": "A steady lime-green glow."
    },
    {
      "id": "o_amber",
      "cat": "glow",
      "name": "Amber Glow",
      "rarity": "common",
      "desc": "A steady amber glow."
    },
    {
      "id": "o_violet",
      "cat": "glow",
      "name": "Violet Glow",
      "rarity": "rare",
      "desc": "A steady violet glow."
    },
    {
      "id": "o_ice",
      "cat": "glow",
      "name": "Ice Glow",
      "rarity": "rare",
      "desc": "A slow, cold blue glow that breathes in and out."
    },
    {
      "id": "o_flame",
      "cat": "glow",
      "name": "Flame Glow",
      "rarity": "epic",
      "desc": "A warm, flickering flame-orange glow."
    },
    {
      "id": "a_none",
      "cat": "aura",
      "name": "No Aura",
      "rarity": "default",
      "desc": "Nothing extra."
    },
    {
      "id": "a_halo",
      "cat": "aura",
      "name": "Halo",
      "rarity": "common",
      "desc": "Three lights orbit your paddle. Carried over from v2."
    },
    {
      "id": "a_sparks",
      "cat": "aura",
      "name": "Sparks",
      "rarity": "rare",
      "desc": "Sparkling particles dance around the bar. Carried over from v2."
    },
    {
      "id": "a_comet",
      "cat": "aura",
      "name": "Comet",
      "rarity": "epic",
      "desc": "A flowing wake streams behind your paddle. Carried over from v2."
    },
    {
      "id": "a_hearts",
      "cat": "aura",
      "name": "Hearts",
      "rarity": "common",
      "desc": "Little hearts drift and pulse around your paddle."
    },
    {
      "id": "a_clovers",
      "cat": "aura",
      "name": "Clovers",
      "rarity": "rare",
      "desc": "Four-leaf clovers tumble slowly around the bar."
    },
    {
      "id": "a_diamond",
      "cat": "aura",
      "name": "Diamonds",
      "rarity": "epic",
      "desc": "Faceted glints sparkle and rotate around your paddle."
    },
    {
      "id": "a_blades",
      "cat": "aura",
      "name": "Blades",
      "rarity": "rare",
      "desc": "Spinning metal shards orbit aggressively."
    },
    {
      "id": "a_money",
      "cat": "aura",
      "name": "Money",
      "rarity": "legendary",
      "desc": "Dollar signs rain upward around your paddle. Extremely flexible."
    },
    {
      "id": "b_grid",
      "cat": "board",
      "name": "Neon Grid",
      "rarity": "default",
      "desc": "A classic synth-wave grid scrolling toward the horizon."
    },
    {
      "id": "b_raceday",
      "cat": "board",
      "name": "Race Day",
      "rarity": "legendary",
      "desc": "Top-down race cars in different colors race down the board in lanes, overtaking each other. They speed up as the rally gets longer."
    },
    {
      "id": "b_starwarp",
      "cat": "board",
      "name": "Star Warp",
      "rarity": "rare",
      "desc": "Stars streak past like you're at light speed. The streaks get longer as the ball speeds up."
    },
    {
      "id": "b_sunset",
      "cat": "board",
      "name": "Retro Sunset",
      "rarity": "rare",
      "desc": "A striped synth-wave sun sinking behind neon mountains."
    },
    {
      "id": "b_datastream",
      "cat": "board",
      "name": "Data Stream",
      "rarity": "epic",
      "desc": "Columns of glowing 0s, 1s and hex digits falling down the board."
    },
    {
      "id": "b_purplestream",
      "cat": "board",
      "name": "Violet Data Stream",
      "rarity": "epic",
      "desc": "The same falling code, in a deep violet palette."
    },
    {
      "id": "b_deepsea",
      "cat": "board",
      "name": "Deep Sea",
      "rarity": "epic",
      "desc": "Glowing jellyfish drift through the dark water while bubbles rise."
    },
    {
      "id": "b_storm",
      "cat": "board",
      "name": "Thunderstorm",
      "rarity": "rare",
      "desc": "Rain streaks with gentle distant lightning. Honors the Reduce Flashing setting."
    },
    {
      "id": "b_aurora",
      "cat": "board",
      "name": "Aurora",
      "rarity": "epic",
      "desc": "Slow green and violet northern lights ripple across the sky."
    },
    {
      "id": "b_crt",
      "cat": "board",
      "name": "Arcade CRT",
      "rarity": "rare",
      "desc": "Scanlines, a slight screen curve and phosphor glow, like an old cabinet."
    },
    {
      "id": "b_snowglobe",
      "cat": "board",
      "name": "Snow Globe",
      "rarity": "common",
      "desc": "Snow drifts down and piles up during a rally. It gets shaken off when someone scores."
    },
    {
      "id": "b_lavalamp",
      "cat": "board",
      "name": "Lava Lamp",
      "rarity": "common",
      "desc": "Big soft blobs slowly rise and merge."
    },
    {
      "id": "b_soccerfield",
      "cat": "board",
      "name": "Soccer Field",
      "rarity": "common",
      "desc": "A green pitch with a center circle, halfway line and penalty boxes."
    },
    {
      "id": "b_footballfield",
      "cat": "board",
      "name": "Football Field",
      "rarity": "common",
      "desc": "A gridiron with yard lines, hash marks and tinted end zones."
    },
    {
      "id": "b_snowstorm",
      "cat": "board",
      "name": "Snowstorm",
      "rarity": "rare",
      "desc": "Wind-driven snow streaks past dark pine silhouettes. Honors the Reduce Flashing setting."
    },
    {
      "id": "b_spaceship",
      "cat": "board",
      "name": "Spaceship",
      "rarity": "epic",
      "desc": "A cockpit window frame around a calm, twinkling starfield."
    },
    {
      "id": "b_grassyfield",
      "cat": "board",
      "name": "Grassy Field",
      "rarity": "common",
      "desc": "An open sunny meadow with drifting clouds and mowed stripes."
    },
    {
      "id": "t_none",
      "cat": "trail",
      "name": "No Trail",
      "rarity": "default",
      "desc": "Just the ball."
    },
    {
      "id": "t_comet",
      "cat": "trail",
      "name": "Comet",
      "rarity": "common",
      "desc": "A soft fading tail in your glow color."
    },
    {
      "id": "t_pixels",
      "cat": "trail",
      "name": "Pixel Sparks",
      "rarity": "common",
      "desc": "Chunky pixel sparks fall off the ball."
    },
    {
      "id": "t_bubbles",
      "cat": "trail",
      "name": "Bubbles",
      "rarity": "common",
      "desc": "Little bubbles float away and pop."
    },
    {
      "id": "t_rainbow",
      "cat": "trail",
      "name": "Rainbow Ribbon",
      "rarity": "rare",
      "desc": "A smooth ribbon cycling through the rainbow."
    },
    {
      "id": "t_fire",
      "cat": "trail",
      "name": "Fire",
      "rarity": "rare",
      "desc": "Flames that burn bigger the faster the ball goes."
    },
    {
      "id": "t_afterimage",
      "cat": "trail",
      "name": "Afterimage",
      "rarity": "epic",
      "desc": "Fading ghost copies of the ball, each a little behind the last."
    },
    {
      "id": "t_sparkletrail",
      "cat": "trail",
      "name": "Glitter",
      "rarity": "rare",
      "desc": "A soft fading tail with twinkling star-glints scattered through it."
    },
    {
      "id": "t_ice",
      "cat": "trail",
      "name": "Frost",
      "rarity": "common",
      "desc": "A pale crystalline trail that sheds slow-falling ice shards."
    },
    {
      "id": "t_shadow",
      "cat": "trail",
      "name": "Shadow",
      "rarity": "epic",
      "desc": "A dark, smoky ink trail instead of light."
    },
    {
      "id": "g_flash",
      "cat": "goalfx",
      "name": "Flash",
      "rarity": "default",
      "desc": "A quick flash on the goal line."
    },
    {
      "id": "g_confetti",
      "cat": "goalfx",
      "name": "Confetti Cannon",
      "rarity": "common",
      "desc": "Two confetti cannons fire from your corners."
    },
    {
      "id": "g_fireworks",
      "cat": "goalfx",
      "name": "Fireworks",
      "rarity": "rare",
      "desc": "Three fireworks burst over your half."
    },
    {
      "id": "g_pixelboom",
      "cat": "goalfx",
      "name": "Pixel Explosion",
      "rarity": "rare",
      "desc": "The ball shatters into a shower of chunky pixels."
    },
    {
      "id": "g_shockwave",
      "cat": "goalfx",
      "name": "Shockwave",
      "rarity": "epic",
      "desc": "A ripple distorts the whole board and the screen shakes."
    },
    {
      "id": "g_implosion",
      "cat": "goalfx",
      "name": "Implosion",
      "rarity": "legendary",
      "desc": "The board gets sucked into the goal for a moment, then pops back out."
    },
    {
      "id": "h_arcade",
      "cat": "hud",
      "name": "Arcade Pixel",
      "rarity": "default",
      "desc": "Chunky pixel digits."
    },
    {
      "id": "h_led",
      "cat": "hud",
      "name": "LED Segments",
      "rarity": "common",
      "desc": "Seven-segment LED digits with unlit segments showing faintly."
    },
    {
      "id": "h_flip",
      "cat": "hud",
      "name": "Flip Clock",
      "rarity": "rare",
      "desc": "Split-flap digits that flip over on every point."
    },
    {"id": "h_dotmatrix", "cat": "hud", "name": "Dot Matrix", "rarity": "common", "desc": "Round LED dots instead of segments."},
    {"id": "h_outline", "cat": "hud", "name": "Outline", "rarity": "common", "desc": "Clean hollow digits."},
    {"id": "h_mono", "cat": "hud", "name": "Monospace", "rarity": "common", "desc": "Flat, no-glow monospace digits with an underline."},
    {"id": "h_binary", "cat": "hud", "name": "Binary", "rarity": "rare", "desc": "A faint scroll of 1s and 0s behind the digits."},
    {"id": "h_hologram", "cat": "hud", "name": "Hologram", "rarity": "rare", "desc": "A flickery cyan/magenta split with scanlines."},
    {"id": "h_circuit", "cat": "hud", "name": "Circuit", "rarity": "rare", "desc": "Glowing digits framed by circuit-trace ticks."},
    {"id": "h_neonsign", "cat": "hud", "name": "Neon Sign", "rarity": "epic", "desc": "A warm tube-light glow that flickers now and then."},
    {"id": "h_glitch", "cat": "hud", "name": "Glitch", "rarity": "epic", "desc": "RGB-split jitter that spikes every couple of seconds."},
    {"id": "h_rainbow", "cat": "hud", "name": "Rainbow Billboard", "rarity": "legendary", "desc": "An animated marquee billboard behind color-cycling digits."},
    {"id": "circle", "cat": "ball", "name": "Classic", "rarity": "default", "desc": "The original ball. Always free."},
    {"id": "square", "cat": "ball", "name": "Square", "rarity": "common", "desc": "A spinning square."},
    {"id": "triangle", "cat": "ball", "name": "Triangle", "rarity": "common", "desc": "A spinning triangle."},
    {"id": "diamond", "cat": "ball", "name": "Diamond", "rarity": "common", "desc": "A gently rocking diamond."},
    {"id": "pentagon", "cat": "ball", "name": "Pentagon", "rarity": "common", "desc": "A spinning pentagon."},
    {"id": "hexagon", "cat": "ball", "name": "Hexagon", "rarity": "common", "desc": "A spinning hexagon."},
    {"id": "star", "cat": "ball", "name": "Star", "rarity": "common", "desc": "A spinning five-point star."},
    {"id": "heart", "cat": "ball", "name": "Heart", "rarity": "common", "desc": "A heart that beats as it flies."},
    {"id": "cube", "cat": "ball", "name": "Wire Cube", "rarity": "common", "desc": "A 3D wireframe cube that tumbles."},
    {"id": "alien", "cat": "ball", "name": "Alien", "rarity": "rare", "desc": "A lime-green head with two big black eyes."},
    {"id": "ufo", "cat": "ball", "name": "UFO", "rarity": "rare", "desc": "A saucer with blinking lights."},
    {"id": "planet", "cat": "ball", "name": "Ringed Planet", "rarity": "rare", "desc": "A tilted ring around a banded planet."},
    {"id": "moon", "cat": "ball", "name": "Crescent Moon", "rarity": "rare", "desc": "A soft crescent moon."},
    {"id": "sun", "cat": "ball", "name": "Sun", "rarity": "rare", "desc": "A spinning sun with rays."},
    {"id": "atom", "cat": "ball", "name": "Atom", "rarity": "rare", "desc": "Three orbits with electrons flying around a nucleus."},
    {"id": "basketball", "cat": "ball", "name": "Basketball", "rarity": "common", "desc": "A classic basketball."},
    {"id": "soccer", "cat": "ball", "name": "Soccer Ball", "rarity": "common", "desc": "A classic soccer ball."},
    {"id": "tennis", "cat": "ball", "name": "Tennis Ball", "rarity": "common", "desc": "A fuzzy tennis ball."},
    {"id": "baseball", "cat": "ball", "name": "Baseball", "rarity": "common", "desc": "Stitched red laces on white leather."},
    {"id": "eightball", "cat": "ball", "name": "8-Ball", "rarity": "rare", "desc": "The dreaded 8-ball."},
    {"id": "pizza", "cat": "ball", "name": "Pizza Slice", "rarity": "common", "desc": "A slice with pepperoni."},
    {"id": "donut", "cat": "ball", "name": "Donut", "rarity": "common", "desc": "Frosted with sprinkles."},
    {"id": "taco", "cat": "ball", "name": "Taco", "rarity": "common", "desc": "A folded taco shell, fully loaded."},
    {"id": "cookie", "cat": "ball", "name": "Cookie", "rarity": "common", "desc": "A chocolate chip cookie."},
    {"id": "skull", "cat": "ball", "name": "Skull", "rarity": "rare", "desc": "A grinning skull."},
    {"id": "eyeball", "cat": "ball", "name": "Eyeball", "rarity": "rare", "desc": "The pupil looks toward whoever it's flying at."},
    {"id": "ghost", "cat": "ball", "name": "Ghost", "rarity": "rare", "desc": "A plain white sheet ghost."},
    {"id": "bomb", "cat": "ball", "name": "Bomb", "rarity": "epic", "desc": "The fuse sparks faster as the rally gets longer."},
    {"id": "duck", "cat": "ball", "name": "Rubber Duck", "rarity": "common", "desc": "A rubber duck, wobbling along."},
    {"id": "catface", "cat": "ball", "name": "Cat Face", "rarity": "common", "desc": "A blinking cat face."},
    {"id": "smiley", "cat": "ball", "name": "Smiley", "rarity": "common", "desc": "Turns shocked at high speed."},
    {"id": "dice", "cat": "ball", "name": "Die", "rarity": "rare", "desc": "Shows a different face on every hit."},
    {"id": "coin", "cat": "ball", "name": "Spinning Coin", "rarity": "rare", "desc": "A coin flipping edge over edge."},
    {"id": "gem", "cat": "ball", "name": "Gem", "rarity": "epic", "desc": "A faceted, rocking gem."},
    {"id": "snowflake", "cat": "ball", "name": "Snowflake", "rarity": "rare", "desc": "A six-armed snowflake."},
    {"id": "crown", "cat": "ball", "name": "Crown", "rarity": "legendary", "desc": "A jeweled crown fit for a champion."}
  ],
  "balls": {
    "rule": "Every ball uses the SAME circular hitbox and physics. Shapes are visual only, so every ball is fair. Shapes rotate with the ball's spin/travel direction.",
    "extraOptions": [
      "random",
      "shuffle_each_point"
    ],
    "items": [
      {
        "id": "circle",
        "name": "Classic",
        "group": "Shapes"
      },
      {
        "id": "square",
        "name": "Square",
        "group": "Shapes"
      },
      {
        "id": "triangle",
        "name": "Triangle",
        "group": "Shapes"
      },
      {
        "id": "diamond",
        "name": "Diamond",
        "group": "Shapes"
      },
      {
        "id": "pentagon",
        "name": "Pentagon",
        "group": "Shapes"
      },
      {
        "id": "hexagon",
        "name": "Hexagon",
        "group": "Shapes"
      },
      {
        "id": "star",
        "name": "Star",
        "group": "Shapes"
      },
      {
        "id": "heart",
        "name": "Heart",
        "group": "Shapes"
      },
      {
        "id": "cube",
        "name": "Wire Cube",
        "group": "Shapes",
        "note": "3D wireframe cube that tumbles"
      },
      {
        "id": "alien",
        "name": "Alien",
        "group": "Space",
        "note": "Original design: lime-green head, two big black almond eyes"
      },
      {
        "id": "ufo",
        "name": "UFO",
        "group": "Space"
      },
      {
        "id": "planet",
        "name": "Ringed Planet",
        "group": "Space"
      },
      {
        "id": "moon",
        "name": "Crescent Moon",
        "group": "Space"
      },
      {
        "id": "sun",
        "name": "Sun",
        "group": "Space"
      },
      {
        "id": "atom",
        "name": "Atom",
        "group": "Space"
      },
      {
        "id": "basketball",
        "name": "Basketball",
        "group": "Sports"
      },
      {
        "id": "soccer",
        "name": "Soccer Ball",
        "group": "Sports"
      },
      {
        "id": "tennis",
        "name": "Tennis Ball",
        "group": "Sports"
      },
      {
        "id": "baseball",
        "name": "Baseball",
        "group": "Sports"
      },
      {
        "id": "eightball",
        "name": "8-Ball",
        "group": "Sports"
      },
      {
        "id": "pizza",
        "name": "Pizza Slice",
        "group": "Food"
      },
      {
        "id": "donut",
        "name": "Donut",
        "group": "Food"
      },
      {
        "id": "taco",
        "name": "Taco",
        "group": "Food"
      },
      {
        "id": "cookie",
        "name": "Cookie",
        "group": "Food"
      },
      {
        "id": "skull",
        "name": "Skull",
        "group": "Weird"
      },
      {
        "id": "eyeball",
        "name": "Eyeball",
        "group": "Weird",
        "note": "The pupil looks toward the paddle the ball is heading at"
      },
      {
        "id": "ghost",
        "name": "Ghost",
        "group": "Weird",
        "note": "Original design: plain white sheet ghost, hollow eyes, O mouth"
      },
      {
        "id": "bomb",
        "name": "Bomb",
        "group": "Weird",
        "note": "Fuse sparks faster as the rally gets longer"
      },
      {
        "id": "duck",
        "name": "Rubber Duck",
        "group": "Weird"
      },
      {
        "id": "catface",
        "name": "Cat Face",
        "group": "Weird"
      },
      {
        "id": "smiley",
        "name": "Smiley",
        "group": "Weird",
        "note": "Changes to a shocked face at high speed"
      },
      {
        "id": "dice",
        "name": "Die",
        "group": "Weird",
        "note": "Shows a different face each time it's hit"
      },
      {
        "id": "coin",
        "name": "Spinning Coin",
        "group": "Weird"
      },
      {
        "id": "gem",
        "name": "Gem",
        "group": "Weird"
      },
      {
        "id": "snowflake",
        "name": "Snowflake",
        "group": "Weird"
      },
      {
        "id": "crown",
        "name": "Crown",
        "group": "Weird"
      }
    ]
  },
  "audio": {
    "tracks": {
      "title": {
        "file": "audio/title_kesh_jig.wav",
        "loop": true,
        "usedOn": [
          "title",
          "menus",
          "cosmetics",
          "upgrades guide",
          "settings"
        ]
      },
      "gameplay": {
        "file": "audio/gameplay_drowsy_maggie.wav",
        "loop": true,
        "usedOn": [
          "match"
        ],
        "rallyTempo": {
          "startRate": 1.0,
          "maxRate": 1.2,
          "stepPerHit": 0.01,
          "resetOnPoint": true
        },
        "upgradeBreakLowpassHz": 900
      },
      "gameover": {
        "file": "audio/gameover_swallowtail_lament.wav",
        "loop": true,
        "usedOn": [
          "game over / results"
        ]
      },
      "miss": {
        "file": "audio/sfx_miss.wav",
        "loop": false,
        "usedOn": [
          "point conceded (toggle in settings)"
        ]
      }
    },
    "customSlots": [
      "title",
      "gameplay",
      "gameover",
      "miss",
      "score",
      "win",
      "hit",
      "wall",
      "upgrade_buy",
      "ultimate"
    ],
    "customManifest": "assets/audio/custom/manifest.json",
    "credits": "Music: traditional Irish tunes (The Kesh Jig, Drowsy Maggie, The Swallowtail Jig), arranged in 16-bit. Miss sting: original.",
    "nowPlaying": {
      "title": "The Kesh Jig",
      "gameplay": "Drowsy Maggie",
      "gameover": "The Swallowtail Lament"
    }
  }
};
})(typeof window !== "undefined" ? window : globalThis);
if (typeof module !== "undefined") module.exports = (typeof window !== "undefined" ? window.CATALOG_RAW : globalThis.CATALOG_RAW);
