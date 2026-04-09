import sys
sys.path.insert(0, '/home/krish-sharma/Desktop/cyber Security/CyberSafe/backend')
from main import predict_audio
import numpy as np
import io
import soundfile as sf

# generate 1s dummy audio
sr = 16000
samples = np.random.uniform(-1, 1, sr).astype(np.float32)
buf = io.BytesIO()
sf.write(buf, samples, sr, format='WAV')
buf.seek(0)

try:
    print(predict_audio(buf.read()))
except Exception as e:
    print("ERROR:", type(e), e)
