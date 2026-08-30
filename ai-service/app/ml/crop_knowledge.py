"""
Static benefits/risks knowledge for the 22 crops the trained model can
recommend. Deliberately general, non-numeric agronomic guidance (no
fabricated dosages, yields, or prices) -- exactly the kind of information
that's safe to state without a live agronomist or a specific field visit.
"""

CROP_KNOWLEDGE: dict[str, dict[str, list[str]]] = {
    "rice": {
        "benefits": [
            "High demand as a staple food crop",
            "Well-suited to high-rainfall, humid regions",
        ],
        "risks": [
            "Very high water requirement",
            "Susceptible to blast and other fungal diseases in humid conditions",
        ],
    },
    "maize": {
        "benefits": [
            "Versatile — used for food, feed, and industrial purposes",
            "Shorter growth duration than many cereals",
        ],
        "risks": [
            "Susceptible to fall armyworm and stem borer",
            "Yield sensitive to water stress during flowering",
        ],
    },
    "chickpea": {
        "benefits": [
            "Nitrogen-fixing — improves soil fertility for the next crop",
            "Low water requirement, suited to dry conditions",
        ],
        "risks": [
            "Susceptible to pod borer and fusarium wilt",
            "Sensitive to waterlogging",
        ],
    },
    "kidneybeans": {
        "benefits": [
            "Nitrogen-fixing legume, improves soil health",
            "Steady market demand as a protein-rich pulse",
        ],
        "risks": [
            "Susceptible to bean mosaic virus and root rot",
            "Sensitive to both drought and waterlogging",
        ],
    },
    "pigeonpeas": {
        "benefits": [
            "Deep-rooted and drought-tolerant",
            "Nitrogen-fixing; can be intercropped with cereals",
        ],
        "risks": [
            "Long duration crop (often 5-6+ months)",
            "Susceptible to pod borer and wilt",
        ],
    },
    "mothbeans": {
        "benefits": [
            "Highly drought-tolerant, suited to arid/semi-arid regions",
            "Low input requirement",
        ],
        "risks": [
            "Lower yield potential than irrigated crops",
            "Limited market/processing infrastructure in some regions",
        ],
    },
    "mungbean": {
        "benefits": [
            "Short duration crop, fits well in crop rotation",
            "Nitrogen-fixing, improves soil fertility",
        ],
        "risks": [
            "Susceptible to yellow mosaic virus",
            "Sensitive to waterlogging",
        ],
    },
    "blackgram": {
        "benefits": [
            "Nitrogen-fixing legume",
            "Short duration, suitable for double-cropping",
        ],
        "risks": [
            "Susceptible to yellow mosaic virus and powdery mildew",
            "Sensitive to prolonged dry spells at flowering",
        ],
    },
    "lentil": {
        "benefits": [
            "Nitrogen-fixing, low water requirement",
            "Cool-season crop with steady demand as a pulse",
        ],
        "risks": [
            "Susceptible to rust and wilt diseases",
            "Sensitive to frost at flowering stage",
        ],
    },
    "pomegranate": {
        "benefits": [
            "High-value fruit crop with strong export potential",
            "Relatively drought-tolerant once established",
        ],
        "risks": [
            "High upfront investment and multi-year wait before full yield",
            "Susceptible to bacterial blight and fruit borer",
        ],
    },
    "banana": {
        "benefits": [
            "High yield per acre and consistent local market demand",
            "Multiple harvests possible from a single planting (ratoon crop)",
        ],
        "risks": [
            "High water requirement",
            "Vulnerable to strong winds and Panama wilt disease",
        ],
    },
    "mango": {
        "benefits": [
            "High-value, long-established export and domestic market",
            "Relatively low annual input needs once established",
        ],
        "risks": [
            "Long juvenile period before first fruiting (several years)",
            "Susceptible to anthracnose and fruit fly",
        ],
    },
    "grapes": {
        "benefits": [
            "High market value for table and processing use",
            "Can give multiple harvests per year in suitable climates",
        ],
        "risks": [
            "Requires significant trellising/infrastructure investment",
            "Susceptible to downy and powdery mildew — needs careful monitoring",
        ],
    },
    "watermelon": {
        "benefits": [
            "Short duration, fast return on investment",
            "High market demand in summer months",
        ],
        "risks": [
            "High water requirement during fruit development",
            "Susceptible to fusarium wilt and fruit fly",
        ],
    },
    "muskmelon": {
        "benefits": [
            "Short duration crop with quick returns",
            "Good demand in the summer season",
        ],
        "risks": [
            "Sensitive to fluctuating soil moisture",
            "Susceptible to powdery mildew and fruit fly",
        ],
    },
    "apple": {
        "benefits": [
            "High-value fruit with strong demand",
            "Well suited to cooler climates with distinct winter chilling",
        ],
        "risks": [
            "Requires a cold winter chilling period — not viable in warm regions",
            "Long time to first commercial harvest",
        ],
    },
    "orange": {
        "benefits": [
            "Well-established market as a citrus fruit",
            "Perennial crop with a multi-year productive life",
        ],
        "risks": [
            "Susceptible to citrus canker and greening disease",
            "Sensitive to prolonged waterlogging",
        ],
    },
    "papaya": {
        "benefits": [
            "Fast-growing, often fruiting within a year",
            "High nutritional and market value",
        ],
        "risks": [
            "Susceptible to papaya ringspot virus",
            "Sensitive to waterlogging and strong wind",
        ],
    },
    "coconut": {
        "benefits": [
            "Long productive lifespan (decades) once established",
            "Multiple products (copra, oil, fiber) support diversified income",
        ],
        "risks": [
            "Long juvenile period before first yield",
            "Susceptible to rhinoceros beetle and root wilt disease",
        ],
    },
    "cotton": {
        "benefits": [
            "Established industrial/textile demand",
            "Suited to semi-arid regions with moderate rainfall",
        ],
        "risks": [
            "Highly susceptible to bollworm — often needs intensive pest management",
            "Water and input intensive during peak growth",
        ],
    },
    "jute": {
        "benefits": [
            "Established industrial demand for fiber",
            "Suited to high-humidity, high-rainfall regions",
        ],
        "risks": [
            "Requires standing water for the retting process — labor and water intensive",
            "Market price can fluctuate with synthetic fiber competition",
        ],
    },
    "coffee": {
        "benefits": [
            "High-value crop with strong export demand",
            "Long productive lifespan once established",
        ],
        "risks": [
            "Requires specific shade/altitude/climate conditions",
            "Susceptible to coffee berry borer and leaf rust",
        ],
    },
}

DEFAULT_KNOWLEDGE = {
    "benefits": [],
    "risks": ["Limited agronomic reference data available for this crop in this system."],
}


def get_crop_knowledge(crop: str) -> dict[str, list[str]]:
    return CROP_KNOWLEDGE.get(crop, DEFAULT_KNOWLEDGE)
