import os
import cv2
import tempfile
import numpy as np
import torch
import torch.nn as nn
import streamlit as st
from PIL import Image
from torchvision import transforms
from ultralytics import YOLO
from torchvision import models
import plotly.graph_objects as go
import plotly.express as px
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

# =========================================================
# CONFIGURATION
# =========================================================
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
FRAMES = 16
IMG_SIZE = 224

# Path to your trained model - UPDATE THIS PATH
MODEL_PATH = r"/home/krish-sharma/Desktop/cyber Security/CyberSafe/ALL MODELS/best_celebdf_model_Krish.pt"  # Make sure this file exists

# =========================================================
# MODEL DEFINITION (MUST MATCH TRAINING ARCHITECTURE)
# =========================================================
class CNN_BiLSTM(nn.Module):
    def __init__(self):
        super().__init__()
        backbone = models.efficientnet_b0(weights=None)
        self.cnn = backbone.features
        self.pool = nn.AdaptiveAvgPool2d(1)

        self.lstm = nn.LSTM(
            input_size=1280,
            hidden_size=256,
            num_layers=2,
            bidirectional=True,
            batch_first=True,
            dropout=0.3
        )

        self.classifier = nn.Sequential(
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(256, 2)
        )

    def forward(self, x):
        B, T, C, H, W = x.shape
        x = x.view(B*T, C, H, W)
        feats = self.cnn(x)
        feats = self.pool(feats).flatten(1)
        feats = feats.view(B, T, -1)
        lstm_out, _ = self.lstm(feats)
        return self.classifier(lstm_out[:, -1, :])


# =========================================================
# LOAD MODELS
# =========================================================
@st.cache_resource
def load_models():
    """Load YOLO face detector and trained deepfake detection model"""
    
    # Load face detection model - try different options
    face_model = None
    model_paths = [
        r"/home/krish-sharma/Desktop/cyber Security/CyberSafe/yolov8n-face.pt",  # Face-specific model
    ]
    
    for path in model_paths:
        try:
            if os.path.exists(path) or path in ["yolov8n.pt", "yolov8s.pt"]:
                face_model = YOLO(path)
                st.success(f"✅ Face detector loaded: {path}")
                break
        except Exception as e:
            continue
    
    if face_model is None:
        st.warning("⚠️ Using default YOLO model - face detection may be less accurate")
        face_model = YOLO("yolov8n.pt")
    
    # Load trained deepfake model
    model = CNN_BiLSTM().to(DEVICE)
    
    if os.path.exists(MODEL_PATH):
        try:
            model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
            st.success(f"✅ Deepfake model loaded on {DEVICE.upper()}")
        except Exception as e:
            st.error(f"❌ Error loading model: {e}")
            st.info("Please ensure the model file is not corrupted.")
    else:
        st.error(f"❌ Model not found at: {MODEL_PATH}")
        st.info("Please update the MODEL_PATH variable with the correct path to your trained model.")
        
    model.eval()
    
    return face_model, model


# =========================================================
# FACE DETECTION & EXTRACTION
# =========================================================
def extract_faces_from_frame(frame, face_model):
    """Extract largest face from a single frame using YOLO"""
    
    results = face_model(frame, verbose=False, conf=0.3)[0]  # Lowered confidence threshold
    
    if len(results.boxes) == 0:
        return None
    
    # Get largest face
    boxes = results.boxes.xyxy.cpu().numpy()
    areas = (boxes[:, 2] - boxes[:, 0]) * (boxes[:, 3] - boxes[:, 1])
    
    if len(areas) == 0:
        return None
        
    largest_idx = np.argmax(areas)
    x1, y1, x2, y2 = map(int, boxes[largest_idx])
    
    # Safe crop with padding
    h, w, _ = frame.shape
    padding = 20  # Add padding around face
    x1 = max(0, x1 - padding)
    y1 = max(0, y1 - padding)
    x2 = min(w, x2 + padding)
    y2 = min(h, y2 + padding)
    
    face_crop = frame[y1:y2, x1:x2]
    
    if face_crop.size == 0:
        return None
    
    return face_crop, (x1, y1, x2, y2)


