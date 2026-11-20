/**
 * SMS/USSD menu engine.
 *
 * The engine is stateless: a session is just the list of inputs the user has
 * typed so far. `run(inputs)` replays them from the main menu and returns the
 * text to show next, so any channel (SMS, USSD, web simulator) can reuse it.
 *
 * Exposed as AgriCare.menu.
 */
(function (global) {
  "use strict";

  const { counties, crops, pests, advisories, helpTopics, marketPrices } =
    global.AgriCare.data;

  const SHORT_CODE = "2323";

  const MAIN_MENU = [
    "AgriCare-Liberia",
    "1 Planting guide",
    "2 Pest alert",
    "3 Market prices",
    "4 Food check",
    "5 Get help",
    "6 Join advisories",
    "7 Advisory library",
    "0 Exit",
  ].join("\n");

  // ---------- helpers ----------

  const labelOf = (item) => (typeof item === "string" ? item : item.name || item.topic);

  const numberedList = (items) =>
    items.map((item, i) => `${i + 1} ${labelOf(item)}`).join("\n");

  /** Parses `input` as an integer in [min, max]; returns null when invalid. */
  function parseChoice(input, min, max) {
    if (!/^\d+$/.test(input)) return null;
    const n = Number(input);
    return n >= min && n <= max ? n : null;
  }

  /** Finds a county by exact name, then by prefix (case-insensitive). */
  function matchCounty(input) {
    const query = input.trim().toLowerCase();
    if (!query) return null;
    return (
      counties.find((c) => c.toLowerCase() === query) ||
      counties.find((c) => c.toLowerCase().startsWith(query)) ||
      null
    );
  }

  function notify(hooks, name, value) {
    if (typeof hooks[name] === "function") hooks[name](value);
  }

  // ---------- food security score ----------

  const HARVEST_POINTS = { 1: 20, 2: 10, 3: 0 }; // good / average / poor

  /** Score from 0 to 100 based on meals per day, weeks of stock and harvest outlook. */
  function computeFoodScore(mealsPerDay, weeksOfStock, harvestOutlook) {
    const raw =
      (mealsPerDay - 1) * 20 + Math.min(weeksOfStock, 12) * 4 + HARVEST_POINTS[harvestOutlook];
    return Math.min(100, raw);
  }

  function describeFoodScore(score) {
    if (score >= 70) return "Food secure. Keep seed for next season.";
    if (score >= 50) return "Stressed. Dry and store grain well, avoid selling food you need.";
    if (score >= 30) return "Crisis. Ask for help now: choose 5 on the menu.";
    return "Emergency. Send a help request today.";
  }

  // ---------- screens ----------
  // Each state has a `prompt` (text shown on entry) and a `handle` function.
  // `handle` returns { next } to move on, { end } to finish with a message,
  // or INVALID to stay on the same screen and show an error.

  const INVALID = Object.freeze({ invalid: true });

  /** Screen where picking item N ends the session with `format(item)`. */
  function choiceScreen(prompt, items, format) {
    return {
      prompt: () => prompt + "\n" + numberedList(items),
      handle(input) {
        const n = parseChoice(input, 1, items.length);
        return n ? { end: format(items[n - 1]) } : INVALID;
      },
    };
  }

  const MAIN_ROUTES = [null, "plant", "pest", null, "food_meals", "help", "join", "library"];

  const SCREENS = {
    main: {
      prompt: () => MAIN_MENU,
      handle(input) {
        const n = parseChoice(input, 0, 7);
        if (n === null) return INVALID;
        if (n === 0) return { end: `Thank you. Text ${SHORT_CODE} any time for the menu.` };
        if (n === 3) return { end: marketPrices };
        return { next: MAIN_ROUTES[n] };
      },
    },

    plant: choiceScreen("Which crop?", crops, (c) => `${c.name}: ${c.guidance}`),
    pest: choiceScreen("Which problem?", pests, (p) => `${p.name}: ${p.guidance}`),
    library: choiceScreen(
      "Advisory library. Choose a topic:",
      advisories,
      (a) => `${a.topic}: ${a.answer}`
    ),

    food_meals: {
      prompt: () => "Meals eaten per day?\n1 One\n2 Two\n3 Three",
      handle(input, answers) {
        const n = parseChoice(input, 1, 3);
        if (!n) return INVALID;
        answers.meals = n;
        return { next: "food_stock" };
      },
    },

    food_stock: {
      prompt: () => "Weeks of food in stock? (0-12)",
      handle(input, answers) {
        const n = parseChoice(input, 0, 12);
        if (n === null) return INVALID;
        answers.weeks = n;
        return { next: "food_harvest" };
      },
    },

    food_harvest: {
      prompt: () => "Harvest outlook?\n1 Good\n2 Average\n3 Poor",
      handle(input, answers, hooks) {
        const n = parseChoice(input, 1, 3);
        if (!n) return INVALID;
        const score = computeFoodScore(answers.meals, answers.weeks, n);
        notify(hooks, "onFoodCheck", score);
        return { end: `Score ${score}/100. ${describeFoodScore(score)}` };
      },
    },

    help: {
      prompt: () => "Help with:\n" + numberedList(helpTopics),
      handle(input, answers, hooks) {
        const n = parseChoice(input, 1, helpTopics.length);
        if (!n) return INVALID;
        notify(hooks, "onHelp", helpTopics[n - 1]);
        return { end: "Request sent. An extension officer will contact you." };
      },
    },

    join: {
      prompt: () =>
        "Choose your county by number for free farm advisories:\n" + numberedList(counties),
      handle(input, answers, hooks) {
        const n = parseChoice(input, 1, counties.length);
        const county = n ? counties[n - 1] : matchCounty(input);
        if (!county) return INVALID;
        notify(hooks, "onJoin", county);
        return { end: `You are subscribed to ${county} advisories. Text STOP to leave.` };
      },
    },
  };

  // ---------- public API ----------

  /**
   * Replays `inputs` from the main menu.
   *
   * @param {string[]} inputs  Everything the user has typed in this session.
   * @param {{onJoin?: Function, onHelp?: Function, onFoodCheck?: Function}} [hooks]
   *        Callbacks fired when a flow completes.
   * @returns {{text: string, end: boolean}}  Text to display and whether the session is over.
   */
  function run(inputs, hooks = {}) {
    let screen = "main";
    let showError = false;
    const answers = {};

    for (const raw of inputs) {
      const result = SCREENS[screen].handle(raw.trim(), answers, hooks);
      if (result.end) return { text: result.end, end: true };
      showError = Boolean(result.invalid);
      if (!showError) screen = result.next;
    }

    const prefix = showError ? "Invalid choice.\n" : "";
    return { text: prefix + SCREENS[screen].prompt(), end: false };
  }

  global.AgriCare.menu = Object.freeze({ SHORT_CODE, MAIN_MENU, run, computeFoodScore });
})(window);
