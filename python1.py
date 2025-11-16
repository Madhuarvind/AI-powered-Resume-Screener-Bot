# Face Recognition using CNNs with Backpropagation
# Developer: Madhuaravind P

import cv2
import numpy as np
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense
from tensorflow.keras.utils import to_categorical
from sklearn.model_selection import train_test_split

# Step 1: Load Haar Cascade for face detection
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Step 2: Create Dummy Dataset (simulate 5 people, 20 samples each)
X_data, y_data = [], []
for i in range(5):
    for j in range(20):
        img = np.random.randint(0, 255, (100, 100), dtype='uint8')
        X_data.append(img)
        y_data.append(i)

X_data = np.array(X_data).reshape(-1, 100, 100, 1) / 255.0
y_data = to_categorical(y_data, num_classes=5)

# Step 3: Split Dataset
X_train, X_test, y_train, y_test = train_test_split(X_data, y_data, test_size=0.2, random_state=42)

# Step 4: Build CNN Model
model = Sequential([
    Conv2D(32, (3,3), activation='relu', input_shape=(100,100,1)),
    MaxPooling2D((2,2)),
    Conv2D(64, (3,3), activation='relu'),
    MaxPooling2D((2,2)),
    Flatten(),
    Dense(128, activation='relu'),
    Dense(5, activation='softmax')
])

# Step 5: Compile Model (Backpropagation occurs during training)
model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

# Step 6: Train the Model
print("Training CNN model using backpropagation... (on dummy data)")
model.fit(X_train, y_train, epochs=3, batch_size=8, verbose=1)

# Step 7: Evaluate Model
loss, acc = model.evaluate(X_test, y_test, verbose=0)
print(f"Model Accuracy: {acc*100:.2f}%")

# Step 8: Real-Time Face Detection & Recognition
print("\nStarting real-time face recognition... Press 'q' to quit.")
cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)

    for (x, y, w, h) in faces:
        face = gray[y:y+h, x:x+w]
        face = cv2.resize(face, (100, 100))
        face = face.reshape(1, 100, 100, 1) / 255.0

        pred = model.predict(face, verbose=0)
        label = np.argmax(pred)
        confidence = np.max(pred)

        text = f"Person {label} ({confidence*100:.1f}%)"
        cv2.putText(frame, text, (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0,255,0), 2)
        cv2.rectangle(frame, (x, y), (x+w, y+h), (255, 0, 0), 2)

    cv2.imshow("Face Recognition (CNN)", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