def preprocess_face(face_crop):
    """Preprocess face for model input"""
    
    transform = transforms.Compose([
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    # Convert BGR to RGB
    face_rgb = cv2.cvtColor(face_crop, cv2.COLOR_BGR2RGB)
    pil_face = Image.fromarray(face_rgb)
    
    return transform(pil_face)


def process_video(video_path, face_model, progress_callback=None):
    """Process entire video and extract face tensors"""
    
    cap = cv2.VideoCapture(video_path)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    if total_frames < FRAMES:
        cap.release()
        return None, None
    
    # Uniformly sample FRAMES indices
    indices = np.linspace(0, total_frames - 1, FRAMES).astype(int)
    
    face_tensors = []
    face_boxes = []
    
    for i, idx in enumerate(indices):
        cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        ret, frame = cap.read()
        
        if not ret:
            continue
        
        # Extract face
        result = extract_faces_from_frame(frame, face_model)
        
        if result is not None:
            face_crop, box = result
            face_tensor = preprocess_face(face_crop)
            face_tensors.append(face_tensor)
            face_boxes.append(box)
        
        if progress_callback:
            progress_callback(i + 1, len(indices))
    
    cap.release()
    
    # Check if we have enough frames
    if len(face_tensors) < FRAMES // 2:  # At least 8 frames
        return None, None
    
    # Pad if necessary
    if len(face_tensors) < FRAMES:
        # Repeat last frame to fill
        while len(face_tensors) < FRAMES:
            face_tensors.append(face_tensors[-1])
    
    # Stack tensors: [FRAMES, 3, 224, 224]
    video_tensor = torch.stack(face_tensors[:FRAMES])
    
    return video_tensor, face_boxes


# =========================================================
# INFERENCE
# =========================================================
def predict(video_tensor, model):
    """Run inference on video tensor"""
    
    with torch.no_grad():
        # Add batch dimension: [1, FRAMES, 3, 224, 224]
        video_tensor = video_tensor.unsqueeze(0).to(DEVICE)
        
        with torch.amp.autocast('cuda' if DEVICE == 'cuda' else 'cpu'):
            outputs = model(video_tensor)
            probabilities = torch.softmax(outputs, dim=1)
            
    fake_prob = probabilities[0][1].item()
    real_prob = probabilities[0][0].item()
    prediction = 1 if fake_prob > 0.5 else 0
    
    return prediction, real_prob, fake_prob


# =========================================================
# VISUALIZATION FUNCTIONS
# =========================================================
def create_gauge_chart(real_prob, fake_prob):
    """Create a gauge chart for probability visualization"""
    
    fig = go.Figure(go.Indicator(
        mode="gauge+number+delta",
        value=fake_prob * 100,
        title={"text": "Fake Probability (%)"},
        delta={"reference": 50, "increasing": {"color": "red"}},
        gauge={
            "axis": {"range": [0, 100], "tickwidth": 1},
            "bar": {"color": "darkred" if fake_prob > 0.5 else "darkgreen"},
            "steps": [
                {"range": [0, 50], "color": "lightgreen"},
                {"range": [50, 100], "color": "lightcoral"}
            ],
            "threshold": {
                "line": {"color": "red", "width": 4},
                "thickness": 0.75,
                "value": 50
            }
        }
    ))
    
    fig.update_layout(height=300)
    return fig


def create_probability_bar(real_prob, fake_prob):
    """Create a bar chart for probability comparison"""
    
    fig = go.Figure(data=[
        go.Bar(name='Real', x=['Probability'], y=[real_prob * 100], 
               marker_color='green', text=f'{real_prob*100:.1f}%', textposition='auto'),
        go.Bar(name='Fake', x=['Probability'], y=[fake_prob * 100], 
               marker_color='red', text=f'{fake_prob*100:.1f}%', textposition='auto')
    ])
    
    fig.update_layout(
        title="Detection Confidence",
        yaxis_title="Confidence (%)",
        yaxis_range=[0, 100],
        height=400,
        showlegend=True
    )
    
    return fig


def create_confidence_meter(real_prob, fake_prob):
    """Create a confidence meter using plotly"""
    
    fig = go.Figure()
    
    fig.add_trace(go.Scatter(
        x=[0, 0.5, 1],
        y=[0, 0.5, 0],
        mode='lines',
        fill='tozeroy',
        fillcolor='rgba(0,255,0,0.2)',
        line=dict(color='green', width=2),
        name='Real Zone'
    ))
    
    fig.add_trace(go.Scatter(
        x=[0.5, 0.5, 1],
        y=[0.5, 0, 0],
        mode='lines',
        fill='tozeroy',
        fillcolor='rgba(255,0,0,0.2)',
        line=dict(color='red', width=2),
        name='Fake Zone'
    ))
    
    # Add indicator line
    fig.add_shape(
        type='line',
        x0=fake_prob, x1=fake_prob,
        y0=0, y1=0.5,
        line=dict(color='blue', width=4, dash='dash')
    )
    
    fig.add_annotation(
        x=fake_prob, y=0.55,
        text=f"Fake Score: {fake_prob*100:.1f}%",
        showarrow=True,
        arrowhead=2
    )
    
    fig.update_layout(
        title="Decision Boundary",
        xaxis_title="Fake Probability",
        yaxis_title="Confidence",
        xaxis_range=[0, 1],
        yaxis_range=[0, 0.6],
        height=300,
        showlegend=True
    )
    
    return fig


# =========================================================
# STREAMLIT UI
# =========================================================
st.set_page_config(
    page_title="Deepfake Detection System",
    page_icon="🎭",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
<style>
    .stButton > button {
        width: 100%;
        background-color: #4CAF50;
        color: white;
        font-size: 18px;
        padding: 10px;
    }
    .main-header {
        text-align: center;
        padding: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 10px;
        color: white;
        margin-bottom: 30px;
    }
    .result-card {
        border-radius: 10px;
        padding: 20px;
        text-align: center;
        margin: 10px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .real-card {
        background-color: #d4edda;
        border: 2px solid #28a745;
    }
    .fake-card {
        background-color: #f8d7da;
        border: 2px solid #dc3545;
    }
    .info-text {
        font-size: 14px;
        color: #666;
    }
</style>
""", unsafe_allow_html=True)

# Header
st.markdown("""
<div class="main-header">
    <h1>🎭 AI-Powered Deepfake Detection System</h1>
    <p>CNN-BiLSTM Architecture | Real-time Video Analysis</p>
</div>
""", unsafe_allow_html=True)

# Sidebar
with st.sidebar:
    st.markdown("## 📋 About")
    st.info("""
    This system uses a **CNN-BiLSTM** deep learning model to detect deepfake videos.
    
    **Model Details:**
    - Backbone: EfficientNet-B0
    - Sequence: BiLSTM (2 layers, 256 hidden)
    - Input: 16 frames per video
    - Training: Celeb-DF Dataset
    
    **How it works:**
    1. Extracts 16 frames from the video
    2. Detects faces using YOLOv8
    3. Processes through CNN-BiLSTM
    4. Outputs probability score
    """)
    
    st.markdown("---")
    st.markdown("### ⚙️ Settings")
    confidence_threshold = st.slider("Confidence Threshold", 0.5, 0.95, 0.5, 0.05)
    
    st.markdown("---")
    st.markdown("### 📊 Performance Metrics")
    st.metric("Model Accuracy", "99.70%")
    st.metric("AUC-ROC", "0.9994")
    st.metric("F1-Score", "0.997")

# Main content
col1, col2 = st.columns([2, 1])

with col1:
    st.markdown("## 📤 Upload Video")
    uploaded_file = st.file_uploader(
        "Choose a video file...",
        type=['mp4', 'avi', 'mov', 'mkv', 'webm'],
        help="Supported formats: MP4, AVI, MOV, MKV, WEBM"
    )

with col2:
    st.markdown("## 📝 Instructions")
    st.markdown("""
    1. Click 'Browse files' to upload a video
    2. Wait for processing (may take 10-30 seconds)
    3. View the detection results
    4. Check confidence scores
    
    **Note:** Videos should contain clear faces for accurate detection.
    """)

# Process uploaded video
if uploaded_file is not None:
    # Save uploaded file to temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as tmp_file:
        tmp_file.write(uploaded_file.read())
        video_path = tmp_file.name
    
    # Display video
    st.video(video_path)
    
    # Load models
    with st.spinner("🔄 Loading AI Models..."):
        face_model, deepfake_model = load_models()
    
    # Progress bar
    progress_bar = st.progress(0)
    status_text = st.empty()
    
    def update_progress(current, total):
        progress = current / total
        progress_bar.progress(progress)
        status_text.text(f"Processing frames: {current}/{total}")
    
    # Process video
    st.markdown("## 🔍 Analyzing Video...")
    
    try:
        with st.spinner("🎬 Extracting faces and analyzing frames..."):
            video_tensor, frame_metadata = process_video(
                video_path, face_model, update_progress
            )
        
        progress_bar.progress(100)
        status_text.text("✅ Processing complete!")
        
        if video_tensor is None:
            st.error("❌ Could not extract enough faces from the video. Please ensure the video contains clear faces and is at least 16 frames long.")
        else:
            # Run inference
            with st.spinner("🧠 Running deepfake detection..."):
                prediction, real_prob, fake_prob = predict(video_tensor, deepfake_model)
            
            # Display results
            st.markdown("## 📊 Detection Results")
            
            # Result cards
            col1, col2, col3 = st.columns(3)
            
            with col1:
                if prediction == 0:
                    st.markdown(f"""
                    <div class="result-card real-card">
                        <h2>✅ REAL</h2>
                        <p>The video appears to be AUTHENTIC</p>
                        <p style="font-size: 24px;">Confidence: {real_prob*100:.1f}%</p>
                    </div>
                    """, unsafe_allow_html=True)
                else:
                    st.markdown(f"""
                    <div class="result-card fake-card">
                        <h2>⚠️ FAKE</h2>
                        <p>The video appears to be MANIPULATED</p>
                        <p style="font-size: 24px;">Confidence: {fake_prob*100:.1f}%</p>
                    </div>
                    """, unsafe_allow_html=True)
            
            with col2:
                st.metric("Real Probability", f"{real_prob*100:.1f}%")
                st.metric("Fake Probability", f"{fake_prob*100:.1f}%")
            
            with col3:
                if fake_prob > confidence_threshold:
                    st.warning("⚠️ High confidence: FAKE detected!")
                elif real_prob > confidence_threshold:
                    st.success("✅ High confidence: REAL detected!")
                else:
                    st.info("ℹ️ Low confidence - results are uncertain")
            
            # Visualization section
            st.markdown("---")
            st.markdown("## 📈 Visualization")
            
            viz_col1, viz_col2 = st.columns(2)
            
            with viz_col1:
                # Gauge chart
                fig_gauge = create_gauge_chart(real_prob, fake_prob)
                st.plotly_chart(fig_gauge, use_container_width=True)
            
            with viz_col2:
                # Probability bar
                fig_bar = create_probability_bar(real_prob, fake_prob)
                st.plotly_chart(fig_bar, use_container_width=True)
            
            # Confidence meter
            fig_meter = create_confidence_meter(real_prob, fake_prob)
            st.plotly_chart(fig_meter, use_container_width=True)
            
            # Analysis summary
            st.markdown("## 📋 Analysis Summary")
            
            summary_col1, summary_col2 = st.columns(2)
            
            with summary_col1:
                st.markdown("**Video Information:**")
                st.markdown(f"- File name: `{uploaded_file.name}`")
                st.markdown(f"- File size: `{uploaded_file.size / 1024 / 1024:.2f} MB`")
                st.markdown(f"- Frames analyzed: `{FRAMES}`")
            
            with summary_col2:
                st.markdown("**Detection Details:**")
                st.markdown(f"- Model: `CNN-BiLSTM (EfficientNet-B0)`")
                st.markdown(f"- Face Detector: `YOLOv8`")
                st.markdown(f"- Device: `{DEVICE.upper()}`")
            
            # Confidence explanation
            st.markdown("---")
            st.markdown("### 💡 Understanding the Results")
            
            if prediction == 0:
                st.info("""
                **The video is classified as REAL**  
                The model detected consistent facial features and natural motion patterns 
                typical of authentic videos. The confidence score indicates the model's 
                certainty in this classification.
                """)
            else:
                st.warning("""
                **The video is classified as FAKE**  
                The model detected inconsistencies in facial features, unnatural motion 
                patterns, or other artifacts commonly found in deepfake videos. The 
                confidence score indicates the model's certainty in this classification.
                """)
            
    except Exception as e:
        st.error(f"❌ An error occurred during processing: {str(e)}")
        st.exception(e)
    
    finally:
        # Clean up temporary file
        try:
            os.unlink(video_path)
        except:
            pass

else:
    # Display placeholder when no video is uploaded
    st.markdown("""
    <div style="text-align: center; padding: 50px; background-color: #f0f2f6; border-radius: 10px;">
        <h3>🎬 Ready to Detect Deepfakes</h3>
        <p>Upload a video file using the button above to begin analysis</p>
        <p class="info-text">Supported formats: MP4, AVI, MOV, MKV, WEBM</p>
    </div>
    """, unsafe_allow_html=True)
    
    # Sample metrics
    st.markdown("## 📊 Model Performance on Test Set")
    
    metrics_col1, metrics_col2, metrics_col3, metrics_col4 = st.columns(4)
    
    with metrics_col1:
        st.metric("Accuracy", "99.70%", "Excellent")
    with metrics_col2:
        st.metric("Precision", "99.40%", "Excellent")
    with metrics_col3:
        st.metric("Recall", "100.00%", "Perfect")
    with metrics_col4:
        st.metric("F1-Score", "99.70%", "Excellent")
    
    st.markdown("---")
    st.markdown("### 🧠 Model Architecture")
    
    arch_col1, arch_col2 = st.columns(2)
    
    with arch_col1:
        st.markdown("""
        **CNN Backbone:** EfficientNet-B0
        - 16 frames per video
        - 224x224 input resolution
        - ImageNet normalization
        
        **Feature Extraction:**
        - AdaptiveAvgPool2d(1)
        - 1280 feature dimensions
        """)
    
    with arch_col2:
        st.markdown("""
        **BiLSTM Layer:**
        - 2 layers
        - 256 hidden units
        - Bidirectional (512 output)
        - Dropout: 0.3
        
        **Classifier:**
        - Linear(512 → 256) + ReLU
        - Dropout(0.5)
        - Linear(256 → 2)
        """)

# Footer
st.markdown("---")
st.markdown("""
<div style="text-align: center; color: #666; padding: 20px;">
    <p>🔬 Deepfake Detection System | CNN-BiLSTM Architecture | Trained on Celeb-DF Dataset</p>
    <p class="info-text">For research and educational purposes only. Results should be interpreted with caution.</p>
</div>
""", unsafe_allow_html=True)