// Conservative UTG RFI for 6-max 100bb (implementable baseline).
// Intent: ~17–19% open frequency typical for UTG/Lojack at 6-max. Refine as desired.
// Suited: more opens; offsuit broadways pruned. Pairs 66+ opened; 55 borderline.
const UTG_FREQ_100BB = {
  // Pairs
  "AA": 100, "KK": 100, "QQ": 100, "JJ": 100, "TT": 100, "99": 100, "88": 100, "77": 100, "66": 100,

  // Suited Ax
  "AKs": 100, "AQs": 100, "AJs": 100, "ATs": 100, "A9s": 50, "A8s": 25,

  // Suited Kx
  "KQs": 100, "KJs": 100, "KTs": 50,

  // Suited QJ/T9 connectors and good suited connectors
  "QJs": 100, "JTs": 100, "T9s": 100, "98s": 50, "87s": 25,

  // Offsuit Ax/Broadways
  "AKo": 100, "AQo": 100, "AJo": 50,
  "KQo": 50,

  // Everything else defaults to 0 (fold)
};

export default UTG_FREQ_100BB;
