wfetch('http://localhost:8000/ai/suggest-reallocation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        departments: [
            {
                department_id: "1",
                department_name: "Health",
                allocated: 1000,
                spent: 200,
                utilization_rate: 20,
                priority_score: 9,
                demand_indicator: 0.8
            }
        ]
    })
})
    .then(res => res.json())
    .then(console.log)
    .catch(console.error);
