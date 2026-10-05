import sys
import cv2

face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)
if face_cascade.empty():
    raise RuntimeError("Could not load Haar cascade file")


def find_faces(image):
    """Return a list of (x, y, w, h) boxes for faces in a BGR image."""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    return face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(50, 50),
    )


def draw_faces(image, faces):
    """Draw a green box around each face."""
    for (x, y, w, h) in faces:
        cv2.rectangle(image, (x, y), (x + w, y + h), (0, 255, 0), 2)
    cv2.putText(
        image, f"Faces: {len(faces)}", (10, 30),
        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2
    )
    return image


def detect_face(image_path):
    """Detect faces in an image file and return the result as a dictionary."""
    image = cv2.imread(image_path)

    if image is None:
        return {"success": False, "message": "Unable to read image"}

    faces = find_faces(image)

    if len(faces) == 0:
        return {"success": False, "message": "No face detected"}

    return {
        "success": True,
        "face_count": len(faces),
        "faces": [
            {"x": int(x), "y": int(y), "width": int(w), "height": int(h)}
            for (x, y, w, h) in faces
        ],
    }


def show_faces(image_path, save_path=None):
    """Show the image with boxes drawn. Optionally save the result."""
    image = cv2.imread(image_path)
    if image is None:
        print("Unable to read image")
        return

    faces = find_faces(image)
    output = draw_faces(image, faces)

    if save_path:
        cv2.imwrite(save_path, output)

    cv2.imshow("Faces", output)
    cv2.waitKey(0)
    cv2.destroyAllWindows()


def webcam_detection():
    """Live face detection from the webcam. Press q to quit."""
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Could not open webcam")
        return

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        faces = find_faces(frame)
        cv2.imshow("Webcam Face Detection", draw_faces(frame, faces))

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    if len(sys.argv) > 1:
        # python face_detection.py photo.jpg
        print(detect_face(sys.argv[1]))
        show_faces(sys.argv[1])
    else:
        # python face_detection.py   (no argument = webcam)
        webcam_detection()