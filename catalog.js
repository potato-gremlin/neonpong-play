(function (g) {
g.CATALOG_RAW = {
  "version": 1,
  "notes": "Single source of truth for upgrades, cosmetics and balls. All numbers are multipliers of the game's existing base values (paddle length, paddle speed, ball speed) so they plug into whatever the current code uses. Live copy: NeonPong.exe reads this file at startup. Both online players must use the same file.",
  "match": {
    "pointsToWin": 21,
    "pointsToWinOptions": [
      11,
      21,
      31
    ],
    "matchPointBannerAt": 20
  },
  "upgradeEconomy": {
    "currency": "UP",
    "currencyName": "Upgrade Points",
    "adaptNote": "UP is earned by scoring and unspent UP resets when the opponent scores. The shop opens after every point (everyNTotalPoints 1); set it to 4 for a slower cadence.",
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
      "rule": "Permanent for the match. Each one stacks up to its max. Dash is the one active ability in this tier.",
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
          }
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
          }
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
          }
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
            "burstMult": 2,
            "burstSec": 0.2,
            "cooldownSec": [
              4,
              2.5
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
          }
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
          }
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
          "effect": "The ball moves at 50% speed for 1.2s while it's on your half. Cooldown 30s.",
          "params": {
            "ballSpeedMult": 0.5,
            "durationSec": 1.2,
            "cooldownSec": 30
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
          "effect": "Pulls the ball toward your paddle's height for 1.5s. Cooldown 30s.",
          "params": {
            "pullStrength": 0.6,
            "durationSec": 1.5,
            "cooldownSec": 30
          }
        }
      ]
    },
    {
      "tier": 3,
      "name": "Ultimates",
      "cost": 3,
      "color": "#ffb020",
      "rule": "Hold ONE active Ultimate at a time; buying another replaces it. Actives show a cooldown ring and a visible tell so the other player can react. Twin Paddle and Guardian Drone are passives: you can run both, alongside an active Ultimate.",
      "items": [
        {
          "id": "t3_twin",
          "name": "Twin Paddle",
          "icon": "two-bars",
          "type": "passive",
          "effect": "A second paddle (55% length) floats at 35% court depth on your side and mirrors your movement.",
          "params": {
            "lengthMult": 0.55,
            "depth": 0.35
          }
        },
        {
          "id": "t3_cryo",
          "name": "Cryo Beam",
          "icon": "snowflake",
          "type": "active",
          "slot": "ultimate",
          "key": "ultimate",
          "effect": "The opponent's paddle flashes blue for 0.3s, then moves at 40% speed for 3s. Cooldown 30s.",
          "params": {
            "telegraphSec": 0.3,
            "slowMult": 0.4,
            "durationSec": 3,
            "cooldownSec": 30
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
          "effect": "Arm it, and your next hit launches at 1.8x speed with a fire trail. The speed drops back to normal after one wall bounce. Cooldown 30s.",
          "params": {
            "speedMult": 1.8,
            "decayAfterWallBounces": 1,
            "cooldownSec": 30
          }
        },
        {
          "id": "t3_guardian",
          "name": "Guardian Drone",
          "icon": "drone",
          "type": "passive",
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
    },
    {
      "tier": 4,
      "name": "Legendary",
      "cost": 5,
      "color": "#ff2b6a",
      "rule": "Hold ONE active Legendary at a time (Snare, Second Wind or Barrage); buying another replaces it. Shield Wall is passive and stacks alongside. Costs 5 UP.",
      "items": [
        {
          "id": "t4_snare",
          "name": "Snare",
          "icon": "snare",
          "type": "active",
          "slot": "legendary",
          "key": "legendary",
          "effect": "Arm it, and your next hit catches the ball on your paddle for 1.2s instead of returning it. Move to aim, then it launches on its own at 2x the ball's speed. Cooldown 30s.",
          "params": {
            "holdSec": 1.2,
            "releaseBallSpeedMult": 2,
            "cooldownSec": 30
          }
        },
        {
          "id": "t4_secondwind",
          "name": "Second Wind",
          "icon": "heartbeat",
          "type": "active",
          "slot": "legendary",
          "key": "legendary",
          "effect": "Arm it, and the next round you'd lose is voided instead: no score change, the ball just re-serves. One use per round; it refreshes whenever a point is awarded.",
          "params": {
            "usesPerRound": 1
          }
        },
        {
          "id": "t4_barrage",
          "name": "Barrage",
          "icon": "three-balls",
          "type": "active",
          "slot": "legendary",
          "key": "legendary",
          "effect": "Arm it, and your next hit splits into 2 balls, 15° apart. The first goal ends the rally. Usable once every 3 points.",
          "params": {
            "balls": 2,
            "spreadDeg": 15,
            "cooldownPoints": 3
          }
        },
        {
          "id": "t4_shield",
          "name": "Shield Wall",
          "icon": "shield",
          "type": "passive",
          "effect": "A glowing barrier on your goal blocks one round loss, then breaks. Recharges after 3 more points are played.",
          "params": {
            "blocks": 1,
            "rechargePoints": 3
          }
        }
      ]
    }
  ],
  "coinEconomy": {
    "currencyName": "Coins",
    "perPlayerWallets": true,
    "earn": {
      "win": 50,
      "loss": 10,
      "perPointScored": 2,
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
      "desc": "Light your paddle gives off. The Glow you equip sets your paddle's colour, its bloom and how it animates."
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
      "desc": "The style of your score digits. Pick their colour below."
    },
    {
      "id": "ball",
      "name": "Balls",
      "slot": "match",
      "desc": "What the ball looks like. The Shapes can be recoloured below. Picked in Match Setup from either player's unlocked balls."
    }
  ],
  "cosmetics": [
    {
      "id": "p_classic",
      "cat": "paddle",
      "name": "Classic",
      "rarity": "default",
      "desc": "The clean bar. It takes its colour from your Glow (white by default)."
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
      "desc": "A humming bar of pure energy with a flickering white core, in your glow colour."
    },
    {
      "id": "p_chevron",
      "cat": "paddle",
      "name": "Chevron",
      "rarity": "rare",
      "desc": "Dark racing chevrons stream along a bar in your glow colour."
    },
    {
      "id": "p_knife",
      "cat": "paddle",
      "name": "Knife",
      "rarity": "rare",
      "desc": "A kitchen-style knife: pointed blade with a bright cutting edge, brass guard and a riveted wooden handle."
    },
    {
      "id": "p_surfboard",
      "cat": "paddle",
      "name": "Surfboard",
      "rarity": "common",
      "desc": "A proper surfboard: pointed nose, painted panels, a centre stringer, a wax patch and three tail fins."
    },
    {
      "id": "p_soccergoal",
      "cat": "paddle",
      "name": "Soccer Goal",
      "rarity": "common",
      "desc": "A goal from above: dark turf inside a white frame, with a fine diamond net."
    },
    {
      "id": "p_lightsaber",
      "cat": "paddle",
      "name": "Lightsaber",
      "rarity": "legendary",
      "desc": "A humming energy blade in your glow colour, with a machined metal hilt."
    },
    {
      "id": "o_none",
      "cat": "glow",
      "name": "Soft White",
      "rarity": "default",
      "desc": "The default: a white paddle with a soft white bloom. Always free."
    },
    {
      "id": "o_cyan",
      "cat": "glow",
      "name": "Cyan Glow",
      "rarity": "common",
      "desc": "A steady cyan glow. Your paddle turns cyan and gives off cyan light."
    },
    {
      "id": "o_pink",
      "cat": "glow",
      "name": "Hot Pink Glow",
      "rarity": "common",
      "desc": "A steady pink glow."
    },
    {
      "id": "o_pulse",
      "cat": "glow",
      "name": "Beat Pulse",
      "rarity": "epic",
      "desc": "A violet bloom that swells smoothly on every beat of the music."
    },
    {
      "id": "o_rainbow",
      "cat": "glow",
      "name": "Rainbow Glow",
      "rarity": "legendary",
      "desc": "The glow and paddle drift smoothly through every colour."
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
      "desc": "A cold pale-blue glow that slowly breathes brighter and dimmer."
    },
    {
      "id": "o_flame",
      "cat": "glow",
      "name": "Flame Glow",
      "rarity": "epic",
      "desc": "A warm orange glow that flickers like a fire."
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
      "desc": "Three lights orbit your paddle."
    },
    {
      "id": "a_sparks",
      "cat": "aura",
      "name": "Sparks",
      "rarity": "rare",
      "desc": "Sparkling particles dance around the bar."
    },
    {
      "id": "a_comet",
      "cat": "aura",
      "name": "Comet",
      "rarity": "epic",
      "desc": "A flowing wake streams behind your paddle."
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
      "desc": "A gridiron with yard lines, hash marks, tinted end zones and a matching worn dirt patch at each end."
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
      "desc": "The inside of a ship: ribbed corridor walls, chasing light strips, console LEDs and a viewport onto a slow planet."
    },
    {
      "id": "b_grassyfield",
      "cat": "board",
      "name": "Grassy Field",
      "rarity": "common",
      "desc": "An open meadow: hundreds of grass blades sway in rolling gusts while cloud shadows drift over."
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
      "desc": "The goal pulls the light in: contracting rings, spiralling sparks, a flare that snaps shut, then a last flash."
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
    {
      "id": "h_dotmatrix",
      "cat": "hud",
      "name": "Dot Matrix",
      "rarity": "common",
      "desc": "A grid of round dots, spaced so even a leading zero stays clear of the next digit."
    },
    {
      "id": "h_outline",
      "cat": "hud",
      "name": "Outline",
      "rarity": "common",
      "desc": "Clean hollow digits."
    },
    {
      "id": "h_mono",
      "cat": "hud",
      "name": "Monospace",
      "rarity": "common",
      "desc": "Flat, no-glow monospace digits with an underline."
    },
    {
      "id": "h_binary",
      "cat": "hud",
      "name": "Binary",
      "rarity": "rare",
      "desc": "A faint scroll of 1s and 0s behind the digits."
    },
    {
      "id": "h_hologram",
      "cat": "hud",
      "name": "Hologram",
      "rarity": "rare",
      "desc": "A flickery cyan/magenta split with scanlines."
    },
    {
      "id": "h_circuit",
      "cat": "hud",
      "name": "Circuit",
      "rarity": "rare",
      "desc": "Glowing digits framed by circuit-trace ticks."
    },
    {
      "id": "h_neonsign",
      "cat": "hud",
      "name": "Neon Sign",
      "rarity": "epic",
      "desc": "A warm tube-light glow that flickers now and then."
    },
    {
      "id": "h_glitch",
      "cat": "hud",
      "name": "Glitch",
      "rarity": "epic",
      "desc": "RGB-split jitter that spikes every couple of seconds."
    },
    {
      "id": "h_rainbow",
      "cat": "hud",
      "name": "Rainbow Billboard",
      "rarity": "legendary",
      "desc": "No backing panel: each digit cycles smoothly through the colours of the rainbow."
    },
    {
      "id": "circle",
      "cat": "ball",
      "name": "Classic",
      "rarity": "default",
      "desc": "The original ball. Always free."
    },
    {
      "id": "square",
      "cat": "ball",
      "name": "Square",
      "rarity": "common",
      "desc": "A spinning square."
    },
    {
      "id": "triangle",
      "cat": "ball",
      "name": "Triangle",
      "rarity": "common",
      "desc": "A spinning triangle."
    },
    {
      "id": "diamond",
      "cat": "ball",
      "name": "Diamond",
      "rarity": "common",
      "desc": "A gently rocking diamond."
    },
    {
      "id": "pentagon",
      "cat": "ball",
      "name": "Pentagon",
      "rarity": "common",
      "desc": "A spinning pentagon."
    },
    {
      "id": "hexagon",
      "cat": "ball",
      "name": "Hexagon",
      "rarity": "common",
      "desc": "A spinning hexagon."
    },
    {
      "id": "star",
      "cat": "ball",
      "name": "Star",
      "rarity": "common",
      "desc": "A spinning five-point star."
    },
    {
      "id": "heart",
      "cat": "ball",
      "name": "Heart",
      "rarity": "common",
      "desc": "A heart that beats as it flies."
    },
    {
      "id": "cube",
      "cat": "ball",
      "name": "Wire Cube",
      "rarity": "common",
      "desc": "A 3D wireframe cube that tumbles."
    },
    {
      "id": "alien",
      "cat": "ball",
      "name": "Alien",
      "rarity": "rare",
      "desc": "A lime-green head with two big black eyes."
    },
    {
      "id": "ufo",
      "cat": "ball",
      "name": "UFO",
      "rarity": "rare",
      "desc": "A saucer with blinking lights."
    },
    {
      "id": "planet",
      "cat": "ball",
      "name": "Ringed Planet",
      "rarity": "rare",
      "desc": "A tilted ring around a banded planet."
    },
    {
      "id": "moon",
      "cat": "ball",
      "name": "Crescent Moon",
      "rarity": "rare",
      "desc": "A soft crescent moon."
    },
    {
      "id": "sun",
      "cat": "ball",
      "name": "Sun",
      "rarity": "rare",
      "desc": "A spinning sun with rays."
    },
    {
      "id": "atom",
      "cat": "ball",
      "name": "Atom",
      "rarity": "rare",
      "desc": "Three orbits with electrons flying around a nucleus."
    },
    {
      "id": "basketball",
      "cat": "ball",
      "name": "Basketball",
      "rarity": "common",
      "desc": "A classic basketball."
    },
    {
      "id": "soccer",
      "cat": "ball",
      "name": "Soccer Ball",
      "rarity": "common",
      "desc": "A classic soccer ball."
    },
    {
      "id": "tennis",
      "cat": "ball",
      "name": "Tennis Ball",
      "rarity": "common",
      "desc": "A fuzzy tennis ball."
    },
    {
      "id": "baseball",
      "cat": "ball",
      "name": "Baseball",
      "rarity": "common",
      "desc": "Stitched red laces on white leather."
    },
    {
      "id": "eightball",
      "cat": "ball",
      "name": "8-Ball",
      "rarity": "rare",
      "desc": "The dreaded 8-ball."
    },
    {
      "id": "pizza",
      "cat": "ball",
      "name": "Pizza Slice",
      "rarity": "common",
      "desc": "A slice with pepperoni."
    },
    {
      "id": "donut",
      "cat": "ball",
      "name": "Donut",
      "rarity": "common",
      "desc": "Frosted with sprinkles."
    },
    {
      "id": "taco",
      "cat": "ball",
      "name": "Taco",
      "rarity": "common",
      "desc": "A folded taco shell, fully loaded."
    },
    {
      "id": "cookie",
      "cat": "ball",
      "name": "Cookie",
      "rarity": "common",
      "desc": "A chocolate chip cookie."
    },
    {
      "id": "skull",
      "cat": "ball",
      "name": "Skull",
      "rarity": "rare",
      "desc": "A grinning skull."
    },
    {
      "id": "eyeball",
      "cat": "ball",
      "name": "Eyeball",
      "rarity": "rare",
      "desc": "The pupil looks toward whoever it's flying at."
    },
    {
      "id": "ghost",
      "cat": "ball",
      "name": "Ghost",
      "rarity": "rare",
      "desc": "A plain white sheet ghost."
    },
    {
      "id": "bomb",
      "cat": "ball",
      "name": "Bomb",
      "rarity": "epic",
      "desc": "The fuse sparks faster as the rally gets longer."
    },
    {
      "id": "duck",
      "cat": "ball",
      "name": "Rubber Duck",
      "rarity": "common",
      "desc": "A rubber duck, wobbling along."
    },
    {
      "id": "catface",
      "cat": "ball",
      "name": "Cat Face",
      "rarity": "common",
      "desc": "A blinking cat face."
    },
    {
      "id": "smiley",
      "cat": "ball",
      "name": "Smiley",
      "rarity": "common",
      "desc": "Turns shocked at high speed."
    },
    {
      "id": "dice",
      "cat": "ball",
      "name": "Die",
      "rarity": "rare",
      "desc": "Shows a different face on every hit."
    },
    {
      "id": "coin",
      "cat": "ball",
      "name": "Spinning Coin",
      "rarity": "rare",
      "desc": "A coin flipping edge over edge."
    },
    {
      "id": "gem",
      "cat": "ball",
      "name": "Gem",
      "rarity": "epic",
      "desc": "A faceted, rocking gem."
    },
    {
      "id": "snowflake",
      "cat": "ball",
      "name": "Snowflake",
      "rarity": "rare",
      "desc": "A six-armed snowflake."
    },
    {
      "id": "crown",
      "cat": "ball",
      "name": "Crown",
      "rarity": "legendary",
      "desc": "A jeweled crown fit for a champion."
    },
    {
      "id": "o_white",
      "cat": "glow",
      "name": "Radiant White",
      "rarity": "common",
      "desc": "A brighter, steady white bloom than the default."
    },
    {
      "id": "o_red",
      "cat": "glow",
      "name": "Red Glow",
      "rarity": "common",
      "desc": "A steady red glow."
    },
    {
      "id": "o_orange",
      "cat": "glow",
      "name": "Orange Glow",
      "rarity": "common",
      "desc": "A steady orange glow."
    },
    {
      "id": "o_yellow",
      "cat": "glow",
      "name": "Yellow Glow",
      "rarity": "common",
      "desc": "A steady yellow glow."
    },
    {
      "id": "o_green",
      "cat": "glow",
      "name": "Green Glow",
      "rarity": "common",
      "desc": "A steady green glow."
    },
    {
      "id": "o_blue",
      "cat": "glow",
      "name": "Blue Glow",
      "rarity": "common",
      "desc": "A steady blue glow."
    },
    {
      "id": "o_teal",
      "cat": "glow",
      "name": "Teal Glow",
      "rarity": "common",
      "desc": "A steady teal glow."
    },
    {
      "id": "o_magenta",
      "cat": "glow",
      "name": "Magenta Glow",
      "rarity": "common",
      "desc": "A steady magenta glow."
    },
    {
      "id": "o_pulse_red",
      "cat": "glow",
      "name": "Red Beat Pulse",
      "rarity": "rare",
      "desc": "A red bloom that swells smoothly on every beat."
    },
    {
      "id": "o_pulse_blue",
      "cat": "glow",
      "name": "Blue Beat Pulse",
      "rarity": "rare",
      "desc": "A blue bloom that swells smoothly on every beat."
    },
    {
      "id": "o_pulse_green",
      "cat": "glow",
      "name": "Green Beat Pulse",
      "rarity": "rare",
      "desc": "A green bloom that swells smoothly on every beat."
    },
    {
      "id": "o_pulse_pink",
      "cat": "glow",
      "name": "Pink Beat Pulse",
      "rarity": "rare",
      "desc": "A pink bloom that swells smoothly on every beat."
    },
    {
      "id": "o_pulse_rainbow",
      "cat": "glow",
      "name": "Rainbow Beat Pulse",
      "rarity": "legendary",
      "desc": "Cycles through every colour while it swells on the beat."
    },
    {
      "id": "o_breathe_cyan",
      "cat": "glow",
      "name": "Cyan Breathing",
      "rarity": "rare",
      "desc": "A cyan glow that slowly brightens and dims."
    },
    {
      "id": "o_breathe_red",
      "cat": "glow",
      "name": "Red Breathing",
      "rarity": "rare",
      "desc": "A red glow that slowly brightens and dims."
    },
    {
      "id": "o_breathe_green",
      "cat": "glow",
      "name": "Green Breathing",
      "rarity": "rare",
      "desc": "A green glow that slowly brightens and dims."
    },
    {
      "id": "o_breathe_pink",
      "cat": "glow",
      "name": "Pink Breathing",
      "rarity": "rare",
      "desc": "A pink glow that slowly brightens and dims."
    },
    {
      "id": "o_breathe_rainbow",
      "cat": "glow",
      "name": "Rainbow Breathing",
      "rarity": "legendary",
      "desc": "Drifts through every colour while it slowly breathes."
    },
    {
      "id": "a_lightning",
      "cat": "aura",
      "name": "Lightning",
      "rarity": "epic",
      "desc": "Electric arcs and sparks jump off the edges of your paddle."
    },
    {
      "id": "a_frost",
      "cat": "aura",
      "name": "Frost",
      "rarity": "epic",
      "desc": "Drifting mist, falling snow and small ice crystals that flash in and out."
    },
    {
      "id": "a_fire",
      "cat": "aura",
      "name": "Fire",
      "rarity": "epic",
      "desc": "Flames lick up both sides of the paddle and embers drift away."
    },
    {
      "id": "a_shockwave",
      "cat": "aura",
      "name": "Shockwave",
      "rarity": "legendary",
      "desc": "A ring bursts outward from your paddle every time you hit the ball."
    },
    {
      "id": "a_petals",
      "cat": "aura",
      "name": "Petals",
      "rarity": "common",
      "desc": "Soft pink petals drift down past your paddle."
    },
    {
      "id": "a_bubbles",
      "cat": "aura",
      "name": "Bubbles",
      "rarity": "common",
      "desc": "Shiny bubbles float up along the paddle."
    },
    {
      "id": "a_orbit",
      "cat": "aura",
      "name": "Orbiting Worlds",
      "rarity": "rare",
      "desc": "Three tiny worlds circle your paddle, one of them ringed."
    },
    {
      "id": "t_lightning",
      "cat": "trail",
      "name": "Lightning",
      "rarity": "epic",
      "desc": "A crackling bolt follows the ball with the odd fork. The ball itself stays clear."
    },
    {
      "id": "t_glitch",
      "cat": "trail",
      "name": "Glitch",
      "rarity": "epic",
      "desc": "Chopped afterimages with the red and cyan channels pulled apart."
    },
    {
      "id": "b_grid_cyan",
      "cat": "board",
      "name": "Cyan Grid",
      "rarity": "common",
      "desc": "The synth-wave grid in electric cyan."
    },
    {
      "id": "b_grid_green",
      "cat": "board",
      "name": "Green Grid",
      "rarity": "common",
      "desc": "The synth-wave grid in matrix green."
    },
    {
      "id": "b_grid_orange",
      "cat": "board",
      "name": "Orange Grid",
      "rarity": "common",
      "desc": "The synth-wave grid in sunset orange."
    },
    {
      "id": "b_grid_red",
      "cat": "board",
      "name": "Red Grid",
      "rarity": "common",
      "desc": "The synth-wave grid in alarm red."
    },
    {
      "id": "b_sunset_crt",
      "cat": "board",
      "name": "Retro Sunset CRT",
      "rarity": "epic",
      "desc": "The striped sunset seen on an old tube: scanlines, phosphor bloom, a rolling bar and a heavy vignette."
    },
    {
      "id": "b_classic",
      "cat": "board",
      "name": "Classic Pong",
      "rarity": "common",
      "desc": "Pure black and white with a dashed centre line, like the very first arcade cabinet."
    },
    {
      "id": "b_lavalamp_blue",
      "cat": "board",
      "name": "Blue Lava Lamp",
      "rarity": "common",
      "desc": "Big soft blobs of blue and cyan slowly rise and merge."
    },
    {
      "id": "b_deepsea_light",
      "cat": "board",
      "name": "Light Deep Sea",
      "rarity": "rare",
      "desc": "A pale sea in white, black ink and red: jellyfish and bubbles drift by. Paddles get a soft shadow so they stay readable."
    },
    {
      "id": "b_city",
      "cat": "board",
      "name": "Neon City",
      "rarity": "epic",
      "desc": "A night skyline in three drifting layers, with lit windows and neon signs."
    },
    {
      "id": "b_pcb",
      "cat": "board",
      "name": "Circuit Board",
      "rarity": "rare",
      "desc": "Green traces, chips and pads with data pulses running along the wiring."
    },
    {
      "id": "b_icerink",
      "cat": "board",
      "name": "Ice Rink",
      "rarity": "common",
      "desc": "Scratched white ice with red and blue lines and face-off circles. Paddles get a soft shadow so they stay readable."
    },
    {
      "id": "b_dunes",
      "cat": "board",
      "name": "Desert Dusk",
      "rarity": "rare",
      "desc": "Layered dunes under a low sun, with wind-blown sand skimming across."
    },
    {
      "id": "p_pencil",
      "cat": "paddle",
      "name": "Pencil",
      "rarity": "common",
      "desc": "A sharpened yellow pencil with a metal ferrule and a pink eraser."
    },
    {
      "id": "p_bamboo",
      "cat": "paddle",
      "name": "Bamboo",
      "rarity": "common",
      "desc": "A green bamboo stalk with nodes and two swaying leaves."
    },
    {
      "id": "p_crystal",
      "cat": "paddle",
      "name": "Crystal",
      "rarity": "epic",
      "desc": "A faceted crystal with a glint that sweeps down it. Tinted by your glow."
    },
    {
      "id": "p_rocket",
      "cat": "paddle",
      "name": "Rocket",
      "rarity": "rare",
      "desc": "A little rocket with a flickering exhaust flame."
    },
    {
      "id": "p_ruler",
      "cat": "paddle",
      "name": "Ruler",
      "rarity": "common",
      "desc": "A wooden ruler with centimetre marks."
    },
    {
      "id": "g_starburst",
      "cat": "goalfx",
      "name": "Starburst",
      "rarity": "rare",
      "desc": "Rays fan out from the goal and colourful stars fly across the court."
    },
    {
      "id": "g_lightning",
      "cat": "goalfx",
      "name": "Lightning Strike",
      "rarity": "epic",
      "desc": "Forked bolts crash down onto the goal with a white flash."
    },
    {
      "id": "g_coinshower",
      "cat": "goalfx",
      "name": "Coin Shower",
      "rarity": "rare",
      "desc": "Gold coins rain down and bounce across the court."
    },
    {
      "id": "g_laser",
      "cat": "goalfx",
      "name": "Laser Show",
      "rarity": "epic",
      "desc": "Sweeping neon laser beams fan out from the goal."
    }
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
          "startRate": 1,
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
