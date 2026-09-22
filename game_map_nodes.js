// game_map_nodes.js
const initialNodesData = {
  "N10": {
    "id": "N10",
    "type": "location",
    "name": "Market Place",
    "x": 332,
    "y": 409,
    "neighbors": [
      "N11",
      "N18",
      "N28",
      "N36",
      "N44",
      "N62"
    ],
    "requiredItem": null,
    "locationName": "Market Place"
  },
  "N11": {
    "id": "N11",
    "type": "path",
    "name": "Step 2",
    "x": 364,
    "y": 400,
    "neighbors": [
      "N10",
      "N12"
    ]
  },
  "N12": {
    "id": "N12",
    "type": "path",
    "name": "Step 3",
    "x": 392,
    "y": 399,
    "neighbors": [
      "N11",
      "N13"
    ]
  },
  "N13": {
    "id": "N13",
    "type": "path",
    "name": "Step 4",
    "x": 432,
    "y": 395,
    "neighbors": [
      "N12",
      "N14"
    ]
  },
  "N14": {
    "id": "N14",
    "type": "path",
    "name": "Step 5",
    "x": 471,
    "y": 392,
    "neighbors": [
      "N13",
      "N15",
      "N108"
    ]
  },
  "N15": {
    "id": "N15",
    "type": "path",
    "name": "Step 6",
    "x": 509,
    "y": 390,
    "neighbors": [
      "N14",
      "N16"
    ]
  },
  "N16": {
    "id": "N16",
    "type": "path",
    "name": "Step 7",
    "x": 529,
    "y": 386,
    "neighbors": [
      "N15",
      "N17"
    ]
  },
  "N17": {
    "id": "N17",
    "type": "location",
    "name": "Temple Ground",
    "x": 555,
    "y": 377,
    "neighbors": [
      "N16"
    ],
    "locationName": "Temple Ground",
    "requiredItem": "Kedavilakku"
  },
  "N18": {
    "id": "N18",
    "type": "path",
    "name": "Step 9",
    "x": 341,
    "y": 373,
    "neighbors": [
      "N10",
      "N19"
    ]
  },
  "N19": {
    "id": "N19",
    "type": "path",
    "name": "Step 10",
    "x": 348,
    "y": 355,
    "neighbors": [
      "N18",
      "N20"
    ]
  },
  "N20": {
    "id": "N20",
    "type": "path",
    "name": "Step 11",
    "x": 368,
    "y": 312,
    "neighbors": [
      "N19",
      "N21"
    ]
  },
  "N21": {
    "id": "N21",
    "type": "path",
    "name": "Step 12",
    "x": 381,
    "y": 295,
    "neighbors": [
      "N20",
      "N22"
    ]
  },
  "N22": {
    "id": "N22",
    "type": "path",
    "name": "Step 13",
    "x": 397,
    "y": 283,
    "neighbors": [
      "N21",
      "N23"
    ]
  },
  "N23": {
    "id": "N23",
    "type": "path",
    "name": "Step 14",
    "x": 420,
    "y": 275,
    "neighbors": [
      "N22",
      "N24",
      "N72",
      "N111"
    ]
  },
  "N24": {
    "id": "N24",
    "type": "path",
    "name": "Step 15",
    "x": 459,
    "y": 271,
    "neighbors": [
      "N23",
      "N25"
    ]
  },
  "N25": {
    "id": "N25",
    "type": "path",
    "name": "Step 16",
    "x": 486,
    "y": 267,
    "neighbors": [
      "N24",
      "N26"
    ]
  },
  "N26": {
    "id": "N26",
    "type": "path",
    "name": "Step 17",
    "x": 510,
    "y": 262,
    "neighbors": [
      "N25",
      "N27"
    ]
  },
  "N27": {
    "id": "N27",
    "type": "location",
    "name": "Sacred Shrine",
    "x": 529,
    "y": 256,
    "neighbors": [
      "N26"
    ],
    "locationName": "Sacred Shrine",
    "requiredItem": "Palm Toddy"
  },
  "N28": {
    "id": "N28",
    "type": "path",
    "name": "Step 19",
    "x": 308,
    "y": 373,
    "neighbors": [
      "N10",
      "N29"
    ]
  },
  "N29": {
    "id": "N29",
    "type": "path",
    "name": "Step 20",
    "x": 300,
    "y": 323,
    "neighbors": [
      "N28",
      "N30"
    ]
  },
  "N30": {
    "id": "N30",
    "type": "path",
    "name": "Step 21",
    "x": 299,
    "y": 298,
    "neighbors": [
      "N29",
      "N31"
    ]
  },
  "N31": {
    "id": "N31",
    "type": "path",
    "name": "Step 22",
    "x": 298,
    "y": 270,
    "neighbors": [
      "N30",
      "N32"
    ]
  },
  "N32": {
    "id": "N32",
    "type": "path",
    "name": "Step 23",
    "x": 284,
    "y": 236,
    "neighbors": [
      "N31",
      "N33",
      "N79",
      "N105"
    ]
  },
  "N33": {
    "id": "N33",
    "type": "path",
    "name": "Step 24",
    "x": 271,
    "y": 200,
    "neighbors": [
      "N32",
      "N34"
    ]
  },
  "N34": {
    "id": "N34",
    "type": "path",
    "name": "Step 25",
    "x": 259,
    "y": 167,
    "neighbors": [
      "N33",
      "N35"
    ]
  },
  "N35": {
    "id": "N35",
    "type": "location",
    "name": "Banyan Tree",
    "x": 248,
    "y": 150,
    "neighbors": [
      "N34"
    ],
    "locationName": "Banyan Tree",
    "requiredItem": "Choottu"
  },
  "N36": {
    "id": "N36",
    "type": "path",
    "name": "Step 27",
    "x": 293,
    "y": 411,
    "neighbors": [
      "N10",
      "N37"
    ]
  },
  "N37": {
    "id": "N37",
    "type": "path",
    "name": "Step 28",
    "x": 233,
    "y": 410,
    "neighbors": [
      "N36",
      "N38"
    ]
  },
  "N38": {
    "id": "N38",
    "type": "path",
    "name": "Step 29",
    "x": 197,
    "y": 402,
    "neighbors": [
      "N37",
      "N39"
    ]
  },
  "N39": {
    "id": "N39",
    "type": "path",
    "name": "Step 30",
    "x": 155,
    "y": 383,
    "neighbors": [
      "N38",
      "N40",
      "N95"
    ]
  },
  "N40": {
    "id": "N40",
    "type": "path",
    "name": "Step 31",
    "x": 117,
    "y": 354,
    "neighbors": [
      "N39",
      "N41",
      "N101"
    ]
  },
  "N41": {
    "id": "N41",
    "type": "path",
    "name": "Step 32",
    "x": 96,
    "y": 333,
    "neighbors": [
      "N40",
      "N42"
    ]
  },
  "N42": {
    "id": "N42",
    "type": "path",
    "name": "Step 33",
    "x": 70,
    "y": 291,
    "neighbors": [
      "N41",
      "N43"
    ]
  },
  "N43": {
    "id": "N43",
    "type": "location",
    "name": "Serpent Grove",
    "x": 51,
    "y": 268,
    "neighbors": [
      "N42"
    ],
    "locationName": "Serpent Grove",
    "requiredItem": "Metal Rod"
  },
  "N44": {
    "id": "N44",
    "type": "path",
    "name": "Step 35",
    "x": 316,
    "y": 437,
    "neighbors": [
      "N10",
      "N45"
    ]
  },
  "N45": {
    "id": "N45",
    "type": "path",
    "name": "Step 36",
    "x": 286,
    "y": 453,
    "neighbors": [
      "N44",
      "N46"
    ]
  },
  "N46": {
    "id": "N46",
    "type": "path",
    "name": "Step 37",
    "x": 234,
    "y": 471,
    "neighbors": [
      "N45",
      "N47"
    ]
  },
  "N47": {
    "id": "N47",
    "type": "path",
    "name": "Step 38",
    "x": 200,
    "y": 478,
    "neighbors": [
      "N46",
      "N48",
      "N55"
    ]
  },
  "N48": {
    "id": "N48",
    "type": "path",
    "name": "Step 39",
    "x": 183,
    "y": 498,
    "neighbors": [
      "N47",
      "N49"
    ]
  },
  "N49": {
    "id": "N49",
    "type": "path",
    "name": "Step 40",
    "x": 168,
    "y": 531,
    "neighbors": [
      "N48",
      "N50"
    ]
  },
  "N50": {
    "id": "N50",
    "type": "path",
    "name": "Step 41",
    "x": 168,
    "y": 569,
    "neighbors": [
      "N49",
      "N51",
      "N100"
    ]
  },
  "N51": {
    "id": "N51",
    "type": "path",
    "name": "Step 42",
    "x": 168,
    "y": 593,
    "neighbors": [
      "N50",
      "N52"
    ]
  },
  "N52": {
    "id": "N52",
    "type": "path",
    "name": "Step 43",
    "x": 167,
    "y": 624,
    "neighbors": [
      "N51",
      "N53"
    ]
  },
  "N53": {
    "id": "N53",
    "type": "path",
    "name": "Step 44",
    "x": 166,
    "y": 651,
    "neighbors": [
      "N52",
      "N54"
    ]
  },
  "N54": {
    "id": "N54",
    "type": "location",
    "name": "Pond Pavilion",
    "x": 166,
    "y": 674,
    "neighbors": [
      "N53"
    ],
    "locationName": "Pond Pavilion",
    "requiredItem": "Wooden Cane"
  },
  "N55": {
    "id": "N55",
    "type": "path",
    "name": "Step 46",
    "x": 223,
    "y": 502,
    "neighbors": [
      "N47",
      "N56"
    ]
  },
  "N56": {
    "id": "N56",
    "type": "path",
    "name": "Step 47",
    "x": 245,
    "y": 535,
    "neighbors": [
      "N55",
      "N57"
    ]
  },
  "N57": {
    "id": "N57",
    "type": "path",
    "name": "Step 48",
    "x": 274,
    "y": 567,
    "neighbors": [
      "N56",
      "N58",
      "N112"
    ]
  },
  "N58": {
    "id": "N58",
    "type": "path",
    "name": "Step 49",
    "x": 320,
    "y": 598,
    "neighbors": [
      "N57",
      "N59"
    ]
  },
  "N59": {
    "id": "N59",
    "type": "path",
    "name": "Step 50",
    "x": 375,
    "y": 636,
    "neighbors": [
      "N58",
      "N60"
    ]
  },
  "N60": {
    "id": "N60",
    "type": "path",
    "name": "Step 51",
    "x": 379,
    "y": 655,
    "neighbors": [
      "N59",
      "N61"
    ]
  },
  "N61": {
    "id": "N61",
    "type": "location",
    "name": "Royal Granary",
    "x": 379,
    "y": 677,
    "neighbors": [
      "N60"
    ],
    "locationName": "Royal Granary",
    "requiredItem": "Raw Rice Grains"
  },
  "N62": {
    "id": "N62",
    "type": "path",
    "name": "Step 53",
    "x": 357,
    "y": 445,
    "neighbors": [
      "N10",
      "N63"
    ]
  },
  "N63": {
    "id": "N63",
    "type": "path",
    "name": "Step 54",
    "x": 380,
    "y": 472,
    "neighbors": [
      "N62",
      "N64"
    ]
  },
  "N64": {
    "id": "N64",
    "type": "path",
    "name": "Step 55",
    "x": 455,
    "y": 522,
    "neighbors": [
      "N63",
      "N65",
      "N116"
    ]
  },
  "N65": {
    "id": "N65",
    "type": "path",
    "name": "Step 56",
    "x": 496,
    "y": 544,
    "neighbors": [
      "N64",
      "N66",
      "N106"
    ]
  },
  "N66": {
    "id": "N66",
    "type": "path",
    "name": "Step 57",
    "x": 529,
    "y": 577,
    "neighbors": [
      "N65",
      "N67"
    ]
  },
  "N67": {
    "id": "N67",
    "type": "path",
    "name": "Step 58",
    "x": 536,
    "y": 603,
    "neighbors": [
      "N66",
      "N68"
    ]
  },
  "N68": {
    "id": "N68",
    "type": "path",
    "name": "Step 59",
    "x": 546,
    "y": 647,
    "neighbors": [
      "N67",
      "N69"
    ]
  },
  "N69": {
    "id": "N69",
    "type": "path",
    "name": "Step 60",
    "x": 546,
    "y": 678,
    "neighbors": [
      "N68",
      "N70"
    ]
  },
  "N70": {
    "id": "N70",
    "type": "path",
    "name": "Step 61",
    "x": 546,
    "y": 709,
    "neighbors": [
      "N69",
      "N71"
    ]
  },
  "N71": {
    "id": "N71",
    "type": "location",
    "name": "Armory Vault",
    "x": 543,
    "y": 735,
    "neighbors": [
      "N70"
    ],
    "locationName": "Armory Vault",
    "requiredItem": "Urumi"
  },
  "N72": {
    "id": "N72",
    "type": "path",
    "name": "Step 63",
    "x": 422,
    "y": 252,
    "neighbors": [
      "N23",
      "N73"
    ]
  },
  "N73": {
    "id": "N73",
    "type": "path",
    "name": "Step 64",
    "x": 418,
    "y": 177,
    "neighbors": [
      "N72",
      "N74"
    ]
  },
  "N74": {
    "id": "N74",
    "type": "path",
    "name": "Step 65",
    "x": 412,
    "y": 131,
    "neighbors": [
      "N73",
      "N75"
    ]
  },
  "N75": {
    "id": "N75",
    "type": "path",
    "name": "Step 66",
    "x": 418,
    "y": 104,
    "neighbors": [
      "N74",
      "N76"
    ]
  },
  "N76": {
    "id": "N76",
    "type": "path",
    "name": "Step 67",
    "x": 456,
    "y": 87,
    "neighbors": [
      "N75",
      "N77"
    ]
  },
  "N77": {
    "id": "N77",
    "type": "path",
    "name": "Step 68",
    "x": 511,
    "y": 92,
    "neighbors": [
      "N76",
      "N78"
    ]
  },
  "N78": {
    "id": "N78",
    "type": "location",
    "name": "Ritual Altar",
    "x": 543,
    "y": 106,
    "neighbors": [
      "N77"
    ],
    "locationName": "Ritual Altar",
    "requiredItem": "Lime Paste"
  },
  "N79": {
    "id": "N79",
    "type": "path",
    "name": "Step 70",
    "x": 262,
    "y": 240,
    "neighbors": [
      "N32",
      "N80"
    ]
  },
  "N80": {
    "id": "N80",
    "type": "path",
    "name": "Step 71",
    "x": 234,
    "y": 235,
    "neighbors": [
      "N79",
      "N81"
    ]
  },
  "N81": {
    "id": "N81",
    "type": "path",
    "name": "Step 72",
    "x": 198,
    "y": 229,
    "neighbors": [
      "N80",
      "N82"
    ]
  },
  "N82": {
    "id": "N82",
    "type": "path",
    "name": "Step 73",
    "x": 167,
    "y": 221,
    "neighbors": [
      "N81",
      "N83"
    ]
  },
  "N83": {
    "id": "N83",
    "type": "path",
    "name": "Step 74",
    "x": 142,
    "y": 201,
    "neighbors": [
      "N82",
      "N84"
    ]
  },
  "N84": {
    "id": "N84",
    "type": "path",
    "name": "Step 75",
    "x": 128,
    "y": 179,
    "neighbors": [
      "N83",
      "N85"
    ]
  },
  "N85": {
    "id": "N85",
    "type": "path",
    "name": "Step 76",
    "x": 126,
    "y": 160,
    "neighbors": [
      "N84",
      "N86"
    ]
  },
  "N86": {
    "id": "N86",
    "type": "path",
    "name": "Step 77",
    "x": 128,
    "y": 132,
    "neighbors": [
      "N85",
      "N87"
    ]
  },
  "N87": {
    "id": "N87",
    "type": "path",
    "name": "Step 78",
    "x": 112,
    "y": 112,
    "neighbors": [
      "N86",
      "N88"
    ]
  },
  "N88": {
    "id": "N88",
    "type": "path",
    "name": "Step 79",
    "x": 135,
    "y": 91,
    "neighbors": [
      "N87",
      "N89"
    ]
  },
  "N89": {
    "id": "N89",
    "type": "path",
    "name": "Step 80",
    "x": 155,
    "y": 90,
    "neighbors": [
      "N88",
      "N90"
    ]
  },
  "N90": {
    "id": "N90",
    "type": "path",
    "name": "Step 81",
    "x": 197,
    "y": 84,
    "neighbors": [
      "N89",
      "N91"
    ]
  },
  "N91": {
    "id": "N91",
    "type": "path",
    "name": "Step 82",
    "x": 235,
    "y": 87,
    "neighbors": [
      "N90",
      "N92"
    ]
  },
  "N92": {
    "id": "N92",
    "type": "path",
    "name": "Step 83",
    "x": 283,
    "y": 83,
    "neighbors": [
      "N91",
      "N93"
    ]
  },
  "N93": {
    "id": "N93",
    "type": "path",
    "name": "Step 84",
    "x": 314,
    "y": 83,
    "neighbors": [
      "N92",
      "N94"
    ]
  },
  "N94": {
    "id": "N94",
    "type": "location",
    "name": "Ancient Vault",
    "x": 348,
    "y": 83,
    "neighbors": [
      "N93"
    ],
    "locationName": "Ancient Vault",
    "requiredItem": "Gold"
  },
  "N95": {
    "id": "N95",
    "type": "path",
    "name": "Step 86",
    "x": 143,
    "y": 407,
    "neighbors": [
      "N39",
      "N96"
    ]
  },
  "N96": {
    "id": "N96",
    "type": "path",
    "name": "Step 87",
    "x": 128,
    "y": 439,
    "neighbors": [
      "N95",
      "N97"
    ]
  },
  "N97": {
    "id": "N97",
    "type": "path",
    "name": "Step 88",
    "x": 113,
    "y": 488,
    "neighbors": [
      "N96",
      "N98"
    ]
  },
  "N98": {
    "id": "N98",
    "type": "path",
    "name": "Step 89",
    "x": 110,
    "y": 514,
    "neighbors": [
      "N97",
      "N99"
    ]
  },
  "N99": {
    "id": "N99",
    "type": "path",
    "name": "Step 90",
    "x": 110,
    "y": 537,
    "neighbors": [
      "N98",
      "N100"
    ]
  },
  "N100": {
    "id": "N100",
    "type": "path",
    "name": "Step 91",
    "x": 127,
    "y": 553,
    "neighbors": [
      "N99",
      "N50"
    ]
  },
  "N101": {
    "id": "N101",
    "type": "path",
    "name": "Step 92",
    "x": 134,
    "y": 336,
    "neighbors": [
      "N40",
      "N102"
    ]
  },
  "N102": {
    "id": "N102",
    "type": "path",
    "name": "Step 93",
    "x": 159,
    "y": 324,
    "neighbors": [
      "N101",
      "N103"
    ]
  },
  "N103": {
    "id": "N103",
    "type": "path",
    "name": "Step 94",
    "x": 196,
    "y": 299,
    "neighbors": [
      "N102",
      "N104"
    ]
  },
  "N104": {
    "id": "N104",
    "type": "path",
    "name": "Step 95",
    "x": 222,
    "y": 287,
    "neighbors": [
      "N103",
      "N105"
    ]
  },
  "N105": {
    "id": "N105",
    "type": "path",
    "name": "Step 96",
    "x": 260,
    "y": 269,
    "neighbors": [
      "N104",
      "N32"
    ]
  },
  "N106": {
    "id": "N106",
    "type": "path",
    "name": "Step 97",
    "x": 490,
    "y": 510,
    "neighbors": [
      "N65",
      "N107"
    ]
  },
  "N107": {
    "id": "N107",
    "type": "path",
    "name": "Step 98",
    "x": 477,
    "y": 465,
    "neighbors": [
      "N106",
      "N108"
    ]
  },
  "N108": {
    "id": "N108",
    "type": "path",
    "name": "Step 99",
    "x": 470,
    "y": 421,
    "neighbors": [
      "N107",
      "N14",
      "N109"
    ]
  },
  "N109": {
    "id": "N109",
    "type": "path",
    "name": "Step 100",
    "x": 474,
    "y": 362,
    "neighbors": [
      "N108",
      "N110"
    ]
  },
  "N110": {
    "id": "N110",
    "type": "path",
    "name": "Step 101",
    "x": 472,
    "y": 338,
    "neighbors": [
      "N109",
      "N111"
    ]
  },
  "N111": {
    "id": "N111",
    "type": "path",
    "name": "Step 102",
    "x": 437,
    "y": 310,
    "neighbors": [
      "N110",
      "N23"
    ]
  },
  "N112": {
    "id": "N112",
    "type": "path",
    "name": "Step 103",
    "x": 310,
    "y": 562,
    "neighbors": [
      "N57",
      "N113"
    ]
  },
  "N113": {
    "id": "N113",
    "type": "path",
    "name": "Step 104",
    "x": 341,
    "y": 563,
    "neighbors": [
      "N112",
      "N114"
    ]
  },
  "N114": {
    "id": "N114",
    "type": "path",
    "name": "Step 105",
    "x": 368,
    "y": 563,
    "neighbors": [
      "N113",
      "N115"
    ]
  },
  "N115": {
    "id": "N115",
    "type": "path",
    "name": "Step 106",
    "x": 429,
    "y": 563,
    "neighbors": [
      "N114",
      "N116"
    ]
  },
  "N116": {
    "id": "N116",
    "type": "path",
    "name": "Step 107",
    "x": 450,
    "y": 546,
    "neighbors": [
      "N115",
      "N64"
    ]
  }
};