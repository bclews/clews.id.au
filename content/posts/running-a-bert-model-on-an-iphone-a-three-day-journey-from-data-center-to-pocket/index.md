+++
title = 'Running a Bert Model on an iPhone'
date = 2025-03-03T14:44:48+11:00
draft = false
description = "Deploy a BERT-large text classification model on iPhone using Core ML. Journey through ONNX conversion, model distillation, and mobile optimisation to bring NLP from data center to pocket."
categories = ['Tutorials']
tags = ['machine-learning', 'tutorial', 'python']
+++

During our recent Engineering Development Days, a three-day event where we paused regular work to focus on personal growth, I tackled a challenge that was both technically demanding and rewarding. The goal was straightforward yet ambitious: adapt a large pre-trained BERT model, originally designed for GPU-heavy environments, to run efficiently on an iPhone. This was uncharted territory for me, as I had never previously worked with BERT models, Core ML or mobile deployment. The learning curve was steep, yet fun.

## The Challenge: Bringing a Data Center Model to Mobile

Our team has recently built a text classification API that categorises inputs into labels such as `condition`, `constraint`, `notice`, and `process`. The engine behind this API was a BERT-large model, known for its robust capabilities in understanding natural language. However, BERT-large comes with its own set of challenges: it features 24 transformer layers, a hidden size of 1024, 16 attention heads, and an intermediate layer size of 4096. These specifications make it a powerhouse for NLP tasks—but they also mean it’s inherently resource-intensive.

To provide more context on these specifications: the **24 transformer layers** represent the depth of the model, with each layer enabling it to learn increasingly complex linguistic patterns. The **hidden size of 1024** refers to the dimensionality of the vector representations within the model, allowing for a rich encoding of word meanings and context. The **16 attention heads** within each layer enable the model to simultaneously focus on different parts of the input text when processing each word, capturing a wider range of relationships. Finally, the **intermediate layer size of 4096** is the size of the internal feed-forward network within each transformer layer, providing ample capacity for processing and transforming the information learned through the attention mechanisms. These architectural choices contribute to BERT-large's powerful language understanding capabilities.

Initially, our focus was on GPU deployments. However, practical constraints meant that the API might sometimes have to run in CPU-only environments. I had profiled the API on my MacBook using only its CPU, and while the performance was acceptable, I wondered if I could take this even further. The real test was to see if I could run such a sophisticated model on an iPhone, a device with significantly constrained resources compared to a data center.

## Converting the Model: From BERT to Core ML

The first step in this journey was converting the BERT model for mobile deployment. While modern mobile devices are equipped with powerful GPUs, optimising for these environments is still crucial. Every optimisation mattered to ensure efficient performance, manage battery consumption, and minimise the model's footprint on the device. I employed a two-pronged approach:

1. **Direct Conversion via ONNX:**
   - I started by converting the pre-trained BERT model into the ONNX (Open Neural Network Exchange) format. ONNX is widely recognised for its interoperability, serving as a bridge between different machine learning frameworks.
   - Using Apple’s coremltools, I then converted the ONNX model into Core ML format. The conversion was successful, and the resulting model was around 670.1 MB in size.
   - This version of the model performed reasonably well on the iPhone, demonstrating that even without heavy hardware, modern NLP models can operate on mobile devices.

2. **Model Distillation and Optimisation:**
   - Knowing that 670.1 MB was still relatively bulky for an ideal mobile experience, I experimented with model distillation. The idea behind distillation is to transfer the knowledge from a large model to a smaller one; options like MobileBERT or DistilBERT came into play.
   - Despite facing some challenges, including Python library incompatibilities that needed careful resolution, I managed to reduce the model size further to 134 MB (pre quantisation).
   - Although this distilled model showed promise in terms of efficiency, its accuracy was a bit less reliable compared to the full sized version, a reminder that reducing model size often comes with trade offs.

## Technical Deep Dive: Behind the Scenes

### Model Architecture and Specifications

- **BERT-large Details:**
  - **Layers:** 24 transformer layers.
  - **Hidden Size:** 1024.
  - **Attention Heads:** 16 per layer.
  - **Intermediate Size:** 4096.
  - **Vocabulary:** 30,522 tokens.
  - **Sequence Length:** Supports sequences up to 512 tokens.

These parameters underline the computational heft of the model, making the conversion and optimisation processes particularly challenging.

### Conversion Process

- **ONNX as a Bridge:**
  The decision to use ONNX was pivotal. It allowed the seamless translation of a PyTorch model into a format that could be further converted into Core ML, which is essential for deployment on iOS devices.

