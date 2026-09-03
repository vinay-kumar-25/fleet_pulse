# AI Prompts Used

1. Audited the complete client folder for broken imports, routing, theme mismatches, and undefined
   handlers. The first result fixed lint/build issues but did not cover the full assignment behavior.
2. Audited the complete project against the ten assignment requirements and listed unmet behavior.
3. Updated the Vehicle model to validate Indian registration numbers and split `make_model` into
   separate `make` and `model` fields while preserving API compatibility.
4. Implemented server-side lifecycle authorization, due/overdue calculations, dashboard aggregations,
   record search/filter/pagination, vehicle history, audit protection, tests, and documentation.

The generated first service-record UI replacement introduced duplicated state and malformed JSX. It was
caught by lint/build output and repaired before continuing. This is why executable validation is part of
the final workflow.