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


# Priority mapping for destination departments
DEPT_PRIORITY = {
    "Health": 9, "Education": 8, "Water Resources": 8,
    "Agriculture": 7, "Infrastructure": 7, "Housing": 6,
    "Transport": 6, "Energy": 5, "Finance": 4, "Defence": 4,
}

NEEDY_MAP = {
    "Infrastructure": "Health",   "Agriculture": "Education",
    "Transport": "Water Resources", "Housing": "Health",
    "Energy": "Education",        "Finance": "Infrastructure",
    "Defence": "Health",          "Health": "Education",
    "Education": "Water Resources", "Water Resources": "Agriculture",
}


@router.post("/suggest-reallocation", response_model=ReallocationResponse)
async def suggest_reallocation(req: ReallocationRequest):

    departments = req.departments

    if not departments:
        return ReallocationResponse(
            total_suggestions=0, total_reallocatable=0,
            before_avg_utilization=0, after_avg_utilization=0,
            suggestions=[], summary="No departments provided.",
        )

    before_avg = float(np.mean([d.utilization_rate for d in departments]))
    total_alloc = sum(d.allocated for d in departments)

    # ── Single department: generate self-reallocation suggestion ──
    if len(departments) == 1:
        d = departments[0]
        unused = d.allocated - d.spent
        transfer = round(unused * 0.6, 2)
        destination = NEEDY_MAP.get(d.department_name, "Health")

        if transfer < 1:
            return ReallocationResponse(
                total_suggestions=0, total_reallocatable=0,
                before_avg_utilization=round(before_avg, 2),
                after_avg_utilization=round(before_avg, 2),
                suggestions=[],
                summary=f"{d.department_name} has sufficient utilization. No reallocation needed.",
            )

        impact = round(
            (DEPT_PRIORITY.get(destination, 5) / 10) * 0.5 +
            (1 - d.utilization_rate / 100) * 0.5, 3
        )

        suggestion = TransferSuggestion(
            from_department=d.department_name,
            to_department=destination,
            transfer_amount=transfer,
            reason=(
                f"{d.department_name} has only {round(d.utilization_rate, 1)}% utilization "
                f"with Rs.{round(unused, 1)}Cr unused. "
                f"Recommend transferring Rs.{transfer}Cr to {destination} where demand is higher."
            ),
            impact_score=impact,
        )

        after_avg = before_avg + (transfer / total_alloc * 100) if total_alloc > 0 else before_avg

        return ReallocationResponse(
            total_suggestions=1,
            total_reallocatable=round(transfer, 2),
            before_avg_utilization=round(before_avg, 2),
            after_avg_utilization=round(after_avg, 2),
            suggestions=[suggestion],
            summary=f"1 transfer suggested. Rs.{transfer}Cr can be redistributed from {d.department_name} to {destination}.",
        )

    # ── Multiple departments: donor/receiver matching ─────────────
    donors    = []
    receivers = []

    for dept in departments:
        surplus = dept.allocated - dept.spent
        # Low utilization = donor
        if dept.utilization_rate < 55 and surplus > 0:
            donatable = surplus * (1 - dept.demand_indicator) * 0.6
            if donatable > 1:
                donors.append({"dept": dept, "remaining": donatable})
        # High utilization or high demand = receiver
        if dept.utilization_rate > 60 or dept.demand_indicator > 0.5:
            needed = dept.allocated * dept.demand_indicator * 0.3
            if needed > 1:
                receivers.append({"dept": dept, "remaining_need": needed})

    # If no receivers found, use NEEDY_MAP to create virtual receivers
    if not receivers and donors:
        seen = set()
        for donor_entry in donors:
            dest_name = NEEDY_MAP.get(donor_entry["dept"].department_name, "Health")
            if dest_name not in seen:
                seen.add(dest_name)
                # Create a virtual receiver entry
                receivers.append({
                    "dept": type("VirtualDept", (), {
                        "department_name": dest_name,
                        "allocated": 0,
                        "utilization_rate": 90,
                        "demand_indicator": 0.8,
                        "priority_score": DEPT_PRIORITY.get(dest_name, 5),
                    })(),
                    "remaining_need": donor_entry["remaining"],
                })

    donors.sort(key=lambda x: x["remaining"], reverse=True)
    receivers.sort(
        key=lambda x: x["dept"].priority_score * x["dept"].demand_indicator,
        reverse=True,
    )

    suggestions = []
    total_moved = 0

    for receiver in receivers:
        for donor in donors:
            if donor["remaining"] <= 0 or receiver["remaining_need"] <= 0:
                continue
            transfer = min(donor["remaining"], receiver["remaining_need"])
            if transfer < 1:
                continue

            d = donor["dept"]
            r = receiver["dept"]

            impact = float(
                (r.priority_score / 10) * 0.35 +
                r.demand_indicator * 0.35 +
                (1 - d.demand_indicator) * 0.15 +
                (1 - d.utilization_rate / 100) * 0.15
            )

            suggestions.append(TransferSuggestion(
                from_department=d.department_name,
                to_department=r.department_name,
                transfer_amount=round(transfer, 2),
                reason=(
                    f"Move Rs.{round(transfer, 1)}Cr from {d.department_name} "
                    f"({round(d.utilization_rate, 1)}% utilization) to {r.department_name} "
                    f"(demand: {round(r.demand_indicator * 100)}%). "
                    f"Impact score: {round(impact, 2)}."
                ),
                impact_score=round(impact, 3),
            ))

            donor["remaining"]         -= transfer
            receiver["remaining_need"] -= transfer
            total_moved                += transfer

    suggestions.sort(key=lambda x: x.impact_score, reverse=True)

    after_avg = (
        before_avg + (total_moved / total_alloc * 100)
        if total_moved > 0 and total_alloc > 0
        else before_avg
    )

    return ReallocationResponse(
        total_suggestions=len(suggestions),
        total_reallocatable=round(total_moved, 2),
        before_avg_utilization=round(before_avg, 2),
        after_avg_utilization=round(after_avg, 2),
        suggestions=suggestions,
        summary=(
            f"{len(suggestions)} transfer(s) suggested. "
            f"Rs.{round(total_moved, 1)}Cr can be redistributed."
        ),
    )