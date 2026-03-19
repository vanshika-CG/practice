from flask import Flask, request, jsonify
import base64
import numpy as np
from PIL import Image
import io
from deepface import DeepFace
import os

app = Flask(__name__)
DB_PATH = os.path.join(os.path.dirname(__file__), "../database")

@app.route('/find-matches', methods=['POST'])
def find_matches():
    data = request.json
    img_data = data['frame'].split(',')[1]
    img_bytes = base64.b64decode(img_data)
    img = Image.open(io.BytesIO(img_bytes)).convert('RGB')
    img_np = np.array(img)

    try:
        df = DeepFace.find(
            img_path=img_np,
            db_path=DB_PATH,
            model_name="ArcFace",
            distance_metric="cosine",
            detector_backend="opencv",
            enforce_detection=False,
            silent=True
        )

        matches = []
        for _, row in df.iterrows():
            if row['distance'] < 0.40:   # Tune this if needed
                case_id = os.path.basename(row['identity']).split('.')[0]
                confidence = round((1 - row['distance'] / 0.40) * 100, 1)
                if confidence > 70:
                    matches.append({
                        "caseId": case_id,
                        "confidence": min(100, confidence)
                    })
        return jsonify({"matches": matches})
    except Exception as e:
        return jsonify({"matches": [], "error": str(e)})

if __name__ == '__main__':
    app.run(port=5000, debug=True)