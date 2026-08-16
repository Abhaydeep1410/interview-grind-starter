// 50-day DevOps & Cloud track — reframed for BACKEND DEVELOPERS
// (not for a dedicated DevOps/SRE/Platform Engineer interview).
//
// Weighting shifted toward what backend interviewers actually ask:
// Docker, CI/CD, Kafka, Networking, and cloud basics at a "can you reason
// about this and use it" level — not "can you operate/architect this
// infra" level. Kubernetes/Terraform are trimmed to concepts a backend
// dev is expected to know, not authored/operated.
//
// Weeks: Linux(1-4) → Networking(5-9) → Git(10-12) → Docker(13-20) →
//        CI/CD(21-26) → AWS(27-34) → Kubernetes(35-39) → Kafka(40-44) →
//        Monitoring(45-47) → Terraform(48-49) → DevSecOps(50)

const RAW_DAYS = [
  // ── Week 1 · Linux Basics for Devs (Days 1-4) ──────────────────────────
  { day: 1, week: "Linux Basics", rows: [
    ["Linux", "Learn filesystem navigation and basic file ops (ls, cd, cp, mv, find)"],
    ["Interview", "Your Spring Boot app is running slow in prod — which commands do you reach for first?"],
    ["Lab", "SSH into a remote box and tail a live application log"],
  ]},
  { day: 2, week: "Processes & Services", rows: [
    ["Linux", "Learn ps, top, kill, and how systemd manages a running service"],
    ["Interview", "How do you find and kill the process holding port 8080?"],
    ["Lab", "Restart a service using systemctl and check its status/logs"],
  ]},
  { day: 3, week: "Shell Scripting Essentials", rows: [
    ["Linux", "Write a basic bash script with variables, conditionals, and a loop"],
    ["Interview", "Why would you write a shell script instead of doing something manually in a pipeline?"],
    ["Lab", "Write a script that checks if your API's /health endpoint returns 200"],
  ]},
  { day: 4, week: "Permissions, Env & Debugging", rows: [
    ["Linux", "Understand file permissions, environment variables, and PATH"],
    ["Interview", "An app works locally but fails in prod with 'permission denied' — how do you debug it?"],
    ["Lab", "Set an environment variable and read it inside a running app"],
  ]},

  // ── Week 2 · Networking for Backend Devs (Days 5-9) ─────────────────────
  { day: 5, week: "TCP/IP & DNS", rows: [
    ["Networking", "Understand IP addressing, ports, and how DNS resolves a domain name"],
    ["Interview", "Walk through what happens between typing a URL and your Controller receiving the request"],
    ["Lab", "Use nslookup/dig to resolve a domain and inspect the DNS record types"],
  ]},
  { day: 6, week: "TCP Handshake & Connections", rows: [
    ["Networking", "Understand the TCP 3-way handshake and TCP vs UDP trade-offs"],
    ["Interview", "Why does a REST API use TCP, and when would you reach for UDP instead?"],
    ["Lab", "Capture a TCP handshake for an HTTP request using tcpdump or Wireshark"],
  ]},
  { day: 7, week: "HTTP & TLS", rows: [
    ["Networking", "Understand HTTP methods, status codes, headers, and the TLS handshake"],
    ["Interview", "What's the difference between 401 and 403, and when would your API return each?"],
    ["Lab", "Use curl -v to inspect the full request/response headers of a public API"],
  ]},
  { day: 8, week: "Load Balancing", rows: [
    ["Networking", "Understand Layer 4 vs Layer 7 load balancing and common algorithms (round robin, least connections)"],
    ["Interview", "Your service is stateful (sessions in memory) — how does load balancing break, and how do you fix it?"],
    ["Lab", "Put two app instances behind an Nginx load balancer and watch requests alternate"],
  ]},
  { day: 9, week: "Security Groups & Firewalls", rows: [
    ["Networking", "Understand firewalls, security groups, and why services shouldn't be publicly exposed by default"],
    ["Interview", "Your DB is reachable from the public internet — what's wrong and how do you fix it?"],
    ["Lab", "Configure a security group so only your app server can reach your DB port"],
  ]},

  // ── Week 3 · Git (Days 10-12) ───────────────────────────────────────────
  { day: 10, week: "Git Fundamentals", rows: [
    ["Git", "Master commit, branch, diff, and writing a clean .gitignore"],
    ["Interview", "Explain git merge vs git rebase — when do you use each on a team?"],
    ["Lab", "Create a feature branch, make conflicting changes, and resolve a merge conflict"],
  ]},
  { day: 11, week: "Branching in a Team", rows: [
    ["Git", "Learn trunk-based development vs Git Flow, and PR-based workflows"],
    ["Interview", "How would you structure branches for a team shipping to prod multiple times a day?"],
    ["Lab", "Open a PR, request review, and squash-merge it"],
  ]},
  { day: 12, week: "Fixing Mistakes in Git", rows: [
    ["Git", "Practice git revert, cherry-pick, and interactive rebase"],
    ["Interview", "You just pushed a broken commit to main — walk through how you fix it safely"],
    ["Lab", "Revert a bad commit on a shared branch without rewriting history"],
  ]},

  // ── Week 4 · Docker (Days 13-20) — heavy weight, core backend-dev skill ─
  { day: 13, week: "Containers vs VMs", rows: [
    ["Docker", "Understand what a container actually is and how it differs from a VM"],
    ["Interview", "Why is a container faster to start than a VM?"],
    ["Lab", "Install Docker and run your first container (docker run hello-world)"],
  ]},
  { day: 14, week: "Writing a Dockerfile", rows: [
    ["Docker", "Write a Dockerfile for your Spring Boot / Node app"],
    ["Interview", "What's the difference between CMD and ENTRYPOINT in a Dockerfile?"],
    ["Lab", "Containerize a real app and run it, exposing the correct port"],
  ]},
  { day: 15, week: "Multi-stage Builds", rows: [
    ["Docker", "Learn multi-stage builds to keep production images small"],
    ["Interview", "Why would you use a multi-stage build for a Java or Node app specifically?"],
    ["Lab", "Rewrite your Dockerfile as a multi-stage build and compare image sizes"],
  ]},
  { day: 16, week: "Docker Networking", rows: [
    ["Docker", "Understand bridge networks and how containers talk to each other"],
    ["Interview", "Your app container can't reach your DB container — what's the likely cause?"],
    ["Lab", "Run an app container and a DB container on the same custom network"],
  ]},
  { day: 17, week: "Volumes & Persistence", rows: [
    ["Docker", "Understand volumes vs bind mounts, and why containers are ephemeral by default"],
    ["Interview", "Why does data disappear when a DB container restarts, and how do you prevent it?"],
    ["Lab", "Attach a volume to a Postgres container and confirm data survives a restart"],
  ]},
  { day: 18, week: "Docker Compose", rows: [
    ["Docker", "Write a docker-compose.yml to run your app + DB + cache together locally"],
    ["Interview", "Why is Docker Compose useful for local dev but not usually for production?"],
    ["Lab", "Bring up your full local dev stack with a single docker compose up"],
  ]},
  { day: 19, week: "Image Size & Caching", rows: [
    ["Docker", "Learn layer caching, .dockerignore, and picking a slim base image"],
    ["Interview", "Your CI build is slow because the image rebuilds every dependency each time — how do you fix it?"],
    ["Lab", "Reorder your Dockerfile so dependency install is cached and code changes rebuild fast"],
  ]},
  { day: 20, week: "Container Basics: Security & Debugging", rows: [
    ["Docker", "Learn why running as root inside a container is risky, and how to avoid it"],
    ["Interview", "A container keeps crashing on startup — how do you debug it without redeploying repeatedly?"],
    ["Lab", "Exec into a running container and inspect logs/env to debug a failure"],
  ]},

  // ── Week 5 · CI/CD (Days 21-26) ─────────────────────────────────────────
  { day: 21, week: "CI/CD Concepts", rows: [
    ["CI/CD", "Understand the difference between Continuous Integration and Continuous Deployment"],
    ["Interview", "What's the difference between continuous delivery and continuous deployment?"],
    ["Lab", "Diagram the pipeline stages for a typical backend service (build → test → deploy)"],
  ]},
  { day: 22, week: "Writing a Pipeline", rows: [
    ["CI/CD", "Write a GitHub Actions workflow that runs tests on every pull request"],
    ["Interview", "How would you make sure broken code never reaches main?"],
    ["Lab", "Add a workflow that fails the build if unit tests fail"],
  ]},
  { day: 23, week: "Build & Publish Images", rows: [
    ["CI/CD", "Extend the pipeline to build and push a Docker image on merge"],
    ["Interview", "How do you avoid hardcoding secrets (DB passwords, API keys) inside a CI pipeline?"],
    ["Lab", "Push a built image to a container registry from your pipeline using a secret token"],
  ]},
  { day: 24, week: "Deployment Strategies", rows: [
    ["CI/CD", "Understand rolling, blue-green, and canary deployments"],
    ["Interview", "Explain blue-green vs canary deployment — which would you pick for a risky change and why?"],
    ["Lab", "Simulate a rolling deploy locally by swapping two container versions with zero downtime"],
  ]},
  { day: 25, week: "Rollbacks & Feature Flags", rows: [
    ["CI/CD", "Learn how automated rollbacks work, and how feature flags decouple deploy from release"],
    ["Interview", "A deploy just broke prod — walk through your first 5 minutes of response"],
    ["Lab", "Add a simple feature flag to toggle a code path without redeploying"],
  ]},
  { day: 26, week: "CI/CD in Practice", rows: [
    ["CI/CD", "Review a real-world pipeline end-to-end: lint → test → build → scan → deploy"],
    ["Interview", "How would you speed up a CI pipeline that takes 25 minutes per run?"],
    ["Lab", "Parallelize two independent jobs (e.g. lint and unit tests) in your workflow"],
  ]},

  // ── Week 6 · AWS for Backend Devs (Days 27-34) ──────────────────────────
  { day: 27, week: "IAM Basics", rows: [
    ["AWS", "Understand IAM users, roles, and policies at a level you'd actually use day-to-day"],
    ["Interview", "Why should your app use an IAM role instead of hardcoded AWS access keys?"],
    ["Lab", "Attach an IAM role to an EC2 instance so your app can read from S3 without keys"],
  ]},
  { day: 28, week: "EC2 Basics", rows: [
    ["AWS", "Understand EC2 instances, security groups, and SSH access"],
    ["Interview", "How would you deploy a Spring Boot jar to a fresh EC2 instance?"],
    ["Lab", "Launch an EC2 instance and run your containerized app on it"],
  ]},
  { day: 29, week: "S3 for App Data", rows: [
    ["AWS", "Understand S3 buckets, storage classes, and pre-signed URLs"],
    ["Interview", "How would you let users upload profile pictures directly to S3 without routing files through your backend?"],
    ["Lab", "Generate a pre-signed URL and upload a file directly to S3 with it"],
  ]},
  { day: 30, week: "RDS Basics", rows: [
    ["AWS", "Understand managed databases (RDS), backups, and Multi-AZ at a conceptual level"],
    ["Interview", "Why would you use RDS instead of running Postgres yourself on an EC2 box?"],
    ["Lab", "Launch an RDS Postgres instance and connect your local app to it"],
  ]},
  { day: 31, week: "Load Balancers & Auto Scaling", rows: [
    ["AWS", "Understand an Application Load Balancer and how Auto Scaling Groups work"],
    ["Interview", "Traffic 10x'd overnight — how does your infra handle it without you touching anything?"],
    ["Lab", "Put two EC2 instances behind an ALB and confirm traffic is distributed"],
  ]},
  { day: 32, week: "Serverless Basics", rows: [
    ["AWS", "Understand Lambda and API Gateway, and when serverless makes sense"],
    ["Interview", "When would you choose Lambda over a always-on Spring Boot service?"],
    ["Lab", "Deploy a small function behind API Gateway and hit it with curl"],
  ]},
  { day: 33, week: "Caching & Queues", rows: [
    ["AWS", "Understand ElastiCache (Redis) and SQS at a usage level"],
    ["Interview", "Your API is hammered by repeated identical reads — how do you protect the DB?"],
    ["Lab", "Add a Redis cache in front of a slow DB query and measure the speedup"],
  ]},
  { day: 34, week: "Cost & Config Awareness", rows: [
    ["AWS", "Understand where cloud costs come from (compute, storage, data transfer) at a high level"],
    ["Interview", "Your AWS bill tripled this month — what would you check first?"],
    ["Lab", "Set up a CloudWatch billing alarm so you'd get notified before it happens again"],
  ]},

  // ── Week 7 · Kubernetes Concepts (Days 35-39) — concepts, not ops ───────
  { day: 35, week: "Why Kubernetes", rows: [
    ["Kubernetes", "Understand what problem Kubernetes solves that Docker Compose doesn't"],
    ["Interview", "When would you reach for Kubernetes instead of just running containers on a few EC2 boxes?"],
    ["Lab", "Set up a local cluster with Minikube or kind"],
  ]},
  { day: 36, week: "Pods & Deployments", rows: [
    ["Kubernetes", "Understand Pods, Deployments, and how K8s keeps a desired number of replicas running"],
    ["Interview", "One of your pods crashes — what does Kubernetes do automatically, and what doesn't it do?"],
    ["Lab", "Deploy your app's Docker image to the cluster and scale it to 3 replicas"],
  ]},
  { day: 37, week: "Services & Config", rows: [
    ["Kubernetes", "Understand how a Service gives pods a stable network identity, and how ConfigMaps/Secrets inject config"],
    ["Interview", "Why can't you just hit a pod's IP directly from another service?"],
    ["Lab", "Expose your Deployment via a Service and inject a config value from a ConfigMap"],
  ]},
  { day: 38, week: "Health Checks & Scaling", rows: [
    ["Kubernetes", "Understand liveness/readiness probes and how the Horizontal Pod Autoscaler works at a conceptual level"],
    ["Interview", "Difference between a liveness probe and a readiness probe — what happens if you mix them up?"],
    ["Lab", "Add a readiness probe pointing at your app's /health endpoint"],
  ]},
  { day: 39, week: "Reading K8s in Production", rows: [
    ["Kubernetes", "Practice reading kubectl describe / logs output to diagnose a failing deployment"],
    ["Interview", "A pod is stuck in CrashLoopBackOff in prod — what's your first command, and what are you looking for?"],
    ["Lab", "Break a deployment on purpose and diagnose it using only kubectl commands"],
  ]},

  // ── Week 8 · Kafka (Days 40-44) — heavily asked in backend interviews ──
  { day: 40, week: "Why Message Queues", rows: [
    ["Kafka", "Understand why you'd decouple services with a message broker instead of direct API calls"],
    ["Interview", "Why would you put Kafka between your order service and your notification service instead of calling it directly?"],
    ["Lab", "Run a local Kafka broker with Docker Compose and create your first topic"],
  ]},
  { day: 41, week: "Topics, Partitions & Ordering", rows: [
    ["Kafka", "Understand topics, partitions, and how partitioning affects message ordering"],
    ["Interview", "Why does Kafka guarantee ordering within a partition but not across an entire topic?"],
    ["Lab", "Produce messages with the same key and confirm they land in the same partition"],
  ]},
  { day: 42, week: "Producers & Consumers", rows: [
    ["Kafka", "Understand consumer groups and how Kafka scales consumption horizontally"],
    ["Interview", "You have 3 consumers in a group reading a 3-partition topic — what happens if you add a 4th?"],
    ["Lab", "Write a producer and a consumer, and watch offsets advance as messages are consumed"],
  ]},
  { day: 43, week: "Delivery Guarantees", rows: [
    ["Kafka", "Understand at-most-once, at-least-once, and exactly-once delivery semantics"],
    ["Interview", "Your consumer processes a message but crashes before committing the offset — what happens on restart?"],
    ["Lab", "Simulate a duplicate message and make your consumer idempotent"],
  ]},
  { day: 44, week: "Kafka vs Alternatives", rows: [
    ["Kafka", "Understand when Kafka is the right tool vs a simpler queue like SQS/RabbitMQ"],
    ["Interview", "Design a notification system (email + SMS + push) using Kafka — talk through the flow"],
    ["Lab", "Sketch the architecture for an event-driven order pipeline using Kafka"],
  ]},

  // ── Week 9 · Monitoring & Observability (Days 45-47) ───────────────────
  { day: 45, week: "Logs, Metrics & Traces", rows: [
    ["Monitoring", "Understand the three pillars of observability: logs, metrics, and traces"],
    ["Interview", "Your API is slow for some users but not others — logs alone don't help. What do you reach for next?"],
    ["Lab", "Add structured logging to an endpoint and grep it for a specific request ID"],
  ]},
  { day: 46, week: "Metrics & Dashboards", rows: [
    ["Monitoring", "Learn the basics of Prometheus-style metrics and building a Grafana dashboard"],
    ["Interview", "What metrics would you put on a dashboard for a payments API, and why those?"],
    ["Lab", "Expose a basic /metrics endpoint from your app and scrape it with Prometheus"],
  ]},
  { day: 47, week: "Alerting", rows: [
    ["Monitoring", "Understand how alerting rules work and how to avoid alert fatigue"],
    ["Interview", "How would you design an alert for 'error rate is too high' without it firing on every blip?"],
    ["Lab", "Set an alert rule that fires only if error rate stays elevated for 5 minutes"],
  ]},

  // ── Week 10 · Terraform Awareness (Days 48-49) — light touch ───────────
  { day: 48, week: "Infrastructure as Code Concepts", rows: [
    ["Terraform", "Understand what Infrastructure as Code means and why teams use it over manual console clicks"],
    ["Interview", "Why is 'someone manually changed a setting in the AWS console' considered a bad practice?"],
    ["Lab", "Read an existing Terraform file and identify what resources it creates"],
  ]},
  { day: 49, week: "Reading & Reviewing Terraform", rows: [
    ["Terraform", "Learn to read a terraform plan output and understand what will change before applying"],
    ["Interview", "A teammate's Terraform PR would delete and recreate the production DB — how do you catch that in review?"],
    ["Lab", "Run terraform plan on a sample config and identify a destructive change before it's applied"],
  ]},

  // ── Week 11 · DevSecOps Awareness (Day 50) ──────────────────────────────
  { day: 50, week: "Secrets & Basic Security Hygiene", rows: [
    ["DevSecOps", "Understand why secrets shouldn't live in code or .env files committed to git"],
    ["Interview", "You just found an AWS key hardcoded in a 6-month-old commit — walk through what you do"],
    ["Lab", "Move a hardcoded API key into a secrets manager and reference it via environment injection"],
  ]},
];

export const DEVOPS_DAYS = RAW_DAYS.flatMap(({ day, week, rows }) =>
  rows.map(([category, task]) => ({
    day,
    date: `Day ${day}`,
    week,
    category,
    task,
  }))
);

export const DEVOPS_DAYS_MAP = DEVOPS_DAYS.reduce((acc, item) => {
  if (!acc[item.day]) acc[item.day] = [];
  acc[item.day].push(item);
  return acc;
}, {});

// Category → points (not yet wired into helpers.js — see App review notes).
// Weighted so Docker/CI-CD/Kafka/AWS (highest interview relevance for
// backend devs) count for more than concept-awareness categories.
export const DEVOPS_CATEGORY_POINTS = {
  Linux: 1,
  Networking: 2,
  Git: 1,
  Docker: 3,
  "CI/CD": 3,
  AWS: 3,
  Kubernetes: 2,
  Kafka: 3,
  Monitoring: 2,
  Terraform: 1,
  DevSecOps: 1,
  Interview: 1,
  Lab: 2,
};