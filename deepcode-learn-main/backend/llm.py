from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
import torch
import difflib
import json
import re
import ast

MODEL_NAME = "deepseek-ai/deepseek-coder-1.3b-instruct"

print("\u23F3 Loading model...")

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Device set to: {device}")

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    device_map="auto",
    torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
    trust_remote_code=True
)

pipe = pipeline(
    "text-generation",
    model=model,
    tokenizer=tokenizer
)

print("\u2705 Model loaded successfully!")

def call_deepseek(prompt: str, max_tokens: int = 512) -> str:
    outputs = pipe(prompt, max_new_tokens=max_tokens, do_sample=False)
    return outputs[0]["generated_text"].replace(prompt, "").strip()

def run_python_function(code: str, func_name: str, arg_str: str) -> str:
    """
    Execute the student's function with the given arguments (as string).
    """
    local_env = {}
    try:
        exec(code, local_env)
        # Parse arguments safely
        args = ast.literal_eval(f"({arg_str},)") if ',' in arg_str else (ast.literal_eval(arg_str),)
        result = local_env[func_name](*args)
        return str(result)
    except Exception as e:
        return f"Error: {e}"

def extract_function_name(code: str) -> str:
    """
    Extract the first function name defined in the code.
    """
    try:
        tree = ast.parse(code)
        for node in tree.body:
            if isinstance(node, ast.FunctionDef):
                return node.name
    except Exception:
        pass
    return None

def evaluate_code_with_tests(code: str, test_cases: list[dict], 
                             weight_tests=0.8, weight_similarity=0.2,
                             feedback=True) -> dict:
    output_log = ""
    passed = 0
    failed_feedback = []

    func_name = extract_function_name(code)
    if not func_name:
        return {
            "output_log": "",
            "passed": 0,
            "total": len(test_cases),
            "score": 0,
            "similarity": 0,
            "ideal_code": "",
            "feedback": "❌ No function found in code."
        }

    for i, test in enumerate(test_cases):
        try:
            actual = run_python_function(code, func_name, test['input'])
        except Exception as e:
            actual = f"Error: {e}"

        expected = test['output'].strip()
        if expected == actual:
            passed += 1
        else:
            failed_feedback.append(
                f"❌ Test {i+1}: Input={test['input']} | Expected={expected} | Got={actual}"
            )

        output_log += f"Test {i+1} - Input: {test['input']}\nExpected: {expected}\nGot: {actual}\n\n"

    # Similarity (bonus)
    generate_prompt = f"""
You are an expert programmer. Write a correct Python function that satisfies these test cases:

{json.dumps(test_cases, indent=2)}

Return only the raw Python code, no explanation.
"""
    ideal_code = extract_raw_output(call_deepseek(generate_prompt, max_tokens=512))

    # Debug: Affichage des codes et des versions normalisées
    print("\n===== CODE1 (student) =====\n", code)
    print("\n===== CODE2 (ideal LLM) =====\n", ideal_code)
    print("\n===== NORMALIZED CODE1 =====\n", normalize_code(code))
    print("\n===== NORMALIZED CODE2 =====\n", normalize_code(ideal_code))

    similarity = calculate_similarity(code, ideal_code)

    total = len(test_cases)
    test_score = (passed / total) if total else 0
    final_score = round((weight_tests * test_score + weight_similarity * similarity) * 100, 2)

    result = {
        "output_log": output_log.strip(),
        "passed": passed,
        "total": total,
        "score": final_score,
        "similarity": similarity,
        "ideal_code": ideal_code.strip()
    }

    if feedback:
        result["feedback"] = "\n".join(failed_feedback) if failed_feedback else "✅ All tests passed!"

    return result

def extract_raw_output(llm_output: str) -> str:
    """
    Extract only the code from the LLM output, ignoring explanations and markdown.
    """
    # Remove markdown code fences
    code = re.sub(r"```[a-zA-Z]*", "", llm_output)
    code = code.replace("```", "")
    # Keep only lines from the first function definition onward
    lines = code.splitlines()
    code_lines = []
    found_def = False
    for line in lines:
        if not found_def and line.strip().startswith("def "):
            found_def = True
        if found_def:
            # Stop if we hit an explanation or example
            if line.strip().startswith("This function") or line.strip().startswith("For example"):
                break
            code_lines.append(line)
    code = "\n".join(code_lines)
    # Remove leading/trailing whitespace and empty lines
    code = "\n".join(line.rstrip() for line in code.splitlines() if line.strip())
    return code.strip()

def normalize_code(code: str) -> str:
    # Retire les commentaires, lignes vides, espaces en trop
    code = re.sub(r'#.*', '', code)
    code = '\n'.join(line.strip() for line in code.splitlines() if line.strip())
    # Retire les caractères invisibles
    code = code.replace('\r', '').replace('\t', '')
    try:
        tree = ast.parse(code)
        if hasattr(ast, "unparse"):
            return ast.unparse(tree)
        return ast.dump(tree, annotate_fields=False, include_attributes=False)
    except Exception:
        return code.strip()
    
def calculate_similarity(code1: str, code2: str) -> float:
    norm1 = normalize_code(code1)
    norm2 = normalize_code(code2)
    return difflib.SequenceMatcher(None, norm1, norm2).ratio()
