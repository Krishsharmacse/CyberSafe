import sys
sys.path.insert(0, '/home/krish-sharma/Desktop/cyber Security/CyberSafe/backend')
import traceback

print("Starting audio test...", flush=True)
try:
    from main import predict_audio
    print("Imported predict_audio", flush=True)
    import numpy as np
    import io
    import soundfile as sf
    
    sr = 16000
    samples = np.random.uniform(-1, 1, sr).astype(np.float32)
    buf = io.BytesIO()
    sf.write(buf, samples, sr, format='WAV')
    buf.seek(0)
    
    result = predict_audio(buf.read())
    print("Result:", result, flush=True)
except Exception as e:
    print("ERROR:", traceback.format_exc(), flush=True)
