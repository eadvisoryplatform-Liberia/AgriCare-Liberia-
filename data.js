/**
 * Static content for the SMS/USSD demo.
 * Edit this file to change crop guides, pest tips, advisories, counties or prices.
 * Exposed as AgriCare.data (read-only).
 */
(function (global) {
  "use strict";

  function deepFreeze(value) {
    if (value && typeof value === "object") {
      Object.values(value).forEach(deepFreeze);
      Object.freeze(value);
    }
    return value;
  }

  const AgriCare = (global.AgriCare = global.AgriCare || {});

  AgriCare.data = deepFreeze({
    "counties": [
      "Bomi",
      "Bong",
      "Gbarpolu",
      "Grand Bassa",
      "Grand Cape Mount",
      "Grand Gedeh",
      "Grand Kru",
      "Lofa",
      "Margibi",
      "Maryland",
      "Montserrado",
      "Nimba",
      "River Cess",
      "River Gee",
      "Sinoe"
    ],
    "crops": [
      {
        "name": "Rice",
        "guidance": "Plant Apr-May at start of rains. Harvest 4-5 months. Use drained land; weed early and often."
      },
      {
        "name": "Cassava",
        "guidance": "Plant Mar-May or Sep-Oct. Harvest 9-12 months. Use healthy stem cuttings only."
      },
      {
        "name": "Cocoa",
        "guidance": "Plant seedlings May-Jun under light shade. Pods in 3-4 yrs. Remove sick pods often."
      },
      {
        "name": "Oil palm",
        "guidance": "Plant seedlings at start of rains. Bunches in about 3 yrs. Keep ground around young palms clean."
      },
      {
        "name": "Rubber",
        "guidance": "Plant at start of rains. Tapping after 6-7 yrs. Protect young trees from fire and weeds."
      },
      {
        "name": "Maize",
        "guidance": "Plant Apr-May, 2nd planting Aug. Harvest 3-4 months. Check often for fall armyworm."
      },
      {
        "name": "Groundnut",
        "guidance": "Plant Apr-May or Aug-Sep. Harvest 3-4 months. Plant early, use clean seed."
      },
      {
        "name": "Pepper",
        "guidance": "Start in nursery, transplant after 4-6 wks. Fruit in 3-4 months. Avoid wet, standing-water spots."
      }
    ],
    "pests": [
      {
        "name": "Fall armyworm (maize)",
        "guidance": "Ragged leaf holes, wet sawdust-like droppings. Check plants 2x a week, hand-pick small worms, tell your extension officer before spraying."
      },
      {
        "name": "Cassava mosaic",
        "guidance": "Twisted leaves with yellow-green patches. Pull out and burn sick plants. Plant only healthy cuttings."
      },
      {
        "name": "Rice blast",
        "guidance": "Grey diamond spots on leaves. Use resistant varieties. Do not over-use nitrogen. Ask your officer."
      },
      {
        "name": "Cocoa black pod",
        "guidance": "Brown-black spots spreading on pod. Remove and bury sick pods often. Prune for air flow. Harvest on time."
      },
      {
        "name": "Groundnut rosette",
        "guidance": "Small bushy yellow plants. Plant early and close. Remove sick plants. Use clean seed."
      }
    ],
    "advisories": [
      {
        "topic": "Rice",
        "question": "My rice leaves are turning yellow. What could be the problem?",
        "answer": "Yellow leaves may be caused by pests, diseases, lack of nutrients, or too much water. Check the plants carefully and contact an agricultural extension officer for proper advice."
      },
      {
        "topic": "Cassava",
        "question": "My cassava leaves are curling and changing colour. What should I do?",
        "answer": "This may be caused by cassava disease or insect pests. Use healthy planting stems and ask an extension officer to inspect the plants."
      },
      {
        "topic": "Maize (corn)",
        "question": "Something is eating the leaves of my maize, and there are holes in them. What is happening?",
        "answer": "It may be caused by insects such as Fall Armyworm. Inspect the leaves and the centre of the plant. Seek advice on safe control methods."
      },
      {
        "topic": "Sweet potato",
        "question": "My sweet potato leaves are being eaten, and the plants are not growing well. What should I do?",
        "answer": "Insects, disease, poor soil, or water problems may be responsible. Check the leaves and roots and seek agricultural advice."
      },
      {
        "topic": "Vegetables and greens",
        "question": "My vegetable leaves have holes and are turning yellow. What could be wrong?",
        "answer": "Insects, diseases, or nutrient problems may be responsible. Check the affected plants and ask an extension officer to identify the cause."
      },
      {
        "topic": "Pepper",
        "question": "My pepper plants are flowering, but the fruits are not developing properly. Why?",
        "answer": "This may be related to poor pollination, water stress, pests, or disease. Check the plants regularly and seek proper advice."
      },
      {
        "topic": "Tomato",
        "question": "My tomato fruits are developing dark spots and rotting. What should I do?",
        "answer": "This may be caused by disease, fruit damage, or environmental conditions. Remove affected fruits where appropriate and get the plants inspected."
      },
      {
        "topic": "General farming",
        "question": "What should I do to improve the growth and harvest of my crops?",
        "answer": "Use healthy seeds, prepare the soil properly, plant at the right time, control weeds, monitor pests, and follow recommended farming practices."
      },
      {
        "topic": "Okra",
        "question": "My okra leaves are curling, and small insects are gathering underneath them. What should I do?",
        "answer": "Aphids or other insects may be attacking the leaves. Inspect the plants and seek advice on safe pest-control methods."
      },
      {
        "topic": "Cocoa",
        "question": "My cocoa pods are developing brown patches and starting to rot. What is the problem?",
        "answer": "This may be caused by Black Pod Disease. Remove affected pods, improve airflow around the trees, and seek advice from an agricultural officer."
      },
      {
        "topic": "Groundnut",
        "question": "My groundnut leaves are turning yellow, and the plants are not growing properly. What could be wrong?",
        "answer": "This may be caused by disease, pests, nutrient deficiency, or water stress. Have the plants inspected to identify the actual cause."
      },
      {
        "topic": "Plantain and banana",
        "question": "My plantain leaves are turning yellow, and the plants are growing slowly. What should I do?",
        "answer": "This may be caused by pests, disease, poor soil, or lack of water. Inspect the plants and seek agricultural advice."
      },
      {
        "topic": "Onion",
        "question": "My onion leaves are drying from the tips, and the plants are not growing well. What could be the problem?",
        "answer": "This may be caused by insects, disease, or water and nutrient problems. Check the plants and seek proper advice before applying any treatment."
      },
      {
        "topic": "Livestock (chickens)",
        "question": "My chickens are not eating properly and some are becoming weak. What should I do?",
        "answer": "This may be a sign of illness, poor feeding, or unsuitable housing conditions. Separate sick birds where possible, provide clean water, and contact a veterinary officer promptly."
      },
      {
        "topic": "Livestock (goats and sheep)",
        "question": "My goats and sheep are losing weight even though I feed them regularly. What could be the problem?",
        "answer": "Weight loss may be caused by parasites, illness, poor-quality feed, or other health problems. Provide clean water and suitable feed, and contact a veterinary officer to examine the animals."
      }
    ],
    "helpTopics": [
      "Food shortage",
      "Pests",
      "Soil",
      "Seed",
      "Storage"
    ],
    "marketPrices": "Rice $38/50kg bag, Cassava $11/bag, Palm oil $11/gal, Maize $19/bag, Groundnut $31/bag, Veg $1.20/bunch (demo prices)"
  });
})(window);