- **Core ML Conversion:**
  Leveraging coremltools, I successfully converted the ONNX model to Core ML. The process preserved the model’s structural integrity, ensuring that its inference capabilities remained intact even after conversion.

### Optimisation Techniques

- **Distillation:**
  By training a smaller model to mimic the outputs of the full-scale BERT-large, I was able to achieve a significant reduction in model size. This step was essential in making the model more feasible for mobile deployment, even though it introduced some compromises in accuracy.

- **Quantisation (On the Horizon):**
  While I didn’t finalise the quantisation process during the event due to technical hurdles, it remains a promising technique for further reducing the model’s footprint and potentially increasing its inference speed on mobile devices.

### Diving Deeper: Key Aspects of the Knowledge Distillation Pipeline

To prepare the data for distilling the knowledge from the larger BERT model into a smaller one, I wrote a Python script leveraging the power of `torch` and the `transformers` library. While a full walkthrough of the script is beyond the scope of this post, I wanted to highlight some key concepts and techniques I used in the data preparation pipeline.

#### Data Loading and Preprocessing

The script begins by loading the training data from a CSV file using `pandas`. A crucial step here is ensuring flexibility in handling potential variations in column names for labels (`'label_id'` or `'label id'`). I also filtered out rows with missing or invalid labels to ensure data quality for the distillation process.

```python
import pandas as pd
# ... other imports ...

class DistillationDatasetPreparator:
    def __init__(self, csv_path, ...):
        # ... initialization ...

    def load_and_preprocess_data(self):
        df = pd.read_csv(self.csv_path)
        # Handling potential variations in label column names
        if "label_id" in df.columns:
            id_column = "label_id"
        elif "label id" in df.columns:
            id_column = "label id"
        else:
            id_column = None

        # Filtering out invalid labels
        if id_column and id_column in df.columns:
            filtered_df = df[df[id_column] != -1].copy()
            filtered_df = filtered_df[filtered_df["label"].notna()].copy()
        # ... rest of the loading and preprocessing logic ...
        return texts, labels
```

#### Data Augmentation for Robustness

To enhance the robustness and generalisation capabilities of the distilled model, I implemented data augmentation techniques. The script includes two main methods: **synonym replacement** and **random deletion**. These techniques introduce slight variations in the training data, encouraging the student model to learn more invariant features.

```python
    def augment_data(self, texts, labels, augmentation_factor=2):
        augmented_texts = texts.copy()
        augmented_labels = labels.copy()
        for idx, (text, label) in enumerate(zip(texts, labels)):
            for _ in range(augmentation_factor):
                technique = random.choice(["synonym_replacement", "random_deletion"])
                if technique == "synonym_replacement":
                    augmented_text = self._synonym_replacement(text)
                else:
                    augmented_text = self._random_deletion(text)
                augmented_texts.append(augmented_text)
                augmented_labels.append(label)
        return augmented_texts, augmented_labels

    def _synonym_replacement(self, text, replace_prob=0.2):
        # Uses NLTK's WordNet to find synonyms and replace words
        words = text.split()
        # ... logic for finding and replacing synonyms ...
        return " ".join(words)

    def _random_deletion(self, text, delete_prob=0.1):
        # Randomly deletes words from the text
        words = text.split()
        # ... logic for randomly deleting words ...
        return " ".join(words)
```

### Tokenization with `transformers`

An important step in working with BERT models is tokenisation. The script utilises the `BertTokenizer` from the `transformers` library to convert the text data into numerical representations that the model can understand. We ensure consistent tokenisation between the teacher and student models.

```python
from transformers import BertTokenizer

    def tokenize_dataset(self, texts, labels):
        tokenizer = BertTokenizer.from_pretrained(self.teacher_model_name)
        encodings = tokenizer(
            texts,
            truncation=True,
            padding="max_length",
            max_length=self.max_length,
            return_tensors="pt",
        )
        input_ids = encodings["input_ids"]
        attention_masks = encodings["attention_mask"]
        labels_tensor = torch.tensor(labels)
        return input_ids, attention_masks, labels_tensor
```

#### Generating Soft Labels from the Teacher Model

The core idea of knowledge distillation involves transferring the "knowledge" of the teacher model (BERT-large in our case) to the student model. This is achieved by training the student not only on the hard labels but also on the probability distributions (soft labels) predicted by the teacher. This script includes functionality to load the pre-trained teacher model and generate these soft labels for the training data.

