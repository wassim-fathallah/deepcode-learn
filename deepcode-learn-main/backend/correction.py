
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import logging
from llm import call_deepseek

router = APIRouter()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CorrectionRequest(BaseModel):
    problem_id: int
    student_code: str
    language: str = "python"
    problem_context: Optional[str] = None

@router.post("/correction/")
async def generate_correction(req: CorrectionRequest):
    if not req.student_code.strip():
        raise HTTPException(status_code=400, detail="Empty code submission")

    prompt = f"""
You are an expert programming assistant.

The following {req.language} code is submitted for problem {req.problem_id}.

```{req.language}
{req.student_code}
```

{f"Problem context:\n{req.problem_context}" if req.problem_context else ""}

Please return a corrected version of the code that passes all tests for this problem.

Only return raw {req.language} code. No explanation, no markdown, no formatting.
"""

    try:
        logger.info(f"Generating correction for problem {req.problem_id}")
        correction_code = call_deepseek(
            prompt=prompt,
            max_tokens=512,
            
        ).strip()

        # Clean up if wrapped with ```...``` or language prefix
        if correction_code.startswith("```"):
            correction_code = correction_code.strip("`").strip()
            if correction_code.startswith(req.language):
                correction_code = correction_code[len(req.language):].strip()

        return {
            "correction": correction_code,
            "language": req.language,
            "problem_id": req.problem_id
        }

    except Exception as e:
        logger.error(f"Correction generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate correction: {str(e)}")