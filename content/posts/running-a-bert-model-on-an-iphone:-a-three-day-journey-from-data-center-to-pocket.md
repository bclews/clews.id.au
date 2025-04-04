+++
title = 'Running a Bert Model on an iPhone'
date = 2025-03-03T14:44:48+11:00
draft = false
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

## The Mobile Deployment Experience

Deploying the converted model on an iPhone Pro Max was the highlight of the event. With the Core ML model in hand, I built a simple yet effective interface where sample sentences could be entered, and the model would classify them in real time. Here are some key observations from the deployment:

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

Over the course of just three days, I experienced firsthand the challenges and rewards of pushing a high-powered BERT model into the realm of mobile deployment. This journey - from converting the model to ONNX and Core ML formats, through distillation, to finally running real-time inference on an iPhone Pro Max—has been a masterclass in balancing technical ambition with practical constraints.

The project not only broadened my technical horizons but also reinforced a vital lesson: with focused effort, creative problem-solving, and a willingness to experiment, even the most formidable challenges can be overcome. Whether you're a seasoned machine learning engineer or someone eager to explore the possibilities of mobile AI, I hope this journey inspires you to push the boundaries of what’s possible.

Here's to continued innovation, collaboration, and the exciting future of bringing advanced AI to the palm of our hands!