```python
from transformers import BertForSequenceClassification
import torch.nn.functional as F

    def generate_soft_labels(self, input_ids, attention_masks, teacher_model_path=None):
        # Load the teacher model
        teacher_model = BertForSequenceClassification.from_pretrained(teacher_model_path or self.teacher_model_name)
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        teacher_model.to(device).eval()

        # Generate predictions (logits) and then soft labels (probabilities)
        dataloader = DataLoader(TensorDataset(input_ids, attention_masks), batch_size=self.batch_size)
        soft_labels = []
        with torch.no_grad():
            for batch in dataloader:
                batch_input_ids, batch_attention_masks = tuple(t.to(device) for t in batch)
                outputs = teacher_model(input_ids=batch_input_ids, attention_mask=batch_attention_masks)
                logits = outputs.logits
                probs = F.softmax(logits, dim=1)
                soft_labels.append(probs.cpu())
        return torch.cat(soft_labels, dim=0)
```

This data preparation script forms the foundation for the subsequent knowledge distillation training process, ensuring that the student model has access to both the correct labels and the richer probabilistic information provided by the larger, more capable teacher model.

### From Model to Mobile: Implementing BERT on iOS

With the distilled BERT model converted to Core ML, the next step was to build an iPhone application to run it. This section highlights some key aspects of the iOS app development using Swift and the Core ML framework.

#### SwiftUI for the User Interface

The application's user interface was built using SwiftUI, Apple's modern declarative UI framework. This allowed for a relatively quick and efficient way to create the basic elements needed for text input and displaying the classification results.

```swift
import SwiftUI

@main
struct auto_taggerApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
```

The `ContentView` struct houses the main UI elements, including a `TextEditor` for the user to input text and a button to trigger the analysis. The results are then displayed below.

The screenshot below gives an example of the app's interface with a classified text result:
![The same "Text Classification" app interface, but now showing a classified text result. The user has inputted: "If the paint has dried, then it’s safe to apply the second coat." The app classifies it under "condition" with a confidence of 42.72%. Additional raw data breakdown shows classification probabilities for "condition" (42.72%), "constraint" (19.50%), "process" (18.96%), and "notice" (18.81%). The time on the device is now 09:16, and the battery is at 53%.](screenshot.PNG)

#### Crafting a Custom BERT Tokenizer in Swift

An necessary component of the app was the `BERTTokenizer`. Since standard iOS tokenizers wouldn't handle the specific vocabulary and tokenisation rules of the BERT model, a custom implementation was necessary.

```swift
class BERTTokenizer {
    private let vocabulary: [String: Int]
    private let unkToken = "[UNK]"
    private let clsToken = "[CLS]"
    private let sepToken = "[SEP]"
    private let padToken = "[PAD]"

    init() throws {
        guard let vocabURL = Bundle.main.url(forResource: "vocab", withExtension: "txt") else {
            throw TokenizerError.vocabNotFound
        }
        let vocabString = try String(contentsOf: vocabURL, encoding: .utf8)
        let tokens = vocabString.components(separatedBy: .newlines)
        // ... loading vocabulary into dictionary ...
    }

    func tokenize(text: String, maxLength: Int) throws -> TokenizedInput {
        var tokens = [clsToken]
        let words = text.components(separatedBy: .whitespacesAndNewlines)
        // ... basic whitespace tokenization ...
        tokens.append(sepToken)
        // ... converting tokens to IDs, padding, creating attention mask ...
    }
    // ... other methods and structs ...
}
```

This `BERTTokenizer` class is responsible for:

- **Loading the Vocabulary:** Reading the `vocab.txt` file (which was packaged with the app) into a dictionary.
- **Basic Tokenization:** For this initial version, a basic whitespace tokenizer was implemented. **It's important to note that for a production-ready application, a more sophisticated WordPiece tokenizer would be required to handle subwords correctly and match the original BERT training process more accurately.**
- **Handling Special Tokens:** Adding `[CLS]` at the beginning and `[SEP]` at the end of the sequence, as well as handling `[UNK]` for unknown words and `[PAD]` for padding.
- **Padding and Truncation:** Ensuring all input sequences have a consistent length (in this case, 128 tokens) by padding shorter sequences and truncating longer ones.
- **Generating the Attention Mask:** Creating a mask to indicate which tokens are actual words and which are padding.
- **Formatting as `MLMultiArray`:** Converting the token IDs and attention mask into `MLMultiArray` objects, the required input format for Core ML.

#### Loading and Running the Core ML Model

The `TextClassifier` class handles the loading of the converted Core ML model and the execution of the classification.

