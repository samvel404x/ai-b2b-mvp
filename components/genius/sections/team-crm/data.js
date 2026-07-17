export const CRM_METRICS = [
  { id: "open", title: "Open Tasks", value: "67", change: "5 vs last week", trend: "up", color: "primary", sparkline: [40, 45, 42, 55, 60, 67] },
  { id: "progress", title: "In Progress", value: "23", change: "5 vs last week", trend: "up", color: "primary", sparkline: [15, 18, 16, 20, 22, 23] },
  { id: "waiting", title: "Waiting Review", value: "14", change: "3 vs last week", trend: "down", color: "warning", sparkline: [20, 18, 19, 16, 15, 14] },
  { id: "submitted", title: "Submitted Today", value: "8", target: "15", type: "circular", progress: 53, color: "primary" },
  { id: "blocked", title: "Blocked", value: "4", change: "2 vs last week", trend: "down", color: "critical", sparkline: [8, 7, 5, 6, 5, 4] },
  { id: "sla", title: "SLA Health", value: "96%", change: "4% vs last week", trend: "up", color: "primary", sparkline: [88, 90, 89, 92, 95, 96] },
  { id: "capacity", title: "Team Capacity", value: "78%", subtitle: "Monthly", color: "primary", sparkline: [70, 72, 75, 74, 76, 78] },
  { id: "throughput", title: "Throughput", value: "183", subtitle: "Tasks this week", type: "bar", data: [20, 35, 25, 40, 30, 45, 35] },
];

export const INITIAL_TASKS = [
  // Backlog
  { id: "T-1", title: "Update Vendor Onboarding Checklist", team: "Ops Team", priority: "Low", priorityColor: "muted", assignee: "Ken R.", date: "Jun 02", checklist: "1/5", attachments: 2, comments: 2, status: "backlog" },
  { id: "T-2", title: "Q2 Contract Renewal Tracker", team: "Finance Team", priority: "Low", priorityColor: "muted", assignee: "Lena N.", date: "Jun 03", checklist: "0/6", attachments: 0, comments: 1, status: "backlog" },
  { id: "T-3", title: "Warehouse Capacity Plan", team: "Logistics Team", priority: "Low", priorityColor: "muted", assignee: "James B.", date: "Jun 05", checklist: "0/4", attachments: 0, comments: 0, status: "backlog" },
  
  // To Do
  { id: "T-4", title: "Daily Cash Summary Report", team: "Finance Team", priority: "High", priorityColor: "critical", assignee: "David P.", date: "May 20", checklist: "0/7", attachments: 1, comments: 1, tag: "SLA", status: "todo" },
  { id: "T-5", title: "Procurement Request - Packaging Materials", team: "Procurement", priority: "Medium", priorityColor: "warning", assignee: "Sarah M.", date: "May 21", checklist: "0/6", attachments: 0, comments: 2, tag: "SLA", status: "todo" },
  { id: "T-6", title: "IT Asset Inventory Update", team: "IT Team", priority: "Low", priorityColor: "muted", assignee: "Michael T.", date: "May 22", checklist: "0/4", attachments: 0, comments: 0, status: "todo" },
  
  // In Progress
  { id: "T-7", title: "Daily Supply Intake - 50kg Mushrooms", team: "Operations", priority: "High", priorityColor: "critical", assignee: "Sarah M.", date: "May 21", progress: 42, checklist: "3/7", attachments: 0, comments: 0, tag: "SLA", status: "in-progress", isSelected: true },
  { id: "T-8", title: "Vendor Contract Review - Farm Fresh Co.", team: "Legal Team", priority: "High", priorityColor: "critical", assignee: "Lena N.", date: "May 22", progress: 67, checklist: "4/6", attachments: 3, comments: 2, tag: "AI", status: "in-progress" },
  { id: "T-9", title: "Equipment Maintenance Check", team: "Facilities", priority: "Medium", priorityColor: "warning", assignee: "Ken R.", date: "May 22", progress: 40, checklist: "2/5", attachments: 1, comments: 2, status: "in-progress" },
  
  // Review
  { id: "T-10", title: "Warehouse Stock Audit", team: "Ops Team", priority: "High", priorityColor: "critical", assignee: "James B.", date: "May 21", progress: 63, checklist: "3/5", attachments: 4, comments: 2, tag: "AI", status: "review" },
  { id: "T-11", title: "Route Optimization - Traffic Delay Alerts", team: "Logistics", priority: "Medium", priorityColor: "warning", assignee: "David P.", date: "May 20", progress: 60, checklist: "3/5", attachments: 1, comments: 1, status: "review" },
  { id: "T-12", title: "SLA Breach Analysis - May", team: "Analytics Team", priority: "Medium", priorityColor: "warning", assignee: "Sarah M.", date: "May 23", progress: 50, checklist: "2/4", attachments: 0, comments: 1, status: "review" },
  
  // Submitted
  { id: "T-13", title: "Finance Report - May", team: "Finance Team", priority: "High", priorityColor: "critical", assignee: "David P.", date: "May 19", checklist: "7/7", attachments: 2, comments: 1, tag: "AI", status: "submitted" },
  { id: "T-14", title: "Stock Reconciliation Report", team: "Warehouse", priority: "Medium", priorityColor: "warning", assignee: "James B.", date: "May 19", checklist: "6/6", attachments: 1, comments: 0, tag: "AI", status: "submitted" },
  { id: "T-15", title: "Procurement PO-2025-1943", team: "Procurement", priority: "Low", priorityColor: "muted", assignee: "Sarah M.", date: "May 18", checklist: "6/6", attachments: 0, comments: 1, status: "submitted" },

  // Completed
  { id: "T-16", title: "HR Attendance Summary - May Week 3", team: "HR Team", priority: "Low", priorityColor: "muted", assignee: "Ken R.", date: "May 17", checklist: "5/5", attachments: 0, comments: 0, isCompleted: true, status: "completed" },
  { id: "T-17", title: "Onboard New Drivers - Batch 12", team: "HR Team", priority: "Low", priorityColor: "muted", assignee: "Ken R.", date: "May 16", checklist: "8/8", attachments: 0, comments: 0, isCompleted: true, status: "completed" },
  { id: "T-18", title: "Time Efficiency Update", team: "Ops Team", priority: "Medium", priorityColor: "warning", assignee: "David P.", date: "May 15", checklist: "4/4", attachments: 0, comments: 0, isCompleted: true, status: "completed" },
];

