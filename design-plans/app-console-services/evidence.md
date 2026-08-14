# Evidence for the services console — gathered before the Plan run

Captured so the Plan does not re-derive it. Everything here was read from the LIVE schema at
`http://localhost:3067/graphql` and from source, not from a catalogue or a memory.

## The instruction this case exists to serve

> "kiểu 1 cái sidebar ấy rồi chọn service, hiện tại có 4 services học viện agentos vps và domain
> registar / và wallet management"
>
> "còn data mock đừng render vào vì giờ làm thật"

Two things, and the second is the harder one. The sidebar lists **services**, not resource kinds.
And nothing may render from a fixture.

## What the shipped screen actually is

`apps/app/src/components/pages/ProvisioningPage/index.tsx:23` imports
`@/resources/fleet.fixture.json`, and lines 85-86 read the whole fleet and every count out of it.

**Every row and every number on the running `/provisioning` screen is invented.** "Minh Tue
workspace", "hocvien-minhtue.nivo.vn", "3 agents · 12 automations", the 3/2/1/2 counter strip - none
of it came from the backend. The screen looks like it is tracking a fleet and is tracking a file.

`apps/app/src/modules/api/` holds `auth.ts` and `graphql.ts` and nothing else: there is no data
module for any console query. The transport exists; nothing has been written against it yet.

## The four services and the wallet, mapped to the live schema

Twenty-six `my*` queries are published. They partition cleanly, which is the strongest evidence that
service is the right axis - the backend already thinks this way.

| service | queries |
|---|---|
| Học viện | `myExpertSite`, `myExpertSites`, `myExpertSiteDeployment`, `myExpertSiteLeads`, `myAcademySettings` |
| AgentOS | `myAgentWorkspace`, `myAgents`, `myAutomations`, `myAutomation`, `myAutomationRuns`, `myAutomationRun`, `myWorkflows`, `myModels`, `myKnowledgeSources`, `myTools`, `myThreads`, `myChannels`, `myPodOpenclawStatus` |
| VPS | `myInstances` |
| Domain registrar | `myDomains` |
| Wallet | `myWallet`, `myWalletTransactions`, `myInvoices`, `myCatalogOrders` |

Unassigned, and a question for the Plan rather than an oversight: `myOpsTickets` and `myTickets`.
Support cuts across all four services, so it is not one of them.

## Why the sealed console design does not answer this

`design-plans/app-provisioning-dashboard/design-record.json` is sealed at revision 1.2,
`direction-a`, approval `confirmed-restated`. It was **never applied** - `apps/app/src/components/`
has no `layouts/` folder and no `ResourcesPage`.

It is not the wrong design; it is a design for a different axis. Its sidebar lists resource KINDS and
its home is one flat fleet with a kind filter, which is exactly what the screenshot shows. Three
consequences:

1. **It has three sections, not five.** Resources, domains, billing. VPS and Học viện and AgentOS are
   all "resources", and a domain registrar is a service in its own right rather than a list.
2. **It scatters one customer's product across rows.** In the shipped render
   `hocvien-minhtue.nivo.vn`, `Minh Tue workspace` and `minhtue.com` are three sibling rows of one
   Học viện, and the reader reassembles them by eye.
3. **Its `resources-empty` is an empty list.** Correct for a fleet, wrong for somebody who has just
   arrived and does not yet know nivo sells four things.

The sealed record stays valid as a BASELINE - `FleetRow`, the counter strip and the four lifecycle
states are proven vocabulary worth carrying - but the case it settled is not this case.

## What must be true before anything renders

No fixture. Each service section reads its own query, and every one of them can answer three ways -
not yet asked, answered with nothing, answered with something. A console wired to real queries has
more states than one wired to a file, and the empty one is the state a real account is in TODAY.
