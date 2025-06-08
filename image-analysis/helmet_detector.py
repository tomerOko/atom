import cv2
import numpy as np
from ultralytics import YOLO
from typing import List, Dict, Tuple
import logging
import requests
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class HelmetDetector:
    def __init__(self, model_path: str = None, confidence_threshold: float = 0.5, iou_threshold: float = 0.4):
        """
        Initialize the helmet detector with specialized helmet detection model
        """
        self.confidence_threshold = confidence_threshold
        self.iou_threshold = iou_threshold
        
        # Use specialized helmet detection model
        self.helmet_model_path = './models/helmet_detection.pt'
        self.person_model_path = model_path or './models/yolov8n.pt'
        
        # Load models
        try:
            # Download and load specialized helmet detection model if needed
            self.setup_helmet_model()
            self.helmet_model = YOLO(self.helmet_model_path)
            logger.info(f"Successfully loaded helmet detection model from {self.helmet_model_path}")
            
            # Load person detection model
            self.person_model = YOLO(self.person_model_path)
            logger.info(f"Successfully loaded person detection model from {self.person_model_path}")
            
        except Exception as e:
            logger.error(f"Failed to load models: {e}")
            raise

    def setup_helmet_model(self):
        """
        Download specialized helmet detection model if it doesn't exist
        """
        if not os.path.exists(self.helmet_model_path):
            logger.info("Downloading specialized helmet detection model...")
            try:
                # First try: Download a specialized PPE detection model with actual helmet classes
                model_url = "https://github.com/snehilsanyal/Construction-Site-Safety-PPE-Detection/raw/main/models/best.pt"
                logger.info("Downloading specialized PPE detection model from GitHub...")
                
                response = requests.get(model_url, stream=True)
                if response.status_code == 200:
                    with open(self.helmet_model_path, 'wb') as f:
                        for chunk in response.iter_content(chunk_size=8192):
                            f.write(chunk)
                    logger.info("Specialized PPE detection model downloaded successfully!")
                    return
                else:
                    raise Exception(f"Failed to download PPE model, status code: {response.status_code}")
                    
            except Exception as e:
                logger.warning(f"Failed to download specialized PPE model: {e}")
                
                # Second try: Try alternative helmet detection model
                try:
                    model_url = "https://github.com/ftnabil97/Construction-Site-Safety-Gears-Detection-Model-Yolov8/raw/main/models/best.pt"
                    logger.info("Downloading alternative construction safety model...")
                    
                    response = requests.get(model_url, stream=True)
                    if response.status_code == 200:
                        with open(self.helmet_model_path, 'wb') as f:
                            for chunk in response.iter_content(chunk_size=8192):
                                f.write(chunk)
                        logger.info("Alternative safety detection model downloaded successfully!")
                        return
                    else:
                        raise Exception(f"Failed to download alternative model, status code: {response.status_code}")
                        
                except Exception as e:
                    logger.warning(f"Failed to download alternative model: {e}")
                    
                    # Third try: Use Roboflow Universe helmet detection model
                    try:
                        from roboflow import Roboflow
                        
                        # Initialize Roboflow (using public model, no API key needed for this)
                        rf = Roboflow()
                        project = rf.workspace("roboflow-universe-projects").project("hard-hat-sample-dataset")
                        model = project.version(2).model
                        
                        # Download the model
                        model.download("yolov8", location="./models/")
                        
                        # The downloaded model should be in the correct location
                        if os.path.exists("./models/weights/best.pt"):
                            os.rename("./models/weights/best.pt", self.helmet_model_path)
                            logger.info("Roboflow helmet detection model downloaded successfully")
                            return
                        else:
                            raise Exception("Failed to download Roboflow helmet model")
                            
                    except ImportError:
                        logger.warning("Roboflow not available, using alternative helmet detection approach")
                    except Exception as e:
                        logger.warning(f"Failed to download Roboflow model: {e}")
                    
                    # Final fallback: Use alternative helmet detection approach
                    self.setup_alternative_helmet_model()

    def setup_alternative_helmet_model(self):
        """
        Setup alternative helmet detection using YOLOv8 with custom training
        """
        try:
            # Use a different pre-trained model that includes safety equipment
            # YOLOv8 can detect some safety equipment when fine-tuned
            logger.info("Setting up alternative helmet detection model...")
            
            # Download a model specifically trained for construction safety
            # This is a publicly available model for helmet detection
            model_url = "https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8n-seg.pt"
            
            if not os.path.exists(self.helmet_model_path):
                # For now, we'll use the segmentation model and apply helmet logic
                # In production, you'd want to use a proper helmet-trained model
                self.helmet_model_path = './models/yolov8n-seg.pt'
                
                # Download YOLOv8 segmentation model
                response = requests.get(model_url)
                with open(self.helmet_model_path, 'wb') as f:
                    f.write(response.content)
                    
                logger.info("Alternative model downloaded successfully")
                
        except Exception as e:
            logger.warning(f"Failed to setup alternative model: {e}")
            # Fallback to using the person model for both tasks
            self.helmet_model_path = self.person_model_path

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

    def detect_people(self, image: np.ndarray) -> List[Dict]:
        """
        Detect people using the person detection model
        """
        results = self.person_model(image, conf=self.confidence_threshold, iou=self.iou_threshold)
        
        people = []
        for result in results:
            boxes = result.boxes
            if boxes is not None:
                for i, box in enumerate(boxes):
                    class_id = int(box.cls[0].cpu().numpy())
                    class_name = self.person_model.names[class_id]
                    
                    # Only keep person detections
                    if class_name == 'person':
                        x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                        confidence = box.conf[0].cpu().numpy()
                        
                        people.append({
                            'bbox': [int(x1), int(y1), int(x2), int(y2)],
                            'confidence': float(confidence),
                            'class_id': class_id,
                            'class_name': class_name
                        })
        
        return people

    def detect_helmets_with_color_analysis(self, image: np.ndarray, people: List[Dict]) -> List[Dict]:
        """
        Detect helmets using color analysis and shape detection in head regions
        """
        helmets = []
        
        for person in people:
            x1, y1, x2, y2 = person['bbox']
            
            # Extract head region (top 25% of person bounding box)
            head_height = int((y2 - y1) * 0.25)
            head_region = image[y1:y1 + head_height, x1:x2]
            
            if head_region.size == 0:
                continue
                
            # Convert to HSV for better color analysis
            head_hsv = cv2.cvtColor(head_region, cv2.COLOR_RGB2HSV)
            
            # Define color ranges for common helmet colors
            helmet_colors = [
                # Yellow/Orange helmets
                ([15, 100, 100], [35, 255, 255]),
                # White helmets
                ([0, 0, 200], [180, 30, 255]),
                # Blue helmets
                ([100, 100, 100], [130, 255, 255]),
                # Red helmets
                ([0, 100, 100], [10, 255, 255]),
                ([170, 100, 100], [180, 255, 255])
            ]
            
            helmet_detected = False
            best_confidence = 0.0
            
            for lower, upper in helmet_colors:
                lower = np.array(lower)
                upper = np.array(upper)
                
                # Create mask for helmet color
                mask = cv2.inRange(head_hsv, lower, upper)
                
                # Calculate percentage of helmet-colored pixels
                helmet_pixels = cv2.countNonZero(mask)
                total_pixels = head_region.shape[0] * head_region.shape[1]
                helmet_ratio = helmet_pixels / total_pixels if total_pixels > 0 else 0
                
                # If significant helmet color detected
                if helmet_ratio > 0.15:  # At least 15% of head region is helmet-colored
                    # Additional shape analysis
                    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                    
                    for contour in contours:
                        area = cv2.contourArea(contour)
                        if area > 100:  # Minimum helmet area
                            # Calculate confidence based on area ratio and shape
                            confidence = min(0.95, helmet_ratio * 2 + area / (total_pixels * 0.5))
                            
                            if confidence > best_confidence:
                                best_confidence = confidence
                                helmet_detected = True
            
            if helmet_detected:
                # Create helmet detection for the head region
                helmet_x1 = x1
                helmet_y1 = y1
                helmet_x2 = x2
                helmet_y2 = y1 + head_height
                
                helmets.append({
                    'bbox': [helmet_x1, helmet_y1, helmet_x2, helmet_y2],
                    'confidence': best_confidence,
                    'class_id': 999,  # Custom helmet class
                    'class_name': 'helmet',
                    'detection_method': 'color_analysis'
                })
        
        return helmets

    def detect_helmets_yolo(self, image: np.ndarray) -> List[Dict]:
        """
        Detect helmets using specialized PPE detection YOLO model
        """
        try:
            results = self.helmet_model(image, conf=self.confidence_threshold, iou=self.iou_threshold)
            
            helmets = []
            people_with_helmets = []
            people_without_helmets = []
            
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
                            'class_name': class_name,
                            'detection_method': 'specialized_ppe_model'
                        }
                        
                        # Categorize detections based on PPE classes
                        if class_name == 'Hardhat':
                            # Person wearing a helmet
                            detection['helmet_status'] = 'wearing_helmet'
                            people_with_helmets.append(detection)
                        elif class_name == 'NO-Hardhat':
                            # Person NOT wearing a helmet
                            detection['helmet_status'] = 'no_helmet'
                            people_without_helmets.append(detection)
                        elif class_name in ['Mask', 'Safety Vest']:
                            # Other safety equipment (can help with helmet inference)
                            detection['helmet_status'] = 'safety_equipment'
                            helmets.append(detection)
                        elif class_name in ['NO-Mask', 'NO-Safety Vest']:
                            # Person missing other safety equipment
                            detection['helmet_status'] = 'missing_safety_equipment'
                            helmets.append(detection)
                        elif class_name == 'Person':
                            # General person detection (status unknown)
                            detection['helmet_status'] = 'unknown'
                            helmets.append(detection)
                        else:
                            # Other objects (machinery, vehicles, safety cones)
                            helmets.append(detection)
            
            # Combine all relevant detections
            all_detections = people_with_helmets + people_without_helmets + helmets
            
            logger.info(f"PPE Detection Results: {len(people_with_helmets)} with helmets, {len(people_without_helmets)} without helmets, {len(helmets)} other detections")
            
            return all_detections
            
        except Exception as e:
            logger.warning(f"Specialized PPE detection failed: {e}")
            return []

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

    def analyze_helmet_compliance_with_ppe(self, all_detections: List[Dict]) -> List[Dict]:
        """
        Analyze helmet compliance using specialized PPE detection results
        """
        results = []
        
        # Separate detections by type
        people_with_helmets = [d for d in all_detections if d.get('helmet_status') == 'wearing_helmet']
        people_without_helmets = [d for d in all_detections if d.get('helmet_status') == 'no_helmet']
        general_people = [d for d in all_detections if d.get('helmet_status') == 'unknown']
        
        # Process people with helmets
        for person in people_with_helmets:
            x1, y1, x2, y2 = person['bbox']
            width = x2 - x1
            height = y2 - y1
            
            result = {
                'bbox': [x1, y1, width, height],
                'confidence': person['confidence'],
                'has_helmet': True,
                'helmet_confidence': person['confidence'],
                'status': 'wearing_helmet',
                'detection_method': 'specialized_ppe_model'
            }
            results.append(result)
        
        # Process people without helmets
        for person in people_without_helmets:
            x1, y1, x2, y2 = person['bbox']
            width = x2 - x1
            height = y2 - y1
            
            result = {
                'bbox': [x1, y1, width, height],
                'confidence': person['confidence'],
                'has_helmet': False,
                'helmet_confidence': 0.0,
                'status': 'no_helmet',
                'detection_method': 'specialized_ppe_model'
            }
            results.append(result)
        
        # Process general people (try to infer helmet status from context)
        for person in general_people:
            x1, y1, x2, y2 = person['bbox']
            width = x2 - x1
            height = y2 - y1
            
            # For general people, we can't determine helmet status reliably
            # Default to no helmet detected
            result = {
                'bbox': [x1, y1, width, height],
                'confidence': person['confidence'],
                'has_helmet': False,
                'helmet_confidence': 0.0,
                'status': 'helmet_status_unknown',
                'detection_method': 'general_person_detection'
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
                label = f"Person + Helmet ({result['helmet_confidence']:.2f})"
                if result.get('detection_method'):
                    label += f" [{result['detection_method']}]"
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
        Main processing pipeline for helmet detection using specialized PPE model
        """
        try:
            # Load and preprocess image
            image = self.preprocess_image(image_path)
            
            # First, try using the specialized PPE detection model
            helmets_ppe = self.detect_helmets_yolo(image)
            
            if helmets_ppe:
                # We have results from the specialized PPE model
                logger.info(f"Using specialized PPE detection with {len(helmets_ppe)} detections")
                analysis_results = self.analyze_helmet_compliance_with_ppe(helmets_ppe)
                detection_method = 'specialized_ppe_model'
            else:
                # Fallback to traditional person detection + color analysis
                logger.info("Falling back to person detection + color analysis")
                people = self.detect_people(image)
                helmets_color = self.detect_helmets_with_color_analysis(image, people)
                analysis_results = self.analyze_helmet_compliance(people, helmets_color)
                detection_method = 'color_analysis_fallback'
            
            logger.info(f"Analyzed {len(analysis_results)} people for helmet compliance using {detection_method}")
            
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
                'helmet_detection_method': detection_method,
                'all_detections': {
                    'ppe_detections': helmets_ppe if helmets_ppe else [],
                    'analysis_results': analysis_results
                }
            }
            
            logger.info(f"Processing complete: {people_with_helmets}/{total_people} people wearing helmets (method: {detection_method})")
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
    
    def analyze_helmet_compliance(self, people: List[Dict], helmets: List[Dict]) -> List[Dict]:
        """
        Analyze which people are wearing helmets properly (fallback method)
        """
        results = []
        
        for person in people:
            # Convert bbox from [x1, y1, x2, y2] to [x, y, width, height] format
            x1, y1, x2, y2 = person['bbox']
            width = x2 - x1
            height = y2 - y1
            
            person_result = {
                'bbox': [x1, y1, width, height],
                'confidence': person['confidence'],
                'has_helmet': False,
                'helmet_confidence': 0.0,
                'status': 'no_helmet',
                'detection_method': 'color_analysis'
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
                person_result['detection_method'] = best_helmet.get('detection_method', 'color_analysis')
            
            results.append(person_result)
        
        return results 