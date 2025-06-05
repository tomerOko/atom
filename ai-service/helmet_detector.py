import cv2
import numpy as np
from ultralytics import YOLO
from typing import List, Dict, Tuple
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class HelmetDetector:
    def __init__(self, model_path: str, confidence_threshold: float = 0.5, iou_threshold: float = 0.4):
        """
        Initialize the helmet detector with YOLO model
        """
        self.model_path = model_path
        self.confidence_threshold = confidence_threshold
        self.iou_threshold = iou_threshold
        
        # Load YOLO model
        try:
            self.model = YOLO(model_path)
            logger.info(f"Successfully loaded YOLO model from {model_path}")
        except Exception as e:
            logger.error(f"Failed to load YOLO model: {e}")
            raise

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

    def detect_objects(self, image: np.ndarray) -> List[Dict]:
        """
        Detect objects using YOLO model
        """
        results = self.model(image, conf=self.confidence_threshold, iou=self.iou_threshold)
        
        detections = []
        for result in results:
            boxes = result.boxes
            if boxes is not None:
                for i, box in enumerate(boxes):
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    confidence = box.conf[0].cpu().numpy()
                    class_id = int(box.cls[0].cpu().numpy())
                    class_name = self.model.names[class_id]
                    
                    detections.append({
                        'bbox': [int(x1), int(y1), int(x2), int(y2)],
                        'confidence': float(confidence),
                        'class_id': class_id,
                        'class_name': class_name
                    })
        
        return detections

    def calculate_iou(self, box1: List[int], box2: List[int]) -> float:
        """
        Calculate Intersection over Union (IoU) of two bounding boxes
        """
        x1, y1, x2, y2 = box1
        x3, y3, x4, y4 = box2
        
        # Calculate intersection area
        xi1 = max(x1, x3)
        yi1 = max(y1, y3)
        xi2 = min(x2, x4)
        yi2 = min(y2, y4)
        
        if xi2 <= xi1 or yi2 <= yi1:
            return 0.0
        
        intersection = (xi2 - xi1) * (yi2 - yi1)
        
        # Calculate union area
        area1 = (x2 - x1) * (y2 - y1)
        area2 = (x4 - x3) * (y4 - y3)
        union = area1 + area2 - intersection
        
        return intersection / union if union > 0 else 0.0

    def is_helmet_on_person(self, person_box: List[int], helmet_box: List[int]) -> bool:
        """
        Check if helmet is positioned on person's head area
        """
        person_x1, person_y1, person_x2, person_y2 = person_box
        helmet_x1, helmet_y1, helmet_x2, helmet_y2 = helmet_box
        
        # Define head area as upper 30% of person box
        head_area_height = (person_y2 - person_y1) * 0.3
        head_y2 = person_y1 + head_area_height
        head_box = [person_x1, person_y1, person_x2, head_y2]
        
        # Check if helmet overlaps with head area
        iou = self.calculate_iou(helmet_box, head_box)
        return iou > 0.1  # Threshold for helmet-head overlap

    def analyze_helmet_compliance(self, detections: List[Dict]) -> List[Dict]:
        """
        Analyze which people are wearing helmets properly
        """
        people = [d for d in detections if d['class_name'] == 'person']
        helmets = [d for d in detections if 'helmet' in d['class_name'].lower()]
        
        results = []
        
        for person in people:
            person_result = {
                'bbox': person['bbox'],
                'confidence': person['confidence'],
                'has_helmet': False,
                'helmet_confidence': 0.0,
                'status': 'no_helmet'
            }
            
            # Find the best matching helmet for this person
            best_helmet = None
            best_score = 0.0
            
            for helmet in helmets:
                if self.is_helmet_on_person(person['bbox'], helmet['bbox']):
                    # Score based on IoU and helmet confidence
                    iou = self.calculate_iou(person['bbox'], helmet['bbox'])
                    score = iou * helmet['confidence']
                    
                    if score > best_score:
                        best_score = score
                        best_helmet = helmet
            
            if best_helmet:
                person_result['has_helmet'] = True
                person_result['helmet_confidence'] = best_helmet['confidence']
                person_result['status'] = 'wearing_helmet'
            
            results.append(person_result)
        
        return results

    def draw_annotations(self, image_path: str, analysis_results: List[Dict], output_path: str) -> None:
        """
        Draw bounding boxes and annotations on the image
        """
        image = cv2.imread(image_path)
        
        for result in analysis_results:
            x1, y1, x2, y2 = result['bbox']
            
            # Choose color based on helmet status
            if result['has_helmet']:
                color = (0, 255, 0)  # Green for wearing helmet
                label = f"Person + Helmet ({result['helmet_confidence']:.2f})"
            else:
                color = (0, 0, 255)  # Red for no helmet
                label = "Person - No Helmet"
            
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
        Main processing pipeline for helmet detection
        """
        try:
            # Load and preprocess image
            image = self.preprocess_image(image_path)
            
            # Detect objects
            detections = self.detect_objects(image)
            logger.info(f"Detected {len(detections)} objects")
            
            # Analyze helmet compliance
            analysis_results = self.analyze_helmet_compliance(detections)
            logger.info(f"Analyzed {len(analysis_results)} people")
            
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
                'detections': analysis_results,
                'all_detections': detections
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