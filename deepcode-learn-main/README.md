# DeepCodeLearn: AI-Powered Code Generation and Feedback Platform

## 📌 Overview
DeepCodeLearn is an **AI-powered platform** designed to enhance computer science education by providing **automatic code generation, evaluation, and personalized feedback**.  
The system leverages **Large Language Models (LLMs)** such as **DeepSeek-Coder, CodeLlama, and StarCoder**, applying **fine-tuning, RAG, and prompt engineering** to improve performance in solving programming problems.  

Developed as part of a research internship at the **DES Research Unit (Sfax, Tunisia)**.

---

## ✨ Key Features
- **AI-Powered Code Generation** – Default model: **DeepSeek-Coder Instruct 1.3B**, chosen for its balance between accuracy and resource efficiency.  
- **Iterative Code Refinement** – Generated code is executed and tested; if it fails, the output is looped back into the LLM for correction until all test cases pass.  
- **Automated Evaluation** – Hybrid scoring with:  
  - **Test case validation (60%)**  
  - **Code similarity scoring (40%)** using Python’s `difflib`.  
- **Intelligent Feedback** – Provides contextual hints, detailed error explanations, and learning-oriented feedback.  
- **Multi-Language Support** – Evaluates solutions in Python, Java, C++, and C.  
- **Educator Tools** – Problem creation, progress tracking, and analytics dashboards.  

---

## 🏆 Research Contributions
- **Model Selection**: Benchmarked 5+ LLMs; selected **DeepSeek-Coder Instruct 1.3B** as the primary model due to its high Pass@1 accuracy and lightweight requirements (<4GB VRAM).  
- **Fine-Tuning with LoRA**: Experimented with **parameter-efficient fine-tuning** (LoRA) to adapt DeepSeek-Coder for educational tasks.  
- **RAG Integration**: Used **retrieval-augmented generation (RAG)** to ground the LLM in problem-specific knowledge.  
- **Prompt Engineering**: Designed dynamic prompts with contextual hints and error descriptions to guide model corrections.  
- **Iterative Repair Loop**: Implemented a **loop of generation → execution → error feedback → regeneration**, increasing problem-solving success rates.  
- **Evaluation Innovation**: Hybrid scoring method combining **functional correctness** and **semantic similarity (difflib)** for fairer grading.  

---

## 📊 Performance Highlights
| Model                  | Pass@1 Accuracy | Inference Speed |
|------------------------|-----------------|-----------------|
| **DeepSeek-Coder 1.3B** | **56.18%**      | Fast            |
| CodeLlama 3B           | 52.00%          | Moderate        |
| StarCoder 3B           | 40.00%          | Moderate        |

✅ Achieved **95% final accuracy** on basic programming tasks using iterative repair.  
⚡ Reduced inference time from **15s → 3s** through optimization.  
🌍 Supports **100+ concurrent users** with minimal latency.  

---

## 🛠️ Technology Stack
- **AI/ML**: PyTorch, HuggingFace Transformers, LoRA fine-tuning, RAG, Prompt Engineering  
- **Backend**: FastAPI (Python), Firebase  
- **Frontend**: Next.js, Monaco Editor  
- **Evaluation**: `difflib`, custom test execution pipeline  
- **Deployment**: Docker, Google Cloud  

---

## 🚀 Future Roadmap
- Adaptive learning based on student performance history  
- Voice-driven feedback for accessibility  
- Expansion to more languages (Go, Rust, JavaScript)  
- LMS integration (Moodle, GitHub Classroom)  

---

## 📚 Academic Impact
This project contributes to:  
- **LLM benchmarking for code education**  
- **Efficient fine-tuning techniques (LoRA) for domain specialization**  
- **Hybrid code evaluation metrics (tests + similarity)**  
- **Iterative LLM repair loops for reliable problem solving**  
- **Real-world deployment of RAG-enhanced educational AI**  

---

## 🙏 Acknowledgments
Supervised by **Dr. Mohamed Ali Haj Taieb**, DES Research Unit.  
Developed by **Mohamed Adam Alimi** (INSAT, Tunisia).  

📄 Licensed for academic and research purposes.  


