import sys
sys.path.insert(0, '/home/krish-sharma/Desktop/cyber Security/CyberSafe/backend')
from main import DeepfakeVideoDetector
import cv2
import time

d = DeepfakeVideoDetector()
frame = cv2.imread('/home/krish-sharma/Desktop/cyber Security/CyberSafe/backend/README.md') # or any dummy matrix
import numpy as np
frame = np.zeros((480, 640, 3), dtype=np.uint8)

for i in range(20):
    d.process_frame(frame)
    time.sleep(0.1)

print(d.get_status())
d.stop()
