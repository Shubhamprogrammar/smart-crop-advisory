"""
Disease knowledge mapping for the model's actual output classes.

The model (linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification,
fine-tuned on the PlantVillage dataset) outputs 38 raw labels covering many
crops. This app only *acts* on the subset for tomato, potato, and maize —
the three of the spec's six target crops this model actually supports (see
SUPPORTED_DISEASE_CROPS) — everything else is treated as unsupported by
the route layer, not silently misreported.

General guidance only: symptoms/causes/prevention framing, never a
specific pesticide product, brand, or dosage (matches the project's
AI-safety rule against inventing pesticide dosages).
"""

DISEASE_KNOWLEDGE: dict[str, dict] = {
    "Tomato with Bacterial Spot": {
        "cropType": "tomato",
        "diseaseName": "Bacterial Spot",
        "isHealthy": False,
        "symptoms": ["Small, dark, water-soaked spots on leaves and fruit", "Spots may merge and cause leaf yellowing/drop"],
        "possibleCauses": ["Xanthomonas bacteria, spread by splashing water and contaminated tools/seed"],
        "prevention": ["Use disease-free seed/seedlings", "Avoid overhead irrigation", "Rotate crops, avoid working in wet fields"],
        "treatment": ["Remove and destroy infected plant debris", "Improve airflow via spacing/pruning", "Consult a local agriculture expert about approved bactericides for severe cases"],
    },
    "Tomato with Early Blight": {
        "cropType": "tomato",
        "diseaseName": "Early Blight",
        "isHealthy": False,
        "symptoms": ["Dark concentric-ring spots on older/lower leaves first", "Yellowing around spots, progressive leaf drop"],
        "possibleCauses": ["Alternaria fungus, favored by warm humid conditions and plant stress"],
        "prevention": ["Rotate crops, avoid planting tomato/potato in the same spot yearly", "Mulch to reduce soil splash onto leaves", "Ensure balanced fertilization to avoid plant stress"],
        "treatment": ["Remove affected lower leaves", "Improve air circulation", "Consult a local agriculture expert about approved fungicides for severe outbreaks"],
    },
    "Tomato with Late Blight": {
        "cropType": "tomato",
        "diseaseName": "Late Blight",
        "isHealthy": False,
        "symptoms": ["Large, irregular, water-soaked lesions on leaves that turn brown/black", "White fungal growth on leaf undersides in humid weather", "Can destroy a crop quickly"],
        "possibleCauses": ["Phytophthora infestans (oomycete), spreads rapidly in cool, wet, humid weather"],
        "prevention": ["Use resistant varieties where available", "Avoid overhead irrigation and excess humidity", "Space plants for airflow"],
        "treatment": ["Remove and destroy infected plants promptly — this disease spreads fast", "Consult a local agriculture expert urgently for severe/spreading cases"],
    },
    "Tomato with Leaf Mold": {
        "cropType": "tomato",
        "diseaseName": "Leaf Mold",
        "isHealthy": False,
        "symptoms": ["Pale green/yellow spots on upper leaf surface", "Olive-green to grayish mold on the underside"],
        "possibleCauses": ["Fulvia fulva fungus, thrives in high humidity, common in greenhouses/dense plantings"],
        "prevention": ["Improve ventilation and reduce humidity around plants", "Avoid overhead watering", "Space plants adequately"],
        "treatment": ["Remove affected leaves", "Improve airflow and reduce humidity", "Consult a local agriculture expert if it spreads"],
    },
    "Tomato with Septoria Leaf Spot": {
        "cropType": "tomato",
        "diseaseName": "Septoria Leaf Spot",
        "isHealthy": False,
        "symptoms": ["Small circular spots with dark borders and gray/tan centers, mainly on lower leaves"],
        "possibleCauses": ["Septoria lycopersici fungus, spread by water splash and favored by wet conditions"],
        "prevention": ["Rotate crops", "Avoid overhead irrigation", "Remove plant debris after harvest"],
        "treatment": ["Remove affected leaves promptly", "Improve airflow", "Consult a local agriculture expert about approved fungicides for severe cases"],
    },
    "Tomato with Spider Mites or Two-spotted Spider Mite": {
        "cropType": "tomato",
        "diseaseName": "Spider Mites (Two-spotted Spider Mite)",
        "isHealthy": False,
        "symptoms": ["Fine yellow/white speckling on leaves", "Fine webbing on leaves/stems in heavy infestations"],
        "possibleCauses": ["Tetranychus urticae mites, thrive in hot, dry conditions and plant stress"],
        "prevention": ["Avoid drought stress on plants", "Encourage natural predators", "Monitor regularly, especially in hot dry weather"],
        "treatment": ["Rinse plants with water to dislodge mites for light infestations", "Consult a local agriculture expert for miticide options if severe"],
    },
    "Tomato with Target Spot": {
        "cropType": "tomato",
        "diseaseName": "Target Spot",
        "isHealthy": False,
        "symptoms": ["Brown lesions with concentric rings (target-like pattern) on leaves, stems, and fruit"],
        "possibleCauses": ["Corynespora cassiicola fungus, favored by warm humid conditions"],
        "prevention": ["Rotate crops", "Avoid overhead irrigation", "Ensure good field sanitation"],
        "treatment": ["Remove infected plant material", "Improve airflow", "Consult a local agriculture expert if it spreads significantly"],
    },
    "Tomato Yellow Leaf Curl Virus": {
        "cropType": "tomato",
        "diseaseName": "Yellow Leaf Curl Virus",
        "isHealthy": False,
        "symptoms": ["Upward curling and yellowing of leaves", "Stunted growth", "Reduced fruit set"],
        "possibleCauses": ["A virus transmitted by whiteflies"],
        "prevention": ["Control whitefly populations", "Use virus-resistant varieties where available", "Remove and destroy infected plants to reduce spread"],
        "treatment": ["No cure once infected — focus on removing infected plants and controlling whiteflies to protect the rest of the crop", "Consult a local agriculture expert about whitefly management"],
    },
    "Tomato Mosaic Virus": {
        "cropType": "tomato",
        "diseaseName": "Mosaic Virus",
        "isHealthy": False,
        "symptoms": ["Mottled light/dark green pattern on leaves", "Leaf distortion, stunted growth", "Reduced yield"],
        "possibleCauses": ["A virus spread mainly through contaminated tools, hands, and infected seed"],
        "prevention": ["Use certified virus-free seed", "Disinfect tools between plants", "Wash hands after handling infected plants"],
        "treatment": ["No cure once infected — remove and destroy infected plants to prevent spread", "Consult a local agriculture expert for prevention guidance"],
    },
    "Healthy Tomato Plant": {
        "cropType": "tomato",
        "diseaseName": None,
        "isHealthy": True,
        "symptoms": [],
        "possibleCauses": [],
        "prevention": ["Continue regular monitoring and good field hygiene"],
        "treatment": [],
    },
    "Potato with Early Blight": {
        "cropType": "potato",
        "diseaseName": "Early Blight",
        "isHealthy": False,
        "symptoms": ["Dark concentric-ring spots on older leaves", "Yellowing and leaf drop as it progresses"],
        "possibleCauses": ["Alternaria solani fungus, favored by warm humid conditions and plant stress"],
        "prevention": ["Rotate crops", "Ensure balanced fertilization", "Avoid overhead irrigation"],
        "treatment": ["Remove affected foliage", "Improve airflow", "Consult a local agriculture expert about approved fungicides for severe cases"],
    },
    "Potato with Late Blight": {
        "cropType": "potato",
        "diseaseName": "Late Blight",
        "isHealthy": False,
        "symptoms": ["Water-soaked lesions on leaves turning brown/black rapidly", "White mold on leaf undersides in humid weather", "Can affect tubers too"],
        "possibleCauses": ["Phytophthora infestans (oomycete), spreads rapidly in cool, wet, humid weather"],
        "prevention": ["Use certified disease-free seed potatoes", "Avoid overhead irrigation", "Space plants for airflow"],
        "treatment": ["Remove and destroy infected plants promptly — this disease spreads fast and affects storage", "Consult a local agriculture expert urgently for severe/spreading cases"],
    },
    "Healthy Potato Plant": {
        "cropType": "potato",
        "diseaseName": None,
        "isHealthy": True,
        "symptoms": [],
        "possibleCauses": [],
        "prevention": ["Continue regular monitoring and good field hygiene"],
        "treatment": [],
    },
    "Corn (Maize) with Cercospora and Gray Leaf Spot": {
        "cropType": "maize",
        "diseaseName": "Gray Leaf Spot",
        "isHealthy": False,
        "symptoms": ["Rectangular gray/tan lesions running parallel to leaf veins"],
        "possibleCauses": ["Cercospora zeae-maydis fungus, favored by warm humid conditions and crop residue"],
        "prevention": ["Rotate crops away from maize", "Use resistant hybrids where available", "Manage crop residue"],
        "treatment": ["Remove/manage infected residue after harvest", "Consult a local agriculture expert about approved fungicides for severe cases"],
    },
    "Corn (Maize) with Common Rust": {
        "cropType": "maize",
        "diseaseName": "Common Rust",
        "isHealthy": False,
        "symptoms": ["Small, reddish-brown pustules scattered on both leaf surfaces"],
        "possibleCauses": ["Puccinia sorghi fungus, spread by windborne spores"],
        "prevention": ["Use resistant hybrids where available", "Monitor fields regularly, especially in humid conditions"],
        "treatment": ["Usually manageable — consult a local agriculture expert about fungicide options only if infection is severe and early in the season"],
    },
    "Corn (Maize) with Northern Leaf Blight": {
        "cropType": "maize",
        "diseaseName": "Northern Leaf Blight",
        "isHealthy": False,
        "symptoms": ["Long, cigar-shaped gray-green to tan lesions on leaves"],
        "possibleCauses": ["Exserohilum turcicum fungus, favored by moderate temperatures and high humidity"],
        "prevention": ["Rotate crops", "Use resistant hybrids where available", "Manage crop residue"],
        "treatment": ["Remove/manage infected residue after harvest", "Consult a local agriculture expert about approved fungicides for severe cases"],
    },
    "Healthy Corn (Maize) Plant": {
        "cropType": "maize",
        "diseaseName": None,
        "isHealthy": True,
        "symptoms": [],
        "possibleCauses": [],
        "prevention": ["Continue regular monitoring and good field hygiene"],
        "treatment": [],
    },
}


def get_disease_knowledge(raw_label: str) -> dict | None:
    return DISEASE_KNOWLEDGE.get(raw_label)
