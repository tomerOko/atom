import cv2
import numpy as np
from ultralytics import YOLO
from typing import List, Dict
import logging
import requests
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class HelmetDetector:
    def __init__(self, model_path: str = None, confidence_threshold: float = 0.25, iou_threshold: float = 0.4):
        """
        Initialize the helmet detector with specialized PPE detection model only
        """
        self.confidence_threshold = confidence_threshold
        self.iou_threshold = iou_threshold
        
        # Use only specialized helmet detection model
        self.helmet_model_path = './models/helmet_detection.pt'
        
        # Load specialized PPE model
        try:
            self.setup_helmet_model()
            self.helmet_model = YOLO(self.helmet_model_path)
            logger.info(f"Successfully loaded specialized PPE model from {self.helmet_model_path}")
            logger.info(f"Using confidence threshold: {self.confidence_threshold}, IOU threshold: {self.iou_threshold}")
            
        except Exception as e:
            logger.error(f"Failed to load specialized PPE model: {e}")
            raise

    def setup_helmet_model(self):
        """
        Download specialized helmet detection model if it doesn't exist
        """
        if not os.path.exists(self.helmet_model_path):
            logger.info("Downloading specialized helmet detection model...")
            try:
                # Download specialized PPE detection model
                model_url = "https://github.com/snehilsanyal/Construction-Site-Safety-PPE-Detection/raw/main/models/best.pt"
                logger.info("Downloading specialized PPE detection model from GitHub...")
                
                response = requests.get(model_url, stream=True)
                if response.status_code == 200:
                    with open(self.helmet_model_path, 'wb') as f:
                        for chunk in response.iter_content(chunk_size=8192):
                            f.write(chunk)
                    logger.info("Specialized PPE detection model downloaded successfully!")
                else:
                    raise Exception(f"Failed to download PPE model, status code: {response.status_code}")
                    
            except Exception as e:
                logger.error(f"Failed to download specialized PPE model: {e}")
                raise Exception("Could not download required PPE detection model")

    def preprocess_image(self, image_path: str) -> np.ndarray:
        """
        Preprocess the image for detection
        """
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Could not load image from {image_path}")
        
        # Convert BGR to RGB for YOLO
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        return image_rgb

    def detect_with_ppe_model(self, image: np.ndarray) -> List[Dict]:
        """
        Detect people and helmets using specialized PPE model
        """
        try:
            results = self.helmet_model(image, conf=self.confidence_threshold, iou=self.iou_threshold)
            
            people_with_helmets = []
            people_without_helmets = []
            other_detections = []
            all_raw_detections = []
            
            for result in results:
                boxes = result.boxes
                if boxes is not None:
                    for i, box in enumerate(boxes):
                        class_id = int(box.cls[0].cpu().numpy())
                        class_name = self.helmet_model.names[class_id]
                        x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                        confidence = box.conf[0].cpu().numpy()
                        
                        detection = {
                            'bbox': [int(x1), int(y1), int(x2), int(y2)],
                            'confidence': float(confidence),
                            'class_id': class_id,
                            'class_name': class_name
                        }
                        
                        all_raw_detections.append(detection)
                        
                        # Categorize detections
                        if class_name == 'Hardhat':
                            detection['helmet_status'] = 'wearing_helmet'
                            people_with_helmets.append(detection)
                        elif class_name == 'NO-Hardhat':
                            detection['helmet_status'] = 'no_helmet'
                            people_without_helmets.append(detection)
                        else:
                            # Other safety equipment or objects
                            detection['helmet_status'] = 'other'
                            other_detections.append(detection)
            
            # Debug logging
            logger.info(f"Raw detections found: {len(all_raw_detections)}")
            for det in all_raw_detections:
                logger.info(f"  - {det['class_name']}: confidence={det['confidence']:.3f}")
            
            all_detections = people_with_helmets + people_without_helmets
            logger.info(f"PPE Detection Results: {len(people_with_helmets)} with helmets, {len(people_without_helmets)} without helmets, {len(other_detections)} other objects")
            
            return all_detections
            
        except Exception as e:
            logger.error(f"PPE detection failed: {e}")
            raise

    def analyze_helmet_compliance(self, detections: List[Dict]) -> List[Dict]:
        """
        Analyze helmet compliance using PPE detection results
        """
        results = []
        
        for detection in detections:
            x1, y1, x2, y2 = detection['bbox']
            width = x2 - x1
            height = y2 - y1
            
            # Determine helmet status
            has_helmet = detection['helmet_status'] == 'wearing_helmet'
            
            result = {
                'bbox': [x1, y1, width, height],
                'confidence': detection['confidence'],
                'has_helmet': has_helmet,
                'helmet_confidence': detection['confidence'] if has_helmet else 0.0,
                'status': detection['helmet_status'],
                'detection_method': 'specialized_ppe_model'
            }
            results.append(result)
        
        return results

    def draw_annotations(self, image_path: str, analysis_results: List[Dict], output_path: str) -> None:
        """
        Draw bounding boxes and annotations on the image
        """
        image = cv2.imread(image_path)
        
        for result in analysis_results:
            # Convert bbox from [x, y, width, height] to [x1, y1, x2, y2] for drawing
            x, y, width, height = result['bbox']
            x1, y1, x2, y2 = x, y, x + width, y + height
            
            # Choose color based on helmet status
            if result['has_helmet']:
                color = (0, 255, 0)  # Green for wearing helmet
                label = f"Helmet ({result['helmet_confidence']:.2f})"
            else:
                color = (0, 0, 255)  # Red for no helmet
                label = "No Helmet"
            
            # Draw bounding box
            cv2.rectangle(image, (x1, y1), (x2, y2), color, 3)
            
            # Draw label
            font = cv2.FONT_HERSHEY_SIMPLEX
            font_scale = 0.7
            thickness = 2
            (text_width, text_height), baseline = cv2.getTextSize(label, font, font_scale, thickness)
            
            # Draw background for text
            cv2.rectangle(image, (x1, y1 - text_height - baseline - 10), 
                         (x1 + text_width, y1), color, -1)
            
            # Draw text
            cv2.putText(image, label, (x1, y1 - baseline - 5), 
                       font, font_scale, (255, 255, 255), thickness)
        
        # Save annotated image
        cv2.imwrite(output_path, image)
        logger.info(f"Annotated image saved to {output_path}")

    def process_image(self, image_path: str, output_path: str) -> Dict:
        """
        Main processing pipeline using only specialized PPE model
        """
        try:
            # Load and preprocess image
            image = self.preprocess_image(image_path)
            
            # Use specialized PPE detection model
            detections = self.detect_with_ppe_model(image)
            
            # Analyze helmet compliance
            analysis_results = self.analyze_helmet_compliance(detections)
            
            logger.info(f"Analyzed {len(analysis_results)} people for helmet compliance")
            
            # Draw annotations
            self.draw_annotations(image_path, analysis_results, output_path)
            
            # Compile results
            total_people = len(analysis_results)
            people_with_helmets = sum(1 for r in analysis_results if r['has_helmet'])
            
            processing_result = {
                'success': True,
                'total_people': total_people,
                'people_with_helmets': people_with_helmets,
                'compliance_rate': people_with_helmets / total_people if total_people > 0 else 0,
                'detections': analysis_results
            }
            
            logger.info(f"Processing complete: {people_with_helmets}/{total_people} people wearing helmets")
            return processing_result
            
        except Exception as e:
            logger.error(f"Error processing image: {e}")
            return {
                'success': False,
                'error': str(e),
                'total_people': 0,
                'people_with_helmets': 0,
                'compliance_rate': 0,
                'detections': []
            } 