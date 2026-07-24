# 01 · Brief

## The problem Union solves

Datamatics Business Solutions sells several things that today are reported to
clients through separate spreadsheets, decks, and email threads:

| Service | What it is |
|---|---|
| **iData** | Database generation — building a target account universe |
| **CleanRich** | In-house data cleansing and enrichment |
| **Content syndication / lead generation** | The existing core business |
| **Programmatic** | Programmatic advertising purchase |

A client might buy one of these or all of them. Today there is no single place a
client can see what they have bought and how it is performing.

Union is that place. The proposition: **once you do business with DBSL, everything
you are doing with us is visible to you here.**

## The differentiated argument

These four services form a chain, and DBSL owns every link:

```
iData builds the universe
  → CleanRich cleanses and enriches it
    → programmatic runs against those accounts
      → leads are sourced from them
        → one invoice covers all of it
```

No point solution can show that chain. A marketing automation platform shows leads.
A DSP shows impressions. A data vendor shows records. Nobody shows how they connect.

This is why the platform is worth building, and it is the thing the demo must land.

## Who the demo is for

Internal — the Unit CEO and the product team. They will walk through it and argue
about it. The demo's job is to provoke good arguments, not to survive contact with
an API.

## The structural idea

**Account is the root object, not Campaign.**

A campaign is one shape of delivery. A data build is not a campaign — it has no
start/end pacing curve, it has a batch drop and a match rate. An enrichment job is
not a campaign either.

So the hierarchy in the client's head is:

```
Account  (the client company — owns entitlements, users, documents, invoices)
  └── Service  (what they bought: data / media / leads)
        └── Delivery  (campaigns, flights, batches — shape varies by service)
```

This matters for information architecture even though there is no database. If the
navigation and hierarchy are muddled, the "everything in one place" story does not
land, and people in the room will feel the seams without being able to name them.

## The card grammar

Every service, whatever it is, answers the same four questions in the same visual
slot. Different nouns, identical shape. This is what stops the overview from feeling
like four vendors' dashboards stapled together.

| Question | iData | CleanRich | Programmatic | Leads |
|---|---|---|---|---|
| What did I buy? | 50,000 records | 50,000 to process | $80,000 budget | 500 leads |
| What have I received? | 38,400 delivered | 47,200 processed | 2.1M imps / $41,200 | 96 billable |
| What's the quality? | Field fill, match rate | Corrected, deduped | Viewability, CTR | Accept rate |
| Am I on pace? | 77% | 94% | 52% | 19% |

If a fifth service is ever added, the test is whether it can answer those four
questions. If it cannot, it does not belong on the overview.

## Vocabulary that matters

- **Billable vs delivered.** These are different numbers and the difference has
  caused real confusion. Delivered = total leads sent. Billable = what the client is
  actually charged for, after rejections. Both are always shown. Never use one label
  for the other.
- **"Client", never "Publisher."** Publisher is internal Convertr vocabulary. It
  must never surface in a client-facing screen.
- **"Datamatics Business Solutions" or "DBSL", never "Datamatics."**
