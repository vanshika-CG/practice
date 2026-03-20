from flask import Flask, request, jsonify
import base64
import numpy as np
from PIL import Image
import io
from deepface import DeepFace
import os

app = Flask(__name__)

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "database"))
print(f"[DEBUG] Database folder: {DB_PATH}")
print("[DEBUG] Files:", os.listdir(DB_PATH) if os.path.exists(DB_PATH) else "Not found")

@app.route('/find-matches', methods=['POST'])
def find_matches():
    data = request.json
    if 'frame' not in data:
        return jsonify({"matches": [], "error": "No frame"})

    try:
        img_data = data['frame'].split(',')[1]
        img_bytes = base64.b64decode(img_data)
        img = Image.open(io.BytesIO(img_bytes)).convert('RGB')
        img_np = np.array(img)
    except Exception as e:
        return jsonify({"matches": [], "error": f"Decode failed: {str(e)}"})

    print(f"[DEBUG] Frame shape: {img_np.shape}")

    try:
        faces = DeepFace.extract_faces(img_np, detector_backend="ssd", enforce_detection=False)
        print(f"[DEBUG] Detected {len(faces)} faces")

        if len(faces) == 0:
            return jsonify({"matches": [], "message": "No face detected"})

        df = DeepFace.find(
            img_path=img_np,
            db_path=DB_PATH,
            model_name="ArcFace",
            distance_metric="cosine",
            detector_backend="ssd",
            enforce_detection=False,
            silent=True,
            align=True
        )

        matches = []
        for result_df in df:
            if result_df.empty:
                print("[DEBUG] No candidates found")
                continue

            for _, row in result_df.iterrows():
                distance = row['distance']
                identity = row['identity']
                print(f"[DEBUG] Candidate: {identity} → distance = {distance:.4f}")

                if distance < 0.85:  # ← more lenient for real webcam
                    case_id = os.path.basename(identity).replace('.jpg', '')
                    confidence = max(0, min(100, round(100 * (1 - distance / 1.0), 1)))
                    if confidence >= 40:  # lower bar for demo
                        matches.append({
                            "caseId": case_id,
                            "confidence": confidence,
                            "distance": float(distance)
                        })

        if matches:
            print(f"[MATCH FOUND] {len(matches)} matches")
        else:
            print("[NO MATCH] Below threshold")

        return jsonify({"matches": matches})

    except Exception as e:
        print(f"[ERROR] {str(e)}")
        return jsonify({"matches": [], "error": str(e)})

if __name__ == '__main__':
    app.run(port=5000, debug=True, use_reloader=False)