export const TEAM_WORKLOAD = [
  { name: "Sarah Miller", load: 13, max: 20 },
  { name: "David Patel", load: 11, max: 20 },
  { name: "James Brown", load: 20, max: 20, isMaxed: true },
  { name: "Ken Roberts", load: 9, max: 20 },
  { name: "Lena Nguyen", load: 7, max: 20 },
];

export const SLA_ALERTS = [
  { title: "Daily Supply Intake - 50kg Mushrooms", status: "At risk - Due in 1 day", priority: "High" },
  { title: "Procurement Request - Packaging Materials", status: "At risk - Due in 2 days", priority: "High" },
  { title: "Warehouse Stock Audit", status: "At risk - Due in 1 day", priority: "High" },
  { title: "Route Optimization - Traffic Delay Alerts", status: "At risk - Due in 2 days", priority: "Medium" },
];

export const RECENT_ACTIVITY = [
  { user: "Sarah Miller", action: "submitted", target: "Daily Supply Intake", time: "May 20, 10:12 AM" },
  { user: "David Patel", action: "completed", target: "Finance Report - May", time: "May 20, 9:15 AM" },
  { user: "James Brown", action: "commented on", target: "Stock Audit", time: "May 19, 4:22 PM" },
  { user: "Ken Roberts", action: "updated", target: "Equipment Check", time: "May 19, 2:10 PM" },
];

export const REVIEW_QUEUE = [
  { title: "Vendor Contract Review - Farm Fresh Co.", team: "Legal Team", date: "Submitted May 20", priority: "High" },
  { title: "Warehouse Stock Audit", team: "Ops Team", date: "Submitted May 20", priority: "High" },
  { title: "HR Attendance Summary - Week 3", team: "HR Team", date: "Submitted May 19", priority: "Medium" },
  { title: "SLA Breach Analysis - May", team: "Analytics Team", date: "Submitted May 19", priority: "Medium" },
];