```swift
class TextClassifier {
    private let model: MLModel
    private let tokenizer: BERTTokenizer
    // ...

    init() throws {
        let mlModel = try distilled_model() // Loading the Core ML model
        model = mlModel.model
        tokenizer = try BERTTokenizer()
        // ... loading labels ...
    }

    func classify(text: String) throws -> ClassificationResult {
        let tokens = try tokenizer.tokenize(text: text, maxLength: 128)
        let inputFeatures = try MLDictionaryFeatureProvider(dictionary: [
            "input_ids": tokens.ids,
            "attention_mask": tokens.mask
        ])
        let prediction = try model.prediction(from: inputFeatures)
        // ... processing the prediction output (logits, softmax) ...
    }
    // ...
}
```

The `classify` function takes the input text, uses the `BERTTokenizer` to prepare it, creates the necessary input features (`input_ids` and `attention_mask`) for the Core ML model, and then runs the prediction. The output logits from the model are then processed using a softmax function to obtain probabilities for each class.

### Displaying Results and Debug Information

The `ContentView` also handles displaying the classification results to the user, including the predicted label and its confidence. Additionally, a debug mode was included to show the raw output probabilities from the model, which was invaluable for understanding and verifying the model's behavior on device.

```swift
struct ContentView: View {
    @State private var inputText: String = ""
    @State private var resultText: String = "Classification result will appear here"
    @State private var classificationResults: [(label: String, value: Double)] = []
    @State private var showRawData: Bool = false
    // ...

    private func analyseText() {
        // ... background task to prevent UI freezing ...
        do {
            let result = try classifier?.classify(text: inputText)
            DispatchQueue.main.async {
                resultText = "Classification: \(result.label) (Confidence: \(String(format: "%.2f", result.confidence * 100))%)"
                classificationResults = result?.allProbabilities ?? []
            }
        } catch {
            // ... handle error ...
        }
    }

    // ... UI elements for text input, button, and result display ...
}
```

The app performs the analysis on a background thread to prevent the UI from freezing during the potentially computationally intensive task.

## The Mobile Deployment Experience

Deploying the converted model on an iPhone Pro Max was the highlight of the event. I was amazed by how seamlessly the model integrated with the device's hardware. The model's real-time inference capabilities were particularly impressive, demonstrating the power of machine learning on mobile devices.

Here are some key observations from the deployment:

- **Real-Time Inference:**
  The model was capable of processing text inputs on the fly, which is impressive given the hardware limitations of mobile devices. This real-time performance is critical for applications where immediate feedback is necessary.

- **Comparing Model Versions:**
  The direct conversion model (670.1 MB) provided solid performance, but the distilled version (134 MB) showed potential for even faster inference. However, a trade-off in accuracy was noted with the smaller model, highlighting the need for further fine-tuning in future iterations.

## Lessons Learned and Challenges Overcome

### Library and Dependency Management

Having spent some time away from Python, I was reminded of how friggin' annoying it can be to manage library dependencies. The project required a specific set of libraries and versions to ensure compatibility with the ONNX and Core ML conversion processes. I encountered several issues related to version mismatches, which required careful management of my Python environment.

### Balancing Accuracy and Efficiency

The project vividly illustrated the trade-off between reducing model size and maintaining accuracy. While the distilled model was impressively compact, its accuracy did not fully match that of the original BERT-large model.

### Cross-Platform Development

Transitioning from a GPU-centric environment to a mobile deployment required a shift in mindset. The constraints of mobile hardware necessitated a different approach to model optimisation and performance tuning. This experience highlighted the importance of understanding the target platform's capabilities and limitations.

## Looking Ahead: Future Directions and Opportunities

Although I won't be extending this project immediately, the Engineering Development Days was a fun opportunity to explore running BERT on mobile. The surprisingly easy, direct conversion to Core ML, highlighted the growing accessibility of deploying complex models on limited hardware. My exploration of model distillation, while not currently needed, provided significant insights into mobile model optimisation, which will be useful for future on-device ML projects.

I also plan to revisit the quantisation process, which I had to put on hold due to time constraints. This technique has the potential to further reduce the model size and improve inference speed, making it an exciting avenue for future exploration.

## Conclusion

Over the course of just three days, I experienced firsthand the challenges and rewards of pushing a high-powered BERT model into the realm of mobile deployment. This journey - from converting the model to ONNX and Core ML formats, through distillation, to finally running real-time inference on an iPhone Pro Max - has been a fun adventure that has deepened my understanding of mobile model optimisation and the potential of on-device machine learning.

You can find the code for my repository at [distilled-bert-ios](https://github.com/bclews/distilled-bert-ios).
