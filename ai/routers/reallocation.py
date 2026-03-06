"""POST /ai/suggest-reallocation — Budget reallocation optimizer"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
import numpy as np

router = APIRouter()


class DepartmentFundInput(BaseModel):
    department_id: str
    department_name: str
    allocated: float
    spent: float
    utilization_rate: float
    priority_score: float
    demand_indicator: float

class ReallocationRequest(BaseModel):
    departments: List[DepartmentFundInput]

class TransferSuggestion(BaseModel):
    from_department: str
    to_department: str
    transfer_amount: float
    reason: str
    impact_score: float

class ReallocationResponse(BaseModel):
    total_suggestions: int
    total_reallocatable: float
    before_avg_utilization: float
    after_avg_utilization: float
    suggestions: List[TransferSuggestion]
    summary: str


@router.post("/suggest-reallocation", response_model=ReallocationResponse)
async def suggest_reallocation(req: ReallocationRequest):

    departments = req.departments

    if len(departments) < 2:
        return ReallocationResponse(
            total_suggestions=0, total_reallocatable=0,
            before_avg_utilization=0, after_avg_utilization=0,
            suggestions=[], summary="Need at least 2 departments.",
        )

    donors = []
    receivers = []

    for dept in departments:
        surplus = dept.allocated - dept.spent
        if dept.utilization_rate < 55 and dept.demand_indicator < 0.5 and surplus > 0:
            donatable = surplus * (1 - dept.demand_indicator) * 0.5
            donors.append({"dept": dept, "remaining": donatable})
        elif dept.utilization_rate > 75 and dept.demand_indicator > 0.5:
            needed = dept.allocated * dept.demand_indicator * 0.3
            receivers.append({"dept": dept, "remaining_need": needed})

    donors.sort(key=lambda x: x['remaining'], reverse=True)
    receivers.sort(key=lambda x: x['dept'].priority_score * x['dept'].demand_indicator, reverse=True)

    suggestions = []
    total_moved = 0

    for receiver in receivers:
        for donor in donors:
            if donor['remaining'] <= 0 or receiver['remaining_need'] <= 0:
                continue
            transfer = min(donor['remaining'], receiver['remaining_need'])
            if transfer < 1:
                continue

            d = donor['dept']
            r = receiver['dept']
            impact = float(
                (r.priority_score / 10) * 0.35 + r.demand_indicator * 0.35 +
                (1 - d.demand_indicator) * 0.15 + (1 - d.utilization_rate / 100) * 0.15
            )

            suggestions.append(TransferSuggestion(
                from_department=d.department_name,
                to_department=r.department_name,
                transfer_amount=round(transfer, 2),
                reason=f"Move Rs.{round(transfer, 1)}Cr from {d.department_name} ({d.utilization_rate}%) to {r.department_name} ({r.utilization_rate}%, demand: {round(r.demand_indicator*100)}%)",
                impact_score=round(impact, 3),
            ))

            donor['remaining'] -= transfer
            receiver['remaining_need'] -= transfer
            total_moved += transfer

    suggestions.sort(key=lambda x: x.impact_score, reverse=True)

    before_avg = float(np.mean([d.utilization_rate for d in departments]))
    total_alloc = sum(d.allocated for d in departments)
    after_avg = before_avg + (total_moved / total_alloc * 100) if total_moved > 0 and total_alloc > 0 else before_avg

    return ReallocationResponse(
        total_suggestions=len(suggestions),
        total_reallocatable=round(total_moved, 2),
        before_avg_utilization=round(before_avg, 2),
        after_avg_utilization=round(after_avg, 2),
        suggestions=suggestions,
        summary=f"{len(suggestions)} transfers suggested. Rs.{round(total_moved, 1)}Cr can be redistributed.",
    )