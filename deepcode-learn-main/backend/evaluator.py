import os
import json
import traceback
from typing import List

# Dynamically compute the absolute path to problems.json
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
problems_path = os.path.join(BASE_DIR, '..', 'frontend', 'public', 'data', 'problems.json')

def evaluate_code(problem_id: int, student_code: str, language: str = "python") -> dict:
    try:
        # Select the correct problems file based on language
        problems_filename = f"{language}_problems.json"
        problems_file = os.path.join(BASE_DIR, '..', 'frontend', 'public', 'data', problems_filename)
        with open(problems_file, "r", encoding="utf-8") as f:
            problems = json.load(f)

        problem = problems[problem_id]
        tests = problem.get("tests", [])
        description = problem.get("description", "")

        passed_count = 0
        results = []
        failed_feedback = []

        for idx, test in enumerate(tests):
            try:
                expected = eval(test["output"])
                local_env = {}
                exec(student_code, {}, local_env)
                func = list(local_env.values())[0]
                actual = func(*eval(test["input"]))
                passed = actual == expected
            except Exception as e:
                actual = f"Error: {e}"
                passed = False

            results.append({
                "input": test["input"],
                "expected": test["output"],
                "actual": str(actual),
                "passed": passed
            })

            if passed:
                passed_count += 1
            else:
                failed_feedback.append(
                    f"Test {idx+1} failed: input={test['input']} | expected={test['output']} | actual={actual}"
                )

        score = int((passed_count / len(tests)) * 100) if tests else 0

        # Feedback: summary of failed tests or success
        if failed_feedback:
            feedback = "\n".join(failed_feedback)
        else:
            feedback = "All tests passed! Great job."

        # Placeholder for correction suggestion (could be improved with LLM or template)
        correction = "Consider reviewing the failed test cases and checking your logic."

        return {
            "score": score,
            "results": results,
            "description": description,
            "feedback": feedback,
            "correction": correction
        }

    except Exception as e:
        return {
            "score": 0,
            "results": [],
            "description": "",
            "error": str(e),
            "traceback": traceback.format_exc()
        }