export const DEVOPS_DAYS = [
  // Day 1
  {
    day: 1,
    date: "Day 1",
    week: "Linux Fundamentals",
    category: "Linux",
    task: "Understand Linux filesystem, directories and navigation"
  },
  {
    day: 1,
    date: "Day 1",
    week: "Linux Fundamentals",
    category: "Linux",
    task: "Practice ls, cd, pwd, mkdir, rm, cp and mv"
  },
  {
    day: 1,
    date: "Day 1",
    week: "Linux Fundamentals",
    category: "Interview",
    task: "Explain Process vs Thread in your own words"
  },
  {
    day: 1,
    date: "Day 1",
    week: "Linux Fundamentals",
    category: "Lab",
    task: "Install WSL Ubuntu and verify bash works"
  },

  // Day 2
  {
    day: 2,
    date: "Day 2",
    week: "Linux Processes",
    category: "Linux",
    task: "Learn ps, top, htop, kill, systemctl"
  },
  {
    day: 2,
    date: "Day 2",
    week: "Linux Processes",
    category: "Interview",
    task: "Find which process is using port 8080"
  },
  {
    day: 2,
    date: "Day 2",
    week: "Linux Processes",
    category: "Lab",
    task: "Start Spring Boot and inspect logs using journalctl"
  },

  // Day 3
  {
    day: 3,
    date: "Day 3",
    week: "Bash + SSH",
    category: "Linux",
    task: "Write your first bash script"
  },
  {
    day: 3,
    date: "Day 3",
    week: "Bash + SSH",
    category: "Interview",
    task: "Difference between stdout and stderr"
  },
  {
    day: 3,
    date: "Day 3",
    week: "Bash + SSH",
    category: "Lab",
    task: "Create deploy.sh and health-check.sh"
  }
];

export const DEVOPS_DAYS_MAP = DEVOPS_DAYS.reduce((acc, item) => {
  if (!acc[item.day]) acc[item.day] = [];
  acc[item.day].push(item);
  return acc;
}, {});