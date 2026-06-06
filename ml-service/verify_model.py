"""Standalone smoke-test for the intent-classification model.
Loads chatbot_model.h5 + words.pkl + classes.pkl and runs a few predictions.
Does NOT need MongoDB or any API key. Run with the venv python."""
import pickle
import numpy as np
import nltk
import tensorflow as tf
from nltk.stem import WordNetLemmatizer

for pkg in ("punkt", "punkt_tab", "wordnet"):
    try:
        nltk.download(pkg, quiet=True)
    except Exception:
        pass

model = tf.keras.models.load_model("chatbot_model.h5")
words = pickle.load(open("words.pkl", "rb"))
classes = pickle.load(open("classes.pkl", "rb"))
lemmatizer = WordNetLemmatizer()
ignore = ["?", "!", ".", ",", ";", ":"]

print("Model loaded OK")
print("Input shape :", model.input_shape, "| vocab:", len(words))
print("Output shape:", model.output_shape, "| classes:", classes)
print("Params      :", model.count_params())
print("-" * 50)

def predict(sentence):
    toks = [lemmatizer.lemmatize(w) for w in nltk.word_tokenize(sentence.lower()) if w not in ignore]
    bag = np.array([[1 if w in toks else 0 for w in words]])
    p = model.predict(bag, verbose=0)[0]
    i = int(np.argmax(p))
    label = classes[i] if p[i] >= 0.5 else "diagnosis (low-conf default)"
    return label, float(p[i])

for s in [
    "I have a headache and fever since two days",
    "I want to book an appointment with a doctor",
    "I need to schedule a blood test / MRI scan",
    "my stomach hurts and I feel sick",
]:
    label, conf = predict(s)
    print(f"{s!r:55s} -> {label:32s} ({conf:.2f})")

print("-" * 50)
print("MODEL SMOKE TEST PASSED")
