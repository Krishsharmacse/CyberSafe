import sys
sys.path.insert(0, '/home/krish-sharma/Desktop/cyber Security/CyberSafe/backend')
from main import DeepfakeVideoDetector
import cv2
import time
import numpy as np

print("Initializing...")
d = DeepfakeVideoDetector()
print("Done initializing. Putting frame.")

frame = np.zeros((480, 640, 3), dtype=np.uint8)
for i in range(20):
    while d.input_queue.full() and d.running:
        time.sleep(0.01)
    d.process_frame(frame)
    time.sleep(0.1)

print(d.get_status())
d.stop()
