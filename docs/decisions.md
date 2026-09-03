# Decisions

1. MongoDB/Mongoose was chosen for document references and fast iteration; a relational database was
   rejected because the assignment does not require SQL-specific behavior.
2. JWT bearer authentication was chosen for a stateless API; server sessions were rejected to keep the
   frontend deployment independent from the API process.
3. Technician authorization is checked against assigned record IDs on the server; hiding controls in
   React alone was rejected.
4. Timeline events are append-only and immutable; editable history was rejected because audit history
   must be trustworthy.
5. Separate `make` and `model` fields replaced the original `make_model` field so filtering and schema
   semantics remain clear. A compatibility adapter accepts legacy request bodies during migration.
6. Due/overdue state is calculated from stored completion baselines and due timestamps rather than a
   manually maintained boolean, reducing stale alert state